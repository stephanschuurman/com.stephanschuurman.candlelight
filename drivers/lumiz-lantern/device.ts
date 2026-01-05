import { BaseCandleDevice } from '../../lib/BaseCandleDevice';
import { IR_COMMANDS, CommandSet } from '../../lib/ir-commands';

/**
 * Lumiz Lantern device
 */
module.exports = class LumizLanternDevice extends BaseCandleDevice {

  /**
   * Get the IR command set for Lumiz Lantern
   */
  protected getCommands(): CommandSet {
    return IR_COMMANDS.LUMIZ_LANTERN;
  }

  /**
   * Register dim controls
   */
  async onInit() {
    await super.onInit();

    this.registerCapabilityListener('button.dim_down',
      (value: boolean, opts: any) => this.onCapabilityDim(value, opts, 'DIM_DOWN'));
    this.registerCapabilityListener('button.dim_up',
      (value: boolean, opts: any) => this.onCapabilityDim(value, opts, 'DIM_UP'));
  }

  /**
   * Handle dim capabilities
   */
  private async onCapabilityDim(
    value: boolean,
    opts: any,
    commandKey: 'DIM_DOWN' | 'DIM_UP',
  ): Promise<void> {
    this.log(`[${this.constructor.name}] Dim button pressed:`, commandKey);

    const commands = this.getCommands();
    const commandCode = commands[commandKey];
    if (commandCode === undefined) {
      this.log(`[${this.constructor.name}] No command defined for dim:`, commandKey);
      return;
    }

    await this.ir.sendCommandRawQueued(commandCode);
  }

};
