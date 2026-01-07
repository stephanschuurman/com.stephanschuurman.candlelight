'use strict';

import Homey from 'homey';

module.exports = class CandleLightApp extends Homey.App {

  async onInit() {
    this.log('✨', this.homey.__('app.initialized'));

    const allCandlesCard = this.homey.flow.getActionCard('all_candles');
    allCandlesCard.registerRunListener(async (args) => {
      const state = args.state === 'on' ? 'on' : 'off';
      const capabilityId = state === 'on' ? 'button.on' : 'button.off';
      const driverIds = this.getCandleDriverIds();

      for (const driverId of driverIds) {
        const driver = this.getDriverSafe(driverId);
        if (!driver) {
          continue;
        }

        const devices = driver.getDevices();
        for (const device of devices) {
          try {
            await device.triggerCapabilityListener(capabilityId, true);
          } catch (error) {
            this.error(`[${this.constructor.name}] Failed to set ${capabilityId} for ${device.getName()}`, error);
          }
        }
      }

      return true;
    });
  }

  private async logSatelliteAntennas(attempt: number = 0): Promise<void> {
    const deviceCount = this.getCandleDevicesCount(true);
    if (deviceCount === 0 && attempt < 10) {
      setTimeout(() => this.logSatelliteAntennas(attempt + 1), 500);
      return;
    }

    const antennas = this.getUniqueSatelliteAntennas(true);
    if (antennas.length === 0) {
      if (attempt < 5) {
        setTimeout(() => this.logSatelliteAntennas(attempt + 1), 500);
        return;
      }
      this.log(`[${this.constructor.name}] No satellite antennas found`);
      return;
    }

    this.log(
      `[${this.constructor.name}] Satellite antennas:`,
      antennas.join(', '),
    );

    for (const antennaId of antennas) {
      const name = await this.getDeviceNameById(antennaId);
      if (name) {
        this.log(`[${this.constructor.name}] ${antennaId} -> ${name}`);
      }
    }
  }

  private getCandleDriverIds(): string[] {
    return [
      'hema-tealight',
      'deluxe-homeart',
      'lumiz-lantern',
      'action-3-button',
      'action-8-button',
      'action-10-button',
      'lumineo-3-button',
      'anna-2-button',
      'anna-10-button',
    ];
  }

  private getUniqueSatelliteAntennas(silentDrivers: boolean = false): string[] {
    const antennas = new Set<string>();
    const driverIds = this.getCandleDriverIds();

    for (const driverId of driverIds) {
      const driver = this.getDriverSafe(driverId, silentDrivers);
      if (!driver) continue;

      const devices = driver.getDevices();
      for (const device of devices) {
        const antennaId = this.getSatelliteAntennaId(device);
        if (antennaId) antennas.add(antennaId);
      }
    }

    return Array.from(antennas);
  }

  private getCandleDevicesCount(silentDrivers: boolean = false): number {
    let count = 0;
    const driverIds = this.getCandleDriverIds();
    for (const driverId of driverIds) {
      const driver = this.getDriverSafe(driverId, silentDrivers);
      if (!driver) continue;
      count += driver.getDevices().length;
    }
    return count;
  }

  private getSatelliteAntennaId(device: any): string | null {
    const settingId = device.getSetting?.('satellite_mode_antenna');
    if (typeof settingId === 'string' && settingId.trim() !== '') {
      return settingId.trim();
    }

    const settings = device.getSettings?.();
    const settingsId = settings?.satellite_mode_antenna;
    if (typeof settingsId === 'string' && settingsId.trim() !== '') {
      return settingsId.trim();
    }

    const storeId = device.getStoreValue?.('satellite_mode_antenna');
    if (typeof storeId === 'string' && storeId.trim() !== '') {
      return storeId.trim();
    }

    return null;
  }

  private getDriverSafe(driverId: string, silent: boolean = false): any | null {
    try {
      return this.homey.drivers.getDriver(driverId);
    } catch (error) {
      if (!silent) {
        this.log(`[${this.constructor.name}] Driver not initialized: ${driverId}`);
      }
      return null;
    }
  }

  private async getDeviceNameById(deviceId: string): Promise<string | null> {
    const id = String(deviceId || '').trim();
    if (!id) return null;

    const devicesApi = (this.homey as any).devices;
    if (!devicesApi || typeof devicesApi.getDevices !== 'function') {
      return null;
    }

    const devices = await devicesApi.getDevices();
    const device = devices[id];
    return device ? device.name : null;
  }

}
