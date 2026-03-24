# Pronto Hex Converter - Gebruiksvoorbeelden

Deze voorbeelden laten zien hoe je de `ProntoHexConverter` klasse kunt gebruiken om IR protocollen om te zetten naar Pronto Hex formaat.

## Importeren

```typescript
import { ProntoHexConverter } from '../lib/protonhex';
```

## NEC Protocol Voorbeelden

### Enkel commando converteren

```typescript
// Convert NEC command 0x45 (ON button) met adres 0x00
const prontoHex = ProntoHexConverter.necToProntoHex(0x45, 0x00);
console.log(prontoHex);
// Output: "0000 006D 0022 0000 0156 00AB 0016 0016 ..."
```

### Met repeat signaal

```typescript
// Include NEC repeat signal in sequence 2
const prontoHexWithRepeat = ProntoHexConverter.necToProntoHex(0x45, 0x00, true);
```

### Complete NEC signal aanmaken

```typescript
// Maak een complete NEC signal met main en repeat
const signal = ProntoHexConverter.createNECSignal(0x45, 0x00);
console.log(signal.main);   // Main signal
console.log(signal.repeat); // Repeat signal
```

### Meerdere NEC commando's batch converteren

```typescript
// Converteer meerdere commando's in één keer
const commands = {
  'ON': { command: 0x45, address: 0x00 },
  'OFF': { command: 0x47, address: 0x00 },
  'TIMER_2H': { command: 0x44, address: 0x00 },
  'TIMER_4H': { command: 0x43, address: 0x00 },
  'TIMER_6H': { command: 0x07, address: 0x00 },
  'TIMER_8H': { command: 0x09, address: 0x00 }
};

const signals = ProntoHexConverter.batchConvertNEC(commands);
console.log(signals);
// Output: {
//   'ON': '0000 006D ...',
//   'OFF': '0000 006D ...',
//   ...
// }
```

### NEC Pronto Hex terug parsen

```typescript
// Parse een Pronto Hex string terug naar command en address
const parsed = ProntoHexConverter.parseNECProntoHex(prontoHex);
if (parsed) {
  console.log(`Command: 0x${parsed.command.toString(16)}`);
  console.log(`Address: 0x${parsed.address.toString(16)}`);
}
```

## RC5 Protocol Voorbeelden

### Enkel RC5 commando converteren

```typescript
// Convert RC5 command 0x0C (power) met adres 0x00 en toggle 0
const prontoHex = ProntoHexConverter.rc5ToProntoHex(0x0C, 0x00, 0);
console.log(prontoHex);
```

### Met toggle bit

```typescript
// RC5 toggle bit wisselt bij elke nieuwe knopdruk
let toggle = 0;

function sendRC5Command(command: number, address: number) {
  const prontoHex = ProntoHexConverter.rc5ToProntoHex(command, address, toggle);
  // Send prontoHex...
  
  // Toggle voor volgende keer
  toggle = toggle === 0 ? 1 : 0;
}

sendRC5Command(0x0C, 0x00); // Toggle = 0
sendRC5Command(0x0C, 0x00); // Toggle = 1
```

### Meerdere RC5 commando's batch converteren

```typescript
const commands = {
  'ON': { command: 0x0C, address: 0x00, toggle: 0 },
  'OFF': { command: 0x0C, address: 0x00, toggle: 1 },
  'VOL_UP': { command: 0x10, address: 0x00, toggle: 0 },
  'VOL_DOWN': { command: 0x11, address: 0x00, toggle: 0 }
};

const signals = ProntoHexConverter.batchConvertRC5(commands);
console.log(signals);
```

## App.json Signal Definition Genereren

### Voor NEC protocol

```typescript
// Genereer signal definitie voor app.json
const signalDef = ProntoHexConverter.generateAppJsonSignal(
  'hema-tealight',
  {
    'ON': { command: 0x45, address: 0x00 },
    'OFF': { command: 0x47, address: 0x00 },
    'TIMER_2H': { command: 0x44, address: 0x00 },
    'TIMER_4H': { command: 0x43, address: 0x00 },
    'TIMER_6H': { command: 0x07, address: 0x00 },
    'TIMER_8H': { command: 0x09, address: 0x00 }
  },
  'nec'
);

console.log(JSON.stringify(signalDef, null, 2));
// Output kan direct in app.json signals sectie geplaatst worden:
// {
//   "hema-tealight": {
//     "type": "prontohex",
//     "cmds": {
//       "ON": "0000 006D 0022 0000 0156 00AB ...",
//       "OFF": "0000 006D 0022 0000 0156 00AB ...",
//       ...
//     }
//   }
// }
```

### Voor RC5 protocol

```typescript
const signalDef = ProntoHexConverter.generateAppJsonSignal(
  'my-rc5-device',
  {
    'ON': { command: 0x0C, address: 0x00, toggle: 0 },
    'OFF': { command: 0x0C, address: 0x00, toggle: 1 }
  },
  'rc5'
);
```

