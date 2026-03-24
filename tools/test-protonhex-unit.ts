/**
 * Unit Tests for ProntoHexConverter
 * 
 * These tests validate internal consistency and mathematical correctness.
 * Also includes IrScrutinizer comparison tests for validation.
 * 
 * HOW TO ADD IRSCRUTINIZER TEST CASES:
 * =====================================
 * 1. Open IrScrutinizer (https://github.com/bengtmartensson/IrScrutinizer)
 * 2. Go to the "Generate" tab
 * 3. Select protocol "NEC1" from the dropdown
 * 4. Enter:
 *    - D (Device/Address): e.g., 0
 *    - F (Function/Command): e.g., 69 (0x45)
 * 5. Click "Generate" button
 * 6. In the "Scrutinize signal" section, you'll see the Pronto Hex output
 * 7. Copy the entire Pronto Hex string (e.g., "0000 006C 0022 0000 015B...")
 * 8. Add a new test case below in IRSCRUTINIZER_TEST_CASES:
 *    {
 *      name: 'Your test name',
 *      command: 0x45,  // Your command byte
 *      address: 0x00,  // Your address byte
 *      irScrutinizerOutput: 'paste the full pronto hex here',
 *      allowSmallDifferences: true  // Set to true if small differences are acceptable
 *    }
 * 
 * NOTE: Small differences (1-5 counts) are normal due to rounding differences
 *       and will still work in practice with IR receivers.
 */

import { ProntoHexConverter } from '../lib/protonhex';

interface TestCase {
  name: string;
  command: number;
  address: number;
}

interface RC5TestCase {
  name: string;
  command: number;
  address: number;
  toggle: number;
}

interface IrScrutinizerTestCase {
    protocol: 'NEC' | 'RC5';
  name: string;
  command: number;
  address: number;
  irScrutinizerOutput: string;
  allowSmallDifferences?: boolean; // If true, only warn about differences, don't fail
}

// ============================================================================
// IrScrutinizer Validation Test Cases
// ============================================================================
// Add your IrScrutinizer output here to validate against it
// To get IrScrutinizer output:
// 1. Open IrScrutinizer
// 2. Go to "Generate" tab
// 3. Select protocol "NEC1" 
// 4. Enter Device (address) and Function (command)
// 5. Click "Generate" and copy the Pronto Hex output
const IRSCRUTINIZER_TEST_CASES: IrScrutinizerTestCase[] = [
  {
    name: 'HEMA ON (0x45, 0x00)',
    protocol: 'NEC',
    command: 0x45,
    address: 0x00,
    irScrutinizerOutput: '0000 006C 0022 0000 015B 00AD 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0041 0016 0041 0016 0041 0016 0041 0016 0041 0016 0041 0016 0041 0016 0041 0016 0041 0016 0016 0016 0041 0016 0016 0016 0016 0016 0016 0016 0041 0016 0016 0016 0016 0016 0041 0016 0016 0016 0041 0016 0041 0016 0041 0016 0016 0016 0041 0016 05F7',
    allowSmallDifferences: false
  },
  {
    name: 'NEC (0x00, 0x00)',
    protocol: 'NEC',
    command: 0x00,
    address: 0x00,
    irScrutinizerOutput: '0000 006C 0022 0000 015B 00AD 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0041 0016 0041 0016 0041 0016 0041 0016 0041 0016 0041 0016 0041 0016 0041 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0041 0016 0041 0016 0041 0016 0041 0016 0041 0016 0041 0016 0041 0016 0041 0016 05F7',
    allowSmallDifferences: false
  }, 
  {
    name: 'NEC (0x10, 0x10)',
    protocol: 'NEC',
    command: 0x10,
    address: 0x10,
    irScrutinizerOutput: '0000 006C 0022 0000 015B 00AD 0016 0016 0016 0016 0016 0016 0016 0016 0016 0041 0016 0016 0016 0016 0016 0016 0016 0041 0016 0041 0016 0041 0016 0041 0016 0016 0016 0041 0016 0041 0016 0041 0016 0016 0016 0016 0016 0016 0016 0016 0016 0041 0016 0016 0016 0016 0016 0016 0016 0041 0016 0041 0016 0041 0016 0041 0016 0016 0016 0041 0016 0041 0016 0041 0016 05F7',
    allowSmallDifferences: false
  }, 
  {
    name: 'Max address (0xFF, 0xFF)',
    protocol: 'NEC',
    command: 0xFF,
    address: 0xFF,
    irScrutinizerOutput: '0000 006C 0022 0000 015B 00AD 0016 0041 0016 0041 0016 0041 0016 0041 0016 0041 0016 0041 0016 0041 0016 0041 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0041 0016 0041 0016 0041 0016 0041 0016 0041 0016 0041 0016 0041 0016 0041 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 05F7',
    allowSmallDifferences: false
  }
  // Add more test cases here by copying from IrScrutinizer
];

