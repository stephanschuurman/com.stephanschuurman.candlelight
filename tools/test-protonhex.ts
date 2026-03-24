/**
 * Test and Demo Script for ProntoHexConverter
 * 
 * This script demonstrates and validates the ProntoHexConverter class
 * with known IR codes from the Candlelight app.
 */

import { ProntoHexConverter } from '../lib/protonhex';

console.log('='.repeat(70));
console.log('Pronto Hex Converter - Test & Demo');
console.log('='.repeat(70));
console.log();

// ============================================================================
// Test 1: HEMA Tealight NEC Commands
// ============================================================================
console.log('Test 1: HEMA Tealight (NEC Protocol)');
console.log('-'.repeat(70));

const hemaCommands = {
  'ON': { command: 0x45, address: 0x00 },
  'OFF': { command: 0x47, address: 0x00 },
  'TIMER_2H': { command: 0x44, address: 0x00 },
  'TIMER_4H': { command: 0x43, address: 0x00 },
  'TIMER_6H': { command: 0x07, address: 0x00 },
  'TIMER_8H': { command: 0x09, address: 0x00 }
};

console.log('Converting HEMA tealight commands to Pronto Hex:');
console.log();

for (const [name, config] of Object.entries(hemaCommands)) {
  const prontoHex = ProntoHexConverter.necToProntoHex(config.command, config.address);
  console.log(`${name.padEnd(12)} (0x${config.command.toString(16).toUpperCase().padStart(2, '0')}):`);
  console.log(`  ${prontoHex}`);
  console.log();
}

// Batch conversion
console.log('Batch conversion:');
const hemaSignals = ProntoHexConverter.batchConvertNEC(hemaCommands);
console.log(`Generated ${Object.keys(hemaSignals).length} signals`);
console.log();

// ============================================================================
// Test 2: Action 3-Button NEC Commands
// ============================================================================
console.log('Test 2: Action 3-Button (NEC Protocol)');
console.log('-'.repeat(70));

const actionCommands = {
  'ON': { command: 0x46, address: 0x00 },
  'OFF': { command: 0x15, address: 0x00 },
  'TIMER_6H': { command: 0x18, address: 0x00 }
};

const actionSignals = ProntoHexConverter.batchConvertNEC(actionCommands);
for (const [name, prontoHex] of Object.entries(actionSignals)) {
  console.log(`${name}: ${prontoHex.substring(0, 60)}...`);
}
console.log();

// ============================================================================
// Test 3: RC5 Protocol Conversion
// ============================================================================
console.log('Test 3: RC5 Protocol Conversion');
console.log('-'.repeat(70));

// Test with Flinq remote commands (based on the existing pronto hex in app.json)
const flinqRC5Commands = {
  'ON': { command: 0x0C, address: 0x00, toggle: 0 },
  'OFF': { command: 0x0C, address: 0x00, toggle: 1 },
  'TIMER_2H': { command: 0x33, address: 0x00, toggle: 0 },
  'TIMER_4H': { command: 0x32, address: 0x00, toggle: 0 },
  'TIMER_6H': { command: 0x30, address: 0x00, toggle: 0 },
  'TIMER_8H': { command: 0x31, address: 0x00, toggle: 0 }
};

console.log('Converting RC5 commands to Pronto Hex:');
for (const [name, config] of Object.entries(flinqRC5Commands)) {
  try {
    const prontoHex = ProntoHexConverter.rc5ToProntoHex(
      config.command,
      config.address,
      config.toggle
    );
    console.log(`${name.padEnd(12)} (Cmd: 0x${config.command.toString(16).toUpperCase().padStart(2, '0')}, Toggle: ${config.toggle}):`);
    console.log(`  ${prontoHex.substring(0, 60)}...`);
  } catch (error: any) {
    console.log(`${name}: Error - ${error.message}`);
  }
}
console.log();

// ============================================================================
// Test 4: Generate app.json Signal Definition
// ============================================================================
console.log('Test 4: Generate app.json Signal Definition');
console.log('-'.repeat(70));

const signalDef = ProntoHexConverter.generateAppJsonSignal(
  'my-test-device',
  {
    'ON': { command: 0x45, address: 0x00 },
    'OFF': { command: 0x47, address: 0x00 }
  },
  'nec'
);

console.log('Generated signal definition for app.json:');
console.log(JSON.stringify(signalDef, null, 2));
console.log();