## Gebruik in Homey Device Driver

### NEC protocol in device

```typescript
import Homey from 'homey';
import { ProntoHexConverter } from '../../lib/protonhex';

export class MyDevice extends Homey.Device {
  async onInit() {
    // Initialiseer signal
    this.signal = this.homey.rf.getSignalInfrared('my-device-pronto');
    
    // Registreer capability listeners
    this.registerCapabilityListener('onoff', this.onCapabilityOnOff.bind(this));
  }

  async onCapabilityOnOff(value: boolean) {
    const command = value ? 0x45 : 0x47; // ON or OFF
    const prontoHex = ProntoHexConverter.necToProntoHex(command, 0x00);
    
    // Als je de Pronto Hex codes al in app.json hebt staan:
    const commandName = value ? 'ON' : 'OFF';
    await this.signal.cmd(commandName, { device: this });
  }
}
```

### RC5 protocol in device

```typescript
import Homey from 'homey';
import { ProntoHexConverter } from '../../lib/protonhex';

export class MyRC5Device extends Homey.Device {
  private toggle: number = 0;

  async sendRC5Command(command: number, address: number = 0x00) {
    const prontoHex = ProntoHexConverter.rc5ToProntoHex(command, address, this.toggle);
    
    // Toggle voor volgende keer
    this.toggle = this.toggle === 0 ? 1 : 0;
    
    // Verstuur...
    await this.signal.cmd('CUSTOM', { device: this });
  }
}
```

## Dynamische commando's genereren

Als je dynamisch Pronto Hex codes wilt genereren zonder ze in app.json te definiëren:

```typescript
import Homey from 'homey';
import { ProntoHexConverter } from '../../lib/protonhex';

export class DynamicDevice extends Homey.Device {
  async sendCustomNECCommand(command: number, address: number = 0x00) {
    try {
      // Genereer Pronto Hex on-the-fly
      const prontoHex = ProntoHexConverter.necToProntoHex(command, address);
      
      // Als je een generieke pronto signal hebt in app.json:
      // "generic-pronto": {
      //   "type": "prontohex",
      //   "cmds": {}
      // }
      
      // Je kunt de raw Pronto data versturen via de signal API
      // (Dit vereist mogelijk aanpassingen aan de signal definitie)
      
      this.log(`Generated Pronto Hex for command 0x${command.toString(16)}: ${prontoHex}`);
      
      // Alternatief: voeg dynamisch toe aan signal cmds
      // Dit is een workaround, niet de standaard manier
      
    } catch (error) {
      this.error('Failed to generate Pronto Hex:', error);
    }
  }
}
```

## Validatie en Debugging

```typescript
// Converteer en valideer
const command = 0x45;
const address = 0x00;

// Converteer naar Pronto Hex
const prontoHex = ProntoHexConverter.necToProntoHex(command, address);
console.log('Generated:', prontoHex);

// Parse terug
const parsed = ProntoHexConverter.parseNECProntoHex(prontoHex);
if (parsed) {
  console.log('Parsed command:', `0x${parsed.command.toString(16).toUpperCase()}`);
  console.log('Parsed address:', `0x${parsed.address.toString(16).toUpperCase()}`);
  
  // Verificeer
  if (parsed.command === command && parsed.address === address) {
    console.log('✓ Validation successful!');
  } else {
    console.log('✗ Validation failed!');
  }
}
```

## Tools Script Voorbeeld

Je kunt ook een Node.js script maken om snel Pronto Hex codes te genereren:

```typescript
// tools/generate-pronto.ts
import { ProntoHexConverter } from '../lib/protonhex';

// Lees commando's uit command line of file
const commands = {
  'ON': { command: 0x45, address: 0x00 },
  'OFF': { command: 0x47, address: 0x00 },
  // ... meer commando's
};

console.log('=== NEC to Pronto Hex Converter ===\n');

for (const [name, config] of Object.entries(commands)) {
  const prontoHex = ProntoHexConverter.necToProntoHex(config.command, config.address);
  console.log(`${name}:`);
  console.log(`  Command: 0x${config.command.toString(16).toUpperCase()}`);
  console.log(`  Address: 0x${config.address.toString(16).toUpperCase()}`);
  console.log(`  Pronto: ${prontoHex}`);
  console.log();
}

// Of genereer direct signal definitie
const signalDef = ProntoHexConverter.generateAppJsonSignal('my-device', commands, 'nec');
console.log('=== app.json Signal Definition ===');
console.log(JSON.stringify(signalDef, null, 2));
```

Voer uit met:
```bash
npx ts-node tools/generate-pronto.ts
```

## Notities

- NEC protocol gebruikt 38 kHz carrier frequency
- RC5 protocol gebruikt 36 kHz carrier frequency
- RC5 toggle bit moet wisselen bij elke nieuwe knopdruk (niet bij herhalen)
- Pronto Hex format is universeel en kan door Homey's IR API worden gebruikt
- De `type: "prontohex"` in app.json signals sectie is vereist
