import Homey from 'homey';

module.exports = class MyDriver extends Homey.Driver {

  /**
   * onInit is called when the driver is initialized.
   */
  async onInit() {
    this.log('MyDriver has been initialized');

    // Register flow card actions
    this.homey.flow.getActionCard('on')
      .registerRunListener(async (args) => {
        const { device } = args;
        this.log('On flow action triggered');
        
        // Trigger the capability on the device
        await device.triggerCapabilityListener('on', true);
        
        return true;
      });

    this.homey.flow.getActionCard('off')
      .registerRunListener(async (args) => {
        const { device } = args;
        this.log('Off flow action triggered');
        
        // Trigger the capability on the device
        await device.triggerCapabilityListener('off', true);
        
        return true;
      });

    this.homey.flow.getActionCard('timer')
      .registerRunListener(async (args) => {
        const { device, timer_cmd } = args;
        this.log('Timer flow action triggered:', timer_cmd);
        
        // Trigger the capability on the device
        await device.triggerCapabilityListener(timer_cmd, true);
        
        return true;
      });


  }

  /**
   * onPairListDevices is called when a user is adding a device and the 'list_devices' view is called.
   * This should return an array with the data of devices that are available for pairing.
   */
  async onPairListDevices() {
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

};
