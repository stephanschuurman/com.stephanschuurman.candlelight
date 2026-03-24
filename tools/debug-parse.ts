import { ProntoHexConverter } from '../lib/protonhex';

const command = 0x45;
const address = 0x00;
const prontoHex = ProntoHexConverter.necToProntoHex(command, address);

// Manually parse to debug
const parts = prontoHex.split(' ');
console.log('First 20 parts:');
for (let i = 0; i < 20; i++) {
  console.log(`  [${i}] = ${parts[i]}`);
}

console.log('\nData bits (starting at index 8):');
const dataBits = [];
for (let i = 6; i < 6 + 64 && i < parts.length - 1; i += 2) {
  const space = parseInt(parts[i + 1], 16);
  const bit = space > 0x002B ? 1 : 0;  // Updated threshold
  dataBits.push(bit);
  if (dataBits.length <= 16) {
    console.log(`  Bit ${dataBits.length - 1}: space=0x${parts[i + 1]} -> ${bit}`);
  }
}

console.log('\nExpected bits:');
console.log('Address 0x00:', '0'.repeat(8));
console.log('Address~0xFF:', '1'.repeat(8));
console.log('Command 0x45:', (0x45).toString(2).padStart(8, '0'));
console.log('Command~0xBA:', (0xBA).toString(2).padStart(8, '0'));

console.log('\nActual first 32 bits:', dataBits.slice(0, 32).join(''));
console.log('Expected:           ', '00000000' + '11111111' + '01000101' + '10111010');

// Reconstruct telegram
let telegram = 0;
for (let i = 0; i < 32; i++) {
  telegram = (telegram << 1) | dataBits[i];
}

console.log('\nReconstructed telegram: 0x' + telegram.toString(16).toUpperCase().padStart(8, '0'));
console.log('Expected telegram:      0x00FF45BA');

// Extract fields
const addr = (telegram >> 24) & 0xFF;
const addrInv = (telegram >> 16) & 0xFF;
const cmd = (telegram >> 8) & 0xFF;
const cmdInv = telegram & 0xFF;

console.log('\nExtracted:');
console.log(`  Address: 0x${addr.toString(16).toUpperCase().padStart(2, '0')} (expected 0x00)`);
console.log(`  Address~: 0x${addrInv.toString(16).toUpperCase().padStart(2, '0')} (expected 0xFF)`);
console.log(`  Command: 0x${cmd.toString(16).toUpperCase().padStart(2, '0')} (expected 0x45)`);
console.log(`  Command~: 0x${cmdInv.toString(16).toUpperCase().padStart(2, '0')} (expected 0xBA)`);
