import { BaseCandleDevice } from '../../lib/BaseCandleDevice';
import { IR_COMMANDS, CommandSet } from '../../lib/ir-commands';

/**
 * Action - 8 Button Remote device
 */
module.exports = class ActionEightButtonDevice extends BaseCandleDevice {

  /**
   * Get the IR command set for Action 8-button remote
   */
  protected getCommands(): CommandSet {
    return IR_COMMANDS.ACTION_8_BUTTON;
  }

};
