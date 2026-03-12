import Homey from 'homey';

/**
 * Flinq - 13 Button Remote device
 * Uses RC5 protocol with Pronto Hex encoding due to Manchester encoding issues in Homey
 */
module.exports = class FlinqThirteenButtonDevice extends Homey.Device {

  private signal!: any;
  private commandQueue: Promise<any> = Promise.resolve();
  private queueSize: number = 0;
  private readonly MAX_QUEUE_SIZE: number = 5;
  private lastCommandTime: number = 0;
  private readonly MIN_COMMAND_INTERVAL_MS: number = 100;

  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    this.log(`[${this.constructor.name}] has been initialized`);

    // Ensure legacy devices get the new onoff capability
    await this.migrateCapabilities();

    // Initialize the RC5 Pronto Hex signal
    try {
      this.signal = this.homey.rf.getSignalInfrared('rc5-pronto-flinq');
      this.log('RC5 Pronto signal initialized');
    } catch (error) {
      this.error('Failed to initialize RC5 Pronto signal:', error);
      throw error;
    }

    // Register capability listeners
    this.registerCapabilityListener('onoff', this.onCapabilityOnOff.bind(this));
    this.registerCapabilityListener('button.on', this.onCapabilityOn.bind(this));
    this.registerCapabilityListener('button.off', this.onCapabilityOff.bind(this));

    // Register timer capability listeners
    const timers = ['2h', '4h', '6h', '8h'];
    timers.forEach(timer => {
      const capabilityId = `button.${timer}`;
      if (!this.hasCapability(capabilityId)) return;
      this.registerCapabilityListener(capabilityId,
        (value: boolean, opts: any) => this.onCapabilityTimer(value, opts, timer));
    });

    // Register mode capability listeners
    for (let i = 1; i <= 4; i++) {
      const capabilityId = `button.mode_${i}`;
      if (!this.hasCapability(capabilityId)) continue;
      this.registerCapabilityListener(capabilityId,
        (value: boolean, opts: any) => this.onCapabilityMode(value, opts, i));
    }

    // Register brightness capability listeners
    this.registerCapabilityListener('button.dim_down',
      (value: boolean, opts: any) => this.onCapabilityBrightness(value, opts, 'DIM_DOWN'));
    this.registerCapabilityListener('button.dim_up',
      (value: boolean, opts: any) => this.onCapabilityBrightness(value, opts, 'DIM_UP'));
  }

  /**
   * Migrate capabilities for backward compatibility
   */
  async migrateCapabilities() {
    // Add onoff capability if missing
    if (!this.hasCapability('onoff')) {
      this.log('Adding onoff capability for quick actions');
      await this.addCapability('onoff').catch((err: Error) => {
        this.error('Failed to add onoff capability:', err);
      });
    }
  }

  /**
   * Handle the ON capability
   */
  async onCapabilityOn(value: boolean, opts: any): Promise<void> {
    this.log('ON button pressed');
    await this.sendCommand('ON');
    await this.updateOnOffState(true);
  }

  /**
   * Handle the OFF capability
   */
  async onCapabilityOff(value: boolean, opts: any): Promise<void> {
    this.log('OFF button pressed');
    await this.sendCommand('OFF');
    await this.updateOnOffState(false);
  }

  /**
   * Handle the onoff capability for quick actions
   */
  async onCapabilityOnOff(value: boolean, opts: any): Promise<void> {
    this.log(`onoff capability -> ${value ? 'ON' : 'OFF'}`);
    const swapOnOff = this.getSetting('swap_on_off_commands') === true;
    const command = swapOnOff ? (value ? 'OFF' : 'ON') : (value ? 'ON' : 'OFF');
    await this.sendCommand(command);
    await this.updateOnOffState(value);
  }

  /**
   * Handle timer capability
   */
  async onCapabilityTimer(value: boolean, opts: any, timer: string): Promise<void> {
    this.log(`Timer button pressed: ${timer}`);
    
    const commandName = `TIMER_${timer.toUpperCase()}`;
    
    if (this.getSetting('send_on_before_timer')) {
      await this.sendCommand('ON');
    }
    await this.sendCommand(commandName);
  }

  /**
   * Handle mode capabilities
   */
  async onCapabilityMode(value: boolean, opts: any, modeNumber: number): Promise<void> {
    this.log(`Mode ${modeNumber} button pressed`);
    const commandName = `MODE_${modeNumber}`;
    await this.sendCommand(commandName);
  }

  /**
   * Handle brightness capabilities
   */
  async onCapabilityBrightness(value: boolean, opts: any, command: string): Promise<void> {
    this.log(`Brightness button pressed: ${command}`);
    await this.sendCommand(command);
  }

  /**
   * Send a command using the RC5 Pronto Hex signal
   */
  private async sendCommand(commandName: string): Promise<boolean> {
    // Check queue size limit
    if (this.queueSize >= this.MAX_QUEUE_SIZE) {
      const errorMsg = `Command queue full (${this.MAX_QUEUE_SIZE}). Please wait a moment before sending more commands.`;
      this.error(`Command queue full, dropping command: ${commandName}`);
      
      // Notify user
      try {
        await this.homey.notifications.createNotification({
          excerpt: errorMsg
        });
      } catch (err) {
        this.error('Failed to create notification:', err);
      }
      
      return false;
    }

    // Add command to queue
    this.queueSize++;
    return new Promise((resolve, reject) => {
      this.commandQueue = this.commandQueue
        .then(() => this._sendCommandInternal(commandName))
        .then((result) => {
          this.queueSize--;
          resolve(result);
        })
        .catch((error) => {
          this.queueSize--;
          reject(error);
        });
    });
  }

  /**
   * Internal method that sends the actual IR command
   * Always called via the queue to enforce serialization
   */
  private async _sendCommandInternal(commandName: string): Promise<boolean> {
    try {
      // Rate limiting: wait if needed before sending next command
      const now = Date.now();
      const timeSinceLastCommand = now - this.lastCommandTime;

      if (timeSinceLastCommand < this.MIN_COMMAND_INTERVAL_MS) {
        const waitTime = this.MIN_COMMAND_INTERVAL_MS - timeSinceLastCommand;
        this.log(`⏱️ Rate limiting: waiting ${waitTime}ms before sending command`);
        await this.sleep(waitTime);
      }

      this.log(`📡 Sending IR command: ${commandName}`);

      // Send the command using the Pronto Hex signal
      await this.signal.cmd(commandName, { device: this });

      // Update last command timestamp
      this.lastCommandTime = Date.now();

      return true;
    } catch (error: any) {
      this.error(`Failed to send IR command ${commandName}:`, error);

      // Create user notification for the error
      let errorMsg = `Failed to send IR command: ${commandName}`;
      
      // Rate limiting handling
      if (error.message && error.message.includes('Too Many IR Commands')) {
        this.log('Rate limit exceeded, waiting before retry...');
        errorMsg = `Too many IR commands sent. Please wait a moment and try again.`;
        await this.sleep(100);
      } else if (error.message) {
        errorMsg = `IR command failed: ${error.message}`;
      }

      // Send notification to user
      try {
        await this.homey.notifications.createNotification({
          excerpt: errorMsg
        });
      } catch (notifErr) {
        this.error('Failed to create notification:', notifErr);
      }

      return false;
    }
  }

  /**
   * Update the onoff state
   */
  private async updateOnOffState(state: boolean) {
    if (this.hasCapability('onoff')) {
      await this.setCapabilityValue('onoff', state).catch((err: Error) => {
        this.error('Failed to update onoff state:', err);
      });
    }
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * onAdded is called when the user adds the device
   */
  async onAdded() {
    this.log('Device has been added');
  }

  /**
   * onSettings is called when the user updates the device's settings
   */
  async onSettings({
    oldSettings,
    newSettings,
    changedKeys,
  }: {
    oldSettings: { [key: string]: boolean | string | number | undefined | null };
    newSettings: { [key: string]: boolean | string | number | undefined | null };
    changedKeys: string[];
  }): Promise<string | void> {
    this.log('Settings were changed');
    this.log('Changed keys:', changedKeys);
  }

  /**
   * onRenamed is called when the user updates the device's name
   */
  async onRenamed(name: string) {
    this.log(`Device was renamed to: ${name}`);
  }

  /**
   * onDeleted is called when the user deleted the device
   */
  async onDeleted() {
    this.log('Device has been deleted');
  }

};
