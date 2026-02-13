import { BaseCandleDevice } from '../../lib/BaseCandleDevice';
import { IR_COMMANDS, CommandSet } from '../../lib/ir-commands';

/**
 * Generic - 13 Button Remote device
 */
module.exports = class GenericThirteenButtonDevice extends BaseCandleDevice {

  /**
   * Get the IR command set for Generic 13-button remote
   */
  protected getCommands(): CommandSet {
    return IR_COMMANDS.GENERIC_13_BUTTON;
  }

  /**
   * Register extra capabilities for timer, mode and brightness controls
   */
  async onInit() {
    await super.onInit();

    this.registerCapabilityListener('button.timer',
      (value: boolean, opts: any) => this.onCapabilityGenericTimer(value, opts));

    const modeCommandKeys = [
      'MODE_1',
      'MODE_2',
      'MODE_3',
      'MODE_4',
      'MODE_5',
      'MODE_6',
      'MODE_7',
      'MODE_8',
    ] as const;

    modeCommandKeys.forEach((commandKey, index) => {
      const capabilityId = `button.mode_${index + 1}`;
      this.registerCapabilityListener(capabilityId,
        (value: boolean, opts: any) => this.onCapabilityMode(value, opts, commandKey));
    });

    this.registerCapabilityListener('button.dim_down',
      (value: boolean, opts: any) => this.onCapabilityDim(value, opts, 'DIM_DOWN'));
    this.registerCapabilityListener('button.dim_up',
      (value: boolean, opts: any) => this.onCapabilityDim(value, opts, 'DIM_UP'));
  }

  /**
   * Handle timer capability
   */
  private async onCapabilityGenericTimer(
    value: boolean,
    opts: any,
  ): Promise<void> {
    this.log(`[${this.constructor.name}] Timer button pressed`);

    const commands = this.getCommands();
    const commandCode = commands.TIMER;
    if (commandCode === undefined) {
      this.log(`[${this.constructor.name}] No command defined for timer`);
      return;
    }

    await this.ir.sendCommandRawQueued(commandCode);
  }

  /**
   * Handle mode capabilities
   */
  private async onCapabilityMode(
    value: boolean,
    opts: any,
    commandKey: 'MODE_1' | 'MODE_2' | 'MODE_3' | 'MODE_4' | 'MODE_5' | 'MODE_6' | 'MODE_7' | 'MODE_8',
  ): Promise<void> {
    this.log(`[${this.constructor.name}] Mode button pressed:`, commandKey);

    const commands = this.getCommands();
    const commandCode = commands[commandKey];
    if (commandCode === undefined) {
      this.log(`[${this.constructor.name}] No command defined for mode:`, commandKey);
      return;
    }

    await this.ir.sendCommandRawQueued(commandCode);
  }

  /**
   * Handle brightness capabilities
   */
  private async onCapabilityDim(
    value: boolean,
    opts: any,
    commandKey: 'DIM_DOWN' | 'DIM_UP',
  ): Promise<void> {
    this.log(`[${this.constructor.name}] Brightness button pressed:`, commandKey);

    const commands = this.getCommands();
    const commandCode = commands[commandKey];
    if (commandCode === undefined) {
      this.log(`[${this.constructor.name}] No command defined for brightness:`, commandKey);
      return;
    }

    await this.ir.sendCommandRawQueued(commandCode);
  }

};
