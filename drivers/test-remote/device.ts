import Homey from 'homey';
import Infrared from '../../lib/ir';

/**
 * Test Remote device
 */
module.exports = class TestRemoteDevice extends Homey.Device {

  ir!: Infrared;
  private sendTimeout: NodeJS.Timeout | null = null;

  async onInit() {
    this.log(`[${this.constructor.name}] has been initialized`);
    this.ir = new Infrared(this);
    await this.ir.init();
  }

};
