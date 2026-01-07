import Homey from 'homey';
import { IRUtils } from '../../lib/IRUtils';

module.exports = class TestRemoteDriver extends Homey.Driver {

  /**
   * onInit is called when the driver is initialized.
   */
  async onInit() {
    this.log(`[${this.constructor.name}] has been initialized`);

    // Register flow card actions
    this.homey.flow.getActionCard('test-remote_send_ir_command')
      .registerRunListener(async (args) => {
        const protocol = String(args.protocol || '').toLowerCase();
        if (protocol !== 'nec') {
          throw new Error(`Unsupported protocol: ${args.protocol}`);
        }

        const address = this.parseByte(args.address);
        if (address === null) {
          throw new Error('Invalid address. Use 0x00..0xFF or 0..255.');
        }

        const command = this.parseByte(args.command);
        if (command === null) {
          throw new Error('Invalid command. Use 0x00..0xFF or 0..255.');
        }

        const device = this.getDevices()[0] as any;
        if (!device || !device.ir) {
          throw new Error('No test remote device available to send IR command.');
        }

        // if protocol is NEC, convert to Homey bits
        const frameData = IRUtils.necCommandToHomeyBits(command, address);

        this.log(`Sending ${protocol.toUpperCase()} IR command: address=0x${address.toString(16).padStart(2, '0')} command=0x${command.toString(16).padStart(2, '0')}`);

        await device.ir.sendRawCommand(frameData, false);
        return true;
      });

  }

  /**
   * onPairListDevices is called when a user is adding a device and the 'list_devices' view is called.
   * This should return an array with the data of devices that are available for pairing.
   */
  async onPairListDevices() {
    this.log('Pairing: listing devices');

    return [
      // Example device data, note that `store` is optional
      // {
      //   name: 'My Device',
      //   data: {
      //     id: 'my-device',
      //   },
      //   store: {
      //     address: '127.0.0.1',
      //   },
      // },
    ];
  }

  private parseByte(value: unknown): number | null {
    const raw = String(value ?? '').trim();
    if (!raw) return null;

    let parsed: number;
    if (/^0x[0-9a-f]+$/i.test(raw)) {
      parsed = parseInt(raw, 16);
    } else if (/^[0-9]+$/.test(raw)) {
      parsed = parseInt(raw, 10);
    } else {
      return null;
    }

    if (Number.isNaN(parsed) || parsed < 0 || parsed > 255) {
      return null;
    }

    return parsed;
  }

};