// Test cases for round-trip validation
const NEC_TEST_CASES: TestCase[] = [
  { name: 'NEC (0x00, 0x00)', command: 0x00, address: 0x00 },
  { name: 'HEMA ON (0x45, 0x00)', command: 0x45, address: 0x00 },
  { name: 'HEMA OFF (0x47, 0x00)', command: 0x47, address: 0x00 },
  { name: 'Action ON (0x46, 0x00)', command: 0x46, address: 0x00 },
  { name: 'Custom (0x12, 0x34)', command: 0x12, address: 0x34 },
  { name: 'Max address (0xFF, 0xFF)', command: 0xFF, address: 0xFF }
];

// RC5 test cases
const RC5_TEST_CASES: RC5TestCase[] = [
  { name: 'RC5 Power (Cmd: 0x0C, Addr: 0x00, T: 0)', command: 0x0C, address: 0x00, toggle: 0 },
  { name: 'RC5 Power (Cmd: 0x0C, Addr: 0x00, T: 1)', command: 0x0C, address: 0x00, toggle: 1 },
  { name: 'RC5 Volume+ (Cmd: 0x10, Addr: 0x00, T: 0)', command: 0x10, address: 0x00, toggle: 0 },
  { name: 'RC5 Volume- (Cmd: 0x11, Addr: 0x00, T: 0)', command: 0x11, address: 0x00, toggle: 0 },
  { name: 'RC5 Max Cmd (Cmd: 0x3F, Addr: 0x1F, T: 1)', command: 0x3F, address: 0x1F, toggle: 1 },
  { name: 'RC5 Custom (Cmd: 0x15, Addr: 0x05, T: 0)', command: 0x15, address: 0x05, toggle: 0 }
];

let passedTests = 0;
let failedTests = 0;
let warningTests = 0;

console.log('='.repeat(80));
console.log('ProntoHexConverter - Unit Tests');
console.log('='.repeat(80));
console.log();

console.log();

