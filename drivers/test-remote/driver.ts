import Homey from 'homey';
import { IRUtils } from '../../lib/IRUtils';
import { RFDevice } from 'homey-rfdriver'; 

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
        if (protocol !== 'nec' && protocol !== 'rc5') {
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

        // TODO: Support multiple devices and allow user to select which device to send the command to
        const device = this.getDevices()[0] as any;
        if (!device || !device.ir) {
          throw new Error('No test remote device available to send IR command.');
        }
        
        this.log(`Sending ${protocol.toUpperCase()} IR command: protocol=${protocol}, address=0x${address.toString(16).padStart(2, '0')}, command=0x${command.toString(16).padStart(2, '0')}`);

        // if protocol is NEC, convert to Homey bits
        let frameData : number[] = [];

        if (protocol === 'nec') {
          frameData = IRUtils.necCommandToHomeyBits(command, address);
          await device.ir.signal == device.homey.rf.getSignalInfrared('nec');
          await device.ir.sendRawCommand(frameData, false);
        } else if (protocol === 'rc5') {
          // TODO: Implement RC5 command conversion and sending


          // frameData = IRUtils.rc5CommandToHomeyBits(command, address);
          // const signal2 = device.homey.rf.getSignalInfrared('rc5-pronto-flinq');

          // // frameData = [ 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0 ,0 ];
          // // frameData = [ 1, 1, 0 ];
          // // // frameData = [ 
          // // //   1, 1, // Start bits
          // // //   1, // Toggle bit (can be 0 or 1, here we use 0 for simplicity)
          // // //   ];


          
          // // console.log('Sending RC5 frame data:', frameData, 
          // //             `(address: 0x${address.toString(16)}, command: 0x${command.toString(16)})`);
          // // await signal2.tx(frameData, { device: device, repetitions: 2 });
          // await signal2.cmd("On", { device: device });
        } else {
          throw new Error(`Unsupported protocol: ${protocol}`);
        }
        
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

  /**
   * parseByte is a helper method to parse a string as a byte (0-255), supporting both decimal and hexadecimal formats.
   * 
   * @param value The string value to parse as a byte.
   * @returns The parsed byte (0-255) or null if invalid.
   */
  private parseByte(value: string): number | null {
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
