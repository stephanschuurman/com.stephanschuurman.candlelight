'use strict';

import Homey from 'homey';

module.exports = class CandleLightApp extends Homey.App {

  async onInit() {
    this.log('✨', this.homey.__('app.initialized'));
  }

}