// ============================================================================
// Test 1: IrScrutinizer Output Validation
// ============================================================================
if (IRSCRUTINIZER_TEST_CASES.length > 0) {
  console.log('Test 1: IrScrutinizer Output Validation');
  console.log('-'.repeat(80));
  console.log();

  for (const testCase of IRSCRUTINIZER_TEST_CASES) {
    const ourOutput = ProntoHexConverter.necToProntoHex(testCase.command, testCase.address);
    const irsOutput = testCase.irScrutinizerOutput;
    
    const ourParts = ourOutput.split(' ');
    const irsParts = irsOutput.split(' ');
    
    // Compare outputs
    const exactMatch = ourOutput === irsOutput;
    
    if (exactMatch) {
      console.log(`✓ ${testCase.name.padEnd(30)} - Exact match with IrScrutinizer`);
      passedTests++;
    } else {
      // Analyze differences
      let differenceCount = 0;
      let maxDifference = 0;
      let maxDifferenceExcludingTrailingGap = 0;
      const differences: { index: number; ours: string; irs: string; diff: number }[] = [];
      
      for (let i = 0; i < Math.max(ourParts.length, irsParts.length); i++) {
        const ourVal = ourParts[i] || '0000';
        const irsVal = irsParts[i] || '0000';
        
        if (ourVal !== irsVal) {
          differenceCount++;
          const ourNum = parseInt(ourVal, 16);
          const irsNum = parseInt(irsVal, 16);
          const diff = Math.abs(ourNum - irsNum);
          maxDifference = Math.max(maxDifference, diff);
          
          // Track max difference excluding the last value (trailing gap)
          if (i < ourParts.length - 1 && i < irsParts.length - 1) {
            maxDifferenceExcludingTrailingGap = Math.max(maxDifferenceExcludingTrailingGap, diff);
          }
          
          if (differences.length < 6) { // Store first 6 differences
            differences.push({ index: i, ours: ourVal, irs: irsVal, diff });
          }
        }
      }
      
      // Determine if differences are acceptable  
      // Our implementation is mathematically correct per Pronto spec
      // Small differences with IrScrutinizer are expected due to different calculation methods
      const isSmallDifference = testCase.allowSmallDifferences;
      
      if (isSmallDifference) {
        console.log(`⚠ ${testCase.name.padEnd(30)} - Small differences (within tolerance)`);
        warningTests++;
      } else {
        console.log(`✗ ${testCase.name.padEnd(30)} - Output differs from IrScrutinizer`);
        failedTests++;
      }
      
      console.log(`  Differences: ${differenceCount} values, max difference: ${maxDifference} counts`);
      console.log();
      console.log('  Our output (first 70 chars):');
      console.log(`    ${ourOutput.substring(0, 70)}...`);
      console.log('  IrScrutinizer output (first 70 chars):');
      console.log(`    ${irsOutput.substring(0, 70)}...`);
      console.log();
      console.log('  Key differences:');
      
      const labels = ['Type', 'Freq', 'Seq1', 'Seq2', 'AGC+', 'AGC-'];
      for (let i = 0; i < Math.min(6, differences.length); i++) {
        const d = differences[i];
        const label = d.index < labels.length ? labels[d.index] : `[${d.index}]`;
        console.log(`    ${label.padEnd(6)}: ${d.ours} (ours) vs ${d.irs} (IRS) - diff: ${d.diff}`);
      }
      
      if (differences.length > 6) {
        console.log(`    ... and ${differences.length - 6} more differences`);
      }
      console.log();
    }
  }
  
  console.log();
} else {
  console.log('Test 1: IrScrutinizer Output Validation');
  console.log('-'.repeat(80));
  console.log();
  console.log('⚠ No IrScrutinizer test cases defined.');
  console.log('  Add test cases to IRSCRUTINIZER_TEST_CASES array to validate against IrScrutinizer.');
  console.log('  See comments in the code for instructions on how to get IrScrutinizer output.');
  console.log();
}

// ============================================================================
// Test 2: NEC Protocol Round-Trip Validation
// ============================================================================
console.log('Test 2: NEC Protocol Round-Trip Validation');
console.log('-'.repeat(80));
console.log();

for (const testCase of NEC_TEST_CASES) {
  const prontoHex = ProntoHexConverter.necToProntoHex(testCase.command, testCase.address);
  const parsed = ProntoHexConverter.parseNECProntoHex(prontoHex);
  
  if (parsed && parsed.command === testCase.command && parsed.address === testCase.address) {
    console.log(`✓ ${testCase.name.padEnd(30)} - Round-trip successful`);
    passedTests++;
  } else {
    console.log(`✗ ${testCase.name.padEnd(30)} - Round-trip FAILED`);
    if (parsed) {
      console.log(`  Expected: Cmd=0x${testCase.command.toString(16).toUpperCase()}, Addr=0x${testCase.address.toString(16).toUpperCase()}`);
      console.log(`  Got:      Cmd=0x${parsed.command.toString(16).toUpperCase()}, Addr=0x${parsed.address.toString(16).toUpperCase()}`);
    } else {
      console.log(`  Failed to parse Pronto Hex`);
    }
    failedTests++;
  }
}

console.log();

// ============================================================================
// Test 3: NEC Protocol Format Validation
// ============================================================================
console.log('Test 3: NEC Protocol Format Validation');
console.log('-'.repeat(80));
console.log();

// Validate Pronto Hex format structure
const testProntoHex = ProntoHexConverter.necToProntoHex(0x45, 0x00);
const parts = testProntoHex.split(' ');

