import { BaseCandleDevice } from '../../lib/BaseCandleDevice';
import { IR_COMMANDS, CommandSet } from '../../lib/ir-commands';

/**
 * Action - 3 Button Remote device
 */
module.exports = class ActionThreeButtonDevice extends BaseCandleDevice {

  /**
   * Get the IR command set for Action 3-button remote
   */
  protected getCommands(): CommandSet {
    return IR_COMMANDS.ACTION_3_BUTTON;
  }

};