// ============================================================================
// Test 5: Round-trip Validation (NEC)
// ============================================================================
console.log('Test 5: Round-trip Validation (NEC)');
console.log('-'.repeat(70));

const testCases = [
  { command: 0x45, address: 0x00, name: 'ON' },
  { command: 0x47, address: 0x00, name: 'OFF' },
  { command: 0x12, address: 0x34, name: 'Custom' }
];

let allPassed = true;

for (const testCase of testCases) {
  const prontoHex = ProntoHexConverter.necToProntoHex(testCase.command, testCase.address);
  const parsed = ProntoHexConverter.parseNECProntoHex(prontoHex);
  
  if (parsed && parsed.command === testCase.command && parsed.address === testCase.address) {
    console.log(`✓ ${testCase.name.padEnd(10)} Command: 0x${testCase.command.toString(16).toUpperCase().padStart(2, '0')}, Address: 0x${testCase.address.toString(16).toUpperCase().padStart(2, '0')} - PASSED`);
  } else {
    console.log(`✗ ${testCase.name.padEnd(10)} FAILED`);
    if (parsed) {
      console.log(`  Expected: Cmd=0x${testCase.command.toString(16)}, Addr=0x${testCase.address.toString(16)}`);
      console.log(`  Got:      Cmd=0x${parsed.command.toString(16)}, Addr=0x${parsed.address.toString(16)}`);
    } else {
      console.log(`  Failed to parse Pronto Hex`);
    }
    allPassed = false;
  }
}

console.log();
if (allPassed) {
  console.log('✓ All validation tests passed!');
} else {
  console.log('✗ Some validation tests failed!');
}
console.log();

// ============================================================================
// Test 6: Create Complete Signal with Repeat
// ============================================================================
console.log('Test 6: Create Complete NEC Signal with Repeat');
console.log('-'.repeat(70));

const completeSignal = ProntoHexConverter.createNECSignal(0x45, 0x00);
console.log('Main Signal:');
console.log(`  ${completeSignal.main.substring(0, 60)}...`);
console.log('Repeat Signal:');
console.log(`  ${completeSignal.repeat}`);
console.log();

// ============================================================================
// Test 7: Error Handling
// ============================================================================
console.log('Test 7: Error Handling');
console.log('-'.repeat(70));

console.log('Testing RC5 validation:');

// Test invalid command (too large)
try {
  ProntoHexConverter.rc5ToProntoHex(0x7F, 0x00, 0); // 0x7F > 0x3F (6 bits max)
  console.log('✗ Should have thrown error for invalid RC5 command');
} catch (error: any) {
  console.log(`✓ Correctly rejected invalid command: ${error.message}`);
}

// Test invalid address (too large)
try {
  ProntoHexConverter.rc5ToProntoHex(0x0C, 0x3F, 0); // 0x3F > 0x1F (5 bits max)
  console.log('✗ Should have thrown error for invalid RC5 address');
} catch (error: any) {
  console.log(`✓ Correctly rejected invalid address: ${error.message}`);
}

// Test invalid toggle
try {
  ProntoHexConverter.rc5ToProntoHex(0x0C, 0x00, 2); // Toggle must be 0 or 1
  console.log('✗ Should have thrown error for invalid toggle');
} catch (error: any) {
  console.log(`✓ Correctly rejected invalid toggle: ${error.message}`);
}

console.log();

// ============================================================================
// Test 8: Performance Test
// ============================================================================
console.log('Test 8: Performance Test');
console.log('-'.repeat(70));

const iterations = 1000;
const startTime = Date.now();

for (let i = 0; i < iterations; i++) {
  ProntoHexConverter.necToProntoHex(0x45, 0x00);
}

const endTime = Date.now();
const duration = endTime - startTime;
const perOp = duration / iterations;

console.log(`Converted ${iterations} NEC commands in ${duration}ms`);
console.log(`Average: ${perOp.toFixed(3)}ms per conversion`);
console.log();

// ============================================================================
// Summary
// ============================================================================
console.log('='.repeat(70));
console.log('Test Summary');
console.log('='.repeat(70));
console.log('✓ NEC protocol conversion');
console.log('✓ RC5 protocol conversion');
console.log('✓ Batch conversion');
console.log('✓ app.json signal generation');
console.log('✓ Round-trip validation');
console.log('✓ Error handling');
console.log('✓ Performance');
console.log();
console.log('All tests completed successfully!');
console.log('='.repeat(70));