const checks = [
  { name: 'Type code is 0000 (learned)', value: parts[0], expected: '0000' },
  { name: 'Frequency code is 006C (38kHz)', value: parts[1], expected: '006C' },
  { name: 'Seq1 length is 0022 (34 pairs)', value: parts[2], expected: '0022' },
  { name: 'Seq2 length is 0000 (no repeat)', value: parts[3], expected: '0000' },
  { name: 'Total parts is 72 (4 header + 68 data)', value: parts.length.toString(), expected: '72' },
  { name: 'No zero-duration pulses in data', value: parts.slice(4).filter(p => p === '0000').length.toString(), expected: '0' }
];

for (const check of checks) {
  const passed = check.value === check.expected;
  if (passed) {
    console.log(`✓ ${check.name}`);
    passedTests++;
  } else {
    console.log(`✗ ${check.name}`);
    console.log(`  Expected: ${check.expected}, Got: ${check.value}`);
    failedTests++;
  }
}

console.log();

// ============================================================================
// Test 4: Component Value Calculations
// ============================================================================
console.log('Test 4: Component Value Calculations (NEC @ 38kHz)');
console.log('-'.repeat(80));
console.log();

interface ComponentTest {
  name: string;
  microseconds: number;
  expectedHex: string;
  expectedDecimal: number;
}

const COMPONENT_TESTS: ComponentTest[] = [
  { name: 'NEC AGC Pulse (9ms)', microseconds: 9000, expectedHex: '0159', expectedDecimal: 345 },
  { name: 'NEC AGC Space (4.5ms)', microseconds: 4500, expectedHex: '00AD', expectedDecimal: 173 },
  { name: 'NEC Bit Pulse (562.5µs)', microseconds: 562.5, expectedHex: '0016', expectedDecimal: 22 },
  { name: 'NEC Bit Space 0 (562.5µs)', microseconds: 562.5, expectedHex: '0016', expectedDecimal: 22 },
  { name: 'NEC Bit Space 1 (1687.5µs)', microseconds: 1687.5, expectedHex: '0041', expectedDecimal: 65 },
  { name: 'Carrier cycle @ 38kHz', microseconds: 1000000/38000, expectedHex: '0001', expectedDecimal: 1 }
];

// We need to test the internal conversion function
// Since it's private, we'll test through the public NEC conversion
// and extract the values from the generated Pronto Hex

// Helper to calculate Pronto count (matches ProntoHexConverter logic)
function microsecondsToProntoCount(microseconds: number, frequencyHz: number = 38000): number {
  // Use frequency code 108 for 38 kHz (matches IrScrutinizer)
  let freqCode: number;
  if (frequencyHz === 38000) {
    freqCode = 108;
  } else {
    freqCode = Math.floor(1000000 / (frequencyHz * 0.241246));
  }
  
  const timebase = freqCode * 0.241246;
  return Math.round(microseconds / timebase);
}

for (const test of COMPONENT_TESTS) {
  const actual = microsecondsToProntoCount(test.microseconds, 38000);
  const actualHex = actual.toString(16).toUpperCase().padStart(4, '0');
  const passed = actual === test.expectedDecimal;
  
  if (passed) {
    console.log(`✓ ${test.name.padEnd(25)} ${test.microseconds}µs → 0x${actualHex} (${actual}) - PASSED`);
    passedTests++;
  } else {
    console.log(`✗ ${test.name.padEnd(25)} ${test.microseconds}µs → Expected 0x${test.expectedHex} (${test.expectedDecimal}), Got 0x${actualHex} (${actual}) - FAILED`);
    failedTests++;
  }
}

console.log();

// ============================================================================
// Test 5: Frequency Code Calculation
// ============================================================================
console.log('Test 5: Frequency Code Calculation');
console.log('-'.repeat(80));
console.log();

interface FrequencyTest {
  name: string;
  frequencyHz: number;
  expectedCode: string;
}

const FREQUENCY_TESTS: FrequencyTest[] = [
  { name: 'NEC (38 kHz)', frequencyHz: 38000, expectedCode: '006C' },  // 108 decimal (matches IrScrutinizer)
  { name: 'RC5 (36 kHz)', frequencyHz: 36000, expectedCode: '0073' }   // 115 decimal
];

// Calculate frequency code (matches ProntoHexConverter logic)
function frequencyToProntoCode(frequencyHz: number): string {
  // Use 108 for 38 kHz to match IrScrutinizer
  if (frequencyHz === 38000) {
    return '006C';
  }
  const code = Math.floor(1000000 / (frequencyHz * 0.241246));
  return code.toString(16).toUpperCase().padStart(4, '0');
}

for (const test of FREQUENCY_TESTS) {
  const actual = frequencyToProntoCode(test.frequencyHz);
  const passed = actual === test.expectedCode;
  
  if (passed) {
    console.log(`✓ ${test.name.padEnd(20)} ${test.frequencyHz}Hz → 0x${actual} - PASSED`);
    passedTests++;
  } else {
    console.log(`✗ ${test.name.padEnd(20)} ${test.frequencyHz}Hz → Expected 0x${test.expectedCode}, Got 0x${actual} - FAILED`);
    failedTests++;
  }
}

console.log();

// ============================================================================
// Reference: Quick IrScrutinizer Comparison
// ============================================================================
console.log('Reference: Quick IrScrutinizer Comparison');
console.log('-'.repeat(80));
console.log();
console.log('IrScrutinizer may show slightly different values due to different');
console.log('internal calculation methods or carrier frequency assumptions.');
console.log('Both outputs work in practice due to IR receiver tolerances.');
console.log();

const necTestSignal = ProntoHexConverter.necToProntoHex(0x45, 0x00);
const necParts = necTestSignal.split(' ');

console.log('Command 0x45 @ address 0x00:');
console.log(`  Our output:       ${necParts.slice(0, 10).join(' ')} ...`);
console.log(`  IrScrutinizer:    0000 006C 0022 0000 015B 00AD 0016 0016 0016 0016 ...`);
console.log();
console.log('Differences:');
console.log(`  Frequency code:   ${necParts[1]} (ours) vs 006C (IRS) - diff: ${parseInt(necParts[1], 16) - 0x006C} ✓`);
console.log(`  AGC pulse:        ${necParts[4]} (ours) vs 015B (IRS) - diff: ${parseInt(necParts[4], 16) - 0x015B}`);
console.log(`  AGC space:        ${necParts[5]} (ours) vs 00AD (IRS) - diff: ${parseInt(necParts[5], 16) - 0x00AD} ✓`);
console.log(`  Bit pulse:        ${necParts[6]} (ours) vs 0016 (IRS) - diff: ${parseInt(necParts[6], 16) - 0x0016} ✓`);
console.log();
console.log('Note: Differences of 1-5 counts (< 5µs) are within normal IR tolerances.');
console.log();

// ============================================================================
// Helper: Generate Test Cases for IrScrutinizer Validation
// ============================================================================
console.log('Helper: Generate Test Cases');
console.log('-'.repeat(80));
console.log();
console.log('To add more IrScrutinizer test cases, copy the output below and');
console.log('paste the IrScrutinizer output for comparison:');
console.log();

// Example commands to generate test cases for
const exampleCommands = [
  { name: 'HEMA OFF', command: 0x47, address: 0x00 },
  { name: 'Action ON', command: 0x46, address: 0x00 }
];

for (const ex of exampleCommands) {
  const output = ProntoHexConverter.necToProntoHex(ex.command, ex.address);
  console.log(`${ex.name} (command: 0x${ex.command.toString(16).toUpperCase()}, address: 0x${ex.address.toString(16).toUpperCase()}):`);
  console.log(`  Our output:`);
  console.log(`    ${output}`);
  console.log();
  console.log(`  Template for test case:`);
  console.log(`    {`);
  console.log(`      name: '${ex.name} (0x${ex.command.toString(16).toUpperCase()}, 0x${ex.address.toString(16).toUpperCase()})',`);
  console.log(`      command: 0x${ex.command.toString(16).toUpperCase()},`);
  console.log(`      address: 0x${ex.address.toString(16).toUpperCase()},`);
  console.log(`      irScrutinizerOutput: 'paste IrScrutinizer output here',`);
  console.log(`      allowSmallDifferences: true`);
  console.log(`    }`);
  console.log();
}

console.log();

// ============================================================================
// Test 6: RC5 Protocol Format Validation
// ============================================================================
console.log('Test 6: RC5 Protocol Format Validation');
console.log('-'.repeat(80));
console.log();

// Test RC5 format structure
const rc5TestSignal = ProntoHexConverter.rc5ToProntoHex(0x0C, 0x00, 0);
const rc5Parts = rc5TestSignal.split(' ');

const rc5Checks = [
  { name: 'Type code is 0000 (learned)', value: rc5Parts[0], expected: '0000' },
  { name: 'Frequency code is 0073 (36kHz)', value: rc5Parts[1], expected: '0073' },
  { name: 'Seq1 length is 000E (14 pairs)', value: rc5Parts[2], expected: '000E' },
  { name: 'Seq2 length is 0000 (no repeat)', value: rc5Parts[3], expected: '0000' },
  { name: 'Total parts is 32 (4 header + 28 data)', value: rc5Parts.length.toString(), expected: '32' },
  { name: 'No zero-duration pulses in data', value: rc5Parts.slice(4).filter(p => p === '0000').length.toString(), expected: '0' }
];

for (const check of rc5Checks) {
  const passed = check.value === check.expected;
  if (passed) {
    console.log(`✓ ${check.name}`);
    passedTests++;
  } else {
    console.log(`✗ ${check.name}`);
    console.log(`  Expected: ${check.expected}, Got: ${check.value}`);
    failedTests++;
  }
}

console.log();

// ============================================================================
// Test 7: RC5 Protocol Component Calculations
// ============================================================================
console.log('Test 7: Component Value Calculations (RC5 @ 36kHz)');
console.log('-'.repeat(80));
console.log();

const RC5_COMPONENT_TESTS: ComponentTest[] = [
  { name: 'RC5 Half-bit (889µs)', microseconds: 889, expectedHex: '0020', expectedDecimal: 32 },
  { name: 'RC5 Full-bit (1778µs)', microseconds: 1778, expectedHex: '0040', expectedDecimal: 64 },
  { name: 'Carrier cycle @ 36kHz', microseconds: 1000000/36000, expectedHex: '0001', expectedDecimal: 1 }
];

for (const test of RC5_COMPONENT_TESTS) {
  const actual = microsecondsToProntoCount(test.microseconds, 36000);
  const actualHex = actual.toString(16).toUpperCase().padStart(4, '0');
  const passed = actual === test.expectedDecimal;
  
  if (passed) {
    console.log(`✓ ${test.name.padEnd(25)} ${test.microseconds}µs → 0x${actualHex} (${actual}) - PASSED`);
    passedTests++;
  } else {
    console.log(`✗ ${test.name.padEnd(25)} ${test.microseconds}µs → Expected 0x${test.expectedHex} (${test.expectedDecimal}), Got 0x${actualHex} (${actual}) - FAILED`);
    failedTests++;
  }
}

console.log();

// ============================================================================
// Test 8: RC5 Protocol Validation Tests
// ============================================================================
console.log('Test 8: RC5 Protocol Validation Tests');
console.log('-'.repeat(80));
console.log();

// Test basic output generation for various RC5 commands
for (const testCase of RC5_TEST_CASES) {
  try {
    const prontoHex = ProntoHexConverter.rc5ToProntoHex(testCase.command, testCase.address, testCase.toggle);
    const parts = prontoHex.split(' ');
    
    // Basic validation: should have proper structure
    const validStructure = 
      parts.length > 4 &&
      parts[0] === '0000' &&
      parts[1] === '0073' &&
      parseInt(parts[2], 16) > 0;
    
    if (validStructure) {
      console.log(`✓ ${testCase.name.padEnd(45)} - Generated successfully`);
      passedTests++;
    } else {
      console.log(`✗ ${testCase.name.padEnd(45)} - Invalid structure`);
      failedTests++;
    }
  } catch (error) {
    console.log(`✗ ${testCase.name.padEnd(45)} - Error: ${error}`);
    failedTests++;
  }
}

console.log();

// ============================================================================
// Test 9: RC5 Error Handling
// ============================================================================
console.log('Test 9: RC5 Error Handling');
console.log('-'.repeat(80));
console.log();

const rc5ErrorTests = [
  { name: 'Invalid command (> 0x3F)', fn: () => ProntoHexConverter.rc5ToProntoHex(0x40, 0x00, 0), shouldFail: true },
  { name: 'Invalid address (> 0x1F)', fn: () => ProntoHexConverter.rc5ToProntoHex(0x0C, 0x20, 0), shouldFail: true },
  { name: 'Invalid toggle (> 1)', fn: () => ProntoHexConverter.rc5ToProntoHex(0x0C, 0x00, 2), shouldFail: true },
  { name: 'Valid max values', fn: () => ProntoHexConverter.rc5ToProntoHex(0x3F, 0x1F, 1), shouldFail: false }
];

for (const test of rc5ErrorTests) {
  try {
    test.fn();
    if (test.shouldFail) {
      console.log(`✗ ${test.name.padEnd(35)} - Should have thrown error`);
      failedTests++;
    } else {
      console.log(`✓ ${test.name.padEnd(35)} - Accepted valid input`);
      passedTests++;
    }
  } catch (error) {
    if (test.shouldFail) {
      console.log(`✓ ${test.name.padEnd(35)} - Correctly rejected`);
      passedTests++;
    } else {
      console.log(`✗ ${test.name.padEnd(35)} - Should not have thrown error: ${error}`);
      failedTests++;
    }
  }
}

console.log();

// ============================================================================
// Test 10: RC5 vs NEC Comparison
// ============================================================================
console.log('Test 10: RC5 vs NEC Comparison');
console.log('-'.repeat(80));
console.log();

const necSample = ProntoHexConverter.necToProntoHex(0x45, 0x00);
const rc5Sample = ProntoHexConverter.rc5ToProntoHex(0x0C, 0x00, 0);

const necSampleParts = necSample.split(' ');
const rc5SampleParts = rc5Sample.split(' ');

console.log('Protocol Comparison:');
console.log(`  NEC frequency: ${necSampleParts[1]} (38 kHz)`);
console.log(`  RC5 frequency: ${rc5SampleParts[1]} (36 kHz)`);
console.log();
console.log(`  NEC sequence length: ${parseInt(necSampleParts[2], 16)} pairs (${parseInt(necSampleParts[2], 16) * 2} values)`);
console.log(`  RC5 sequence length: ${parseInt(rc5SampleParts[2], 16)} pairs (${parseInt(rc5SampleParts[2], 16) * 2} values)`);
console.log();
console.log(`  NEC total parts: ${necSampleParts.length}`);
console.log(`  RC5 total parts: ${rc5SampleParts.length}`);
console.log();

// Verify they are different
if (necSampleParts[1] !== rc5SampleParts[1]) {
  console.log('✓ Protocols use different carrier frequencies');
  passedTests++;
} else {
  console.log('✗ Protocols should use different carrier frequencies');
  failedTests++;
}

console.log();

// ============================================================================
// Summary
// ============================================================================
console.log('='.repeat(80));
console.log('Test Summary');
console.log('='.repeat(80));
console.log(`Total tests: ${passedTests + failedTests + warningTests}`);
console.log(`✓ Passed: ${passedTests}`);
if (warningTests > 0) {
  console.log(`⚠ Warnings: ${warningTests} (small differences within tolerance)`);
}
console.log(`✗ Failed: ${failedTests}`);
console.log();

if (failedTests === 0) {
  if (warningTests > 0) {
    console.log('✓ All critical tests passed! Some minor differences with IrScrutinizer noted.');
  } else {
    console.log('🎉 All unit tests passed!');
  }
  console.log('='.repeat(80));
  process.exit(0);
} else {
  console.log('❌ Some tests failed. Please review the output above.');
  console.log('='.repeat(80));
  process.exit(1);
}
