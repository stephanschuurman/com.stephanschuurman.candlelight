// More conversion examples at:
// https://github.com/pasthev/sensus => https://pasthev.github.io/sensus/
// https://github.com/haimkastner/broadlink-ir-converter
// https://github.com/benfoxall/puckmote => https://benjaminbenben.com/puckmote/
// https://ushomeautomation.com/Projects/Broadlink-RM3-MQTTBridge/index.html

/**
 * IR format conversion utilities for Broadlink devices.
 */
export class IrConverter {

  /**
   * Format a Uint8Array as a space-separated hex string (for debug logging).
   * e.g. "26 00 20 ..."
   */
  static toHex(u8: Uint8Array): string {
    return Array.from(u8, byte => byte.toString(16).padStart(2, '0')).join(' ');
  }

  /**
   * Format a Uint8Array as a continuous hex string (no spaces).
   * e.g. "26002600..."
   */
  static toHexCompact(u8: Uint8Array): string {
    return Array.from(u8, byte => byte.toString(16).padStart(2, '0')).join('');
  }



  /**
   * Convert a NEC address and command to a Pronto hex string.
   *
   * Encodes the 4-byte NEC sequence (addr, ~addr, cmd, ~cmd) into Pronto hex.
   *
   * NEC protocol basics:
   * - 32 bits: address (8), address_inv (8), command (8), command_inv (8)
   * - 9000µs mark, 4500µs space (AGC burst), then 32 data bits:
   *   - '0' bit: 560µs mark + 560µs space
   *   - '1' bit: 560µs mark + 1690µs space
   *
   * @param address  1-byte value as a number or hex string (e.g. 0x00, "00", "0x00")
   * @param command  1-byte value as a number or hex string (e.g. 0x02, "02", "0x02")
   * @returns Pronto hex string
   */
  static necToPronto(address: number | string, command: number | string): string {
    const parseInput = (input: number | string): number => {
      if (typeof input === 'number') return input & 0xFF;
      const isHex = /^0x/i.test(input) || /[a-f]/i.test(input);
      return (isHex ? parseInt(input, 16) : parseInt(input, 10)) & 0xFF;
    };

    const addr = parseInput(address);
    const cmd = parseInput(command);

    if (isNaN(addr) || isNaN(cmd)) {
      throw new Error('Address or command could not be parsed to a valid byte');
    }

    // NEC Protocol Structure: [Address] [Inverted Address] [Command] [Inverted Command]
    const fullHex = [addr, (~addr) & 0xFF, cmd, (~cmd) & 0xFF]
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');

    return IrConverter.necHexToPronto(fullHex);
  }

  /**
   * Convert a NEC Pronto hex string back to an array of 32 NEC word indexes (0 or 1).
   * This is the inverse of necHexToPronto and is used to feed Homey's signal.tx().
   *
   * Expects standard NEC pronto layout:
   *   header(4) + AGC burst(2) + 32×(mark,space) + stop(1) + gap(1)
   *
   * @param prontoHex  Space-separated pronto hex string
   * @returns 32-element array of word indexes (0 = short space, 1 = long space)
   */
  static prontoToNecBits(prontoHex: string): number[] {
    const words = prontoHex.trim().split(/\s+/).map(h => parseInt(h, 16));

    if (words.length < 4 || words[0] !== 0x0000) {
      throw new Error('prontoToNecBits: invalid pronto hex format');
    }

    const onceLen = words[2]; // pair count in the once-sequence
    if (onceLen < 34) {
      throw new Error(`prontoToNecBits: expected 34 pairs (NEC), got ${onceLen}`);
    }

    // words[4+5]  = AGC burst (skip)
    // words[6..69] = 32 data pairs; space word at odd offsets determines the bit
    const bits: number[] = [];
    for (let i = 0; i < 32; i++) {
      const spaceIdx = 4 + (i + 1) * 2 + 1; // 7, 9, 11 … 69
      bits.push(words[spaceIdx] > 0x0020 ? 1 : 0);
    }
    return bits;
  }

  /**
   * Convert a NEC hex string to a Pronto hex string.
   * @param necHex  8-character NEC hex string (e.g. "00FF02FD")
   * @returns Pronto hex string
   */
  static necHexToPronto(necHex: string): string {
    // NEC transmits bits LSB-first; iterate over bytes (2 hex chars each)
    const bits: number[] = [];
    for (let i = 0; i < necHex.length; i += 2) {
      const byte = parseInt(necHex.slice(i, i + 2), 16);
      for (let b = 0; b <= 7; b++) { // LSB first
        bits.push((byte >> b) & 1);
      }
    }

    const prontoParts = [
      '0000', // Pronto code type
      '006C', // Frequency divider (~38 kHz)
      '0022', // 34 pairs = 68 data words (1 AGC + 32 bits + 1 stop)
      '0000', // No repeat sequence
    ];

    // AGC burst: 9000µs mark + 4500µs space
    prontoParts.push('015B', '00AD');

    // 32 data bits – each is a (mark, space) pair
    for (const bit of bits) {
      prontoParts.push('0016');                       // 560µs mark
      prontoParts.push(bit === 0 ? '0016' : '0041'); // 560µs / 1690µs space
    }

    // Final stop mark + long trailing gap
    prontoParts.push('0016', '05F7');

    return prontoParts.join(' ');
  }

  /**
   * Convert an RC5 address and command to a Pronto hex string.
   * @param address  5-bit value as a number or hex string
   * @param command  6-bit value as a number or hex string
   * @param toggle   Toggle bit (0 or 1, default: 1)
   * @returns Pronto hex string
   */
  static rc5ToPronto(
    address: number | string,
    command: number | string,
    toggle: number = 1,
  ): string {
    const parseInput = (input: number | string): number => {
      if (typeof input === 'number') return input & 0xFF;
      const isHex = /^0x/i.test(input) || /[a-f]/i.test(input);
      return (isHex ? parseInt(input, 16) : parseInt(input, 10)) & 0xFF;
    };

    const addr = parseInput(address);
    const cmd = parseInput(command);
    const tgl = Number(toggle) & 0x01;

    if (isNaN(addr) || isNaN(cmd) || isNaN(tgl)) {
      throw new Error('Address, command or toggle could not be parsed to valid values');
    }

    const carrierFreq = 0x0073;
    const halfBitCycles = 0x0020;

    // RC5 frame: start1(1), start2(1), toggle(0/1), address(5), command(6)
    const bits = (1 << 13) | (1 << 12) | (tgl << 11) | ((addr & 0x1F) << 6) | (cmd & 0x3F);

    // Manchester coding mapped to mark/space half bits
    const halfBits: number[] = [];
    for (let i = 13; i >= 0; i--) {
      const bit = (bits >> i) & 1;
      if (bit === 1) {
        halfBits.push(1, 0);
      } else {
        halfBits.push(0, 1);
      }
    }

    // Pronto expects durations from a half-bit boundary
    const framedHalfBits = halfBits.slice(1);

    const durations: number[] = [];
    let currentVal = framedHalfBits[0];
    let count = 1;

    for (let i = 1; i < framedHalfBits.length; i++) {
      const val = framedHalfBits[i];
      if (val === currentVal) {
        count += 1;
      } else {
        durations.push(count * halfBitCycles);
        currentVal = val;
        count = 1;
      }
    }
    durations.push(count * halfBitCycles);

    // Finish with a long trailing gap
    if (durations.length % 2 === 0) {
      durations[durations.length - 1] = 0x0CC8;
    } else {
      durations.push(0x0CC8);
    }

    const header = [0x0000, carrierFreq, 0x0000, durations.length / 2];
    return [...header, ...durations].map(x => x.toString(16).padStart(4, '0')).join(' ');
  }

  /**
   * Detect the protocol of a pronto hex string from its carrier frequency word.
   * @returns 'nec' | 'rc5' | 'unknown'
   */
  static prontoProtocol(prontoHex: string): 'nec' | 'rc5' | 'unknown' {
    const divider = parseInt(prontoHex.trim().split(/\s+/)[1], 16);
    const freq = 1_000_000 / (divider * 0.241246);
    const necDiff = Math.abs(freq - 38000);
    const rc5Diff = Math.abs(freq - 36000);

    // Choose the closest known protocol instead of simple threshold checks,
    // because 36 kHz codes are near enough to also match the NEC window.
    if (Math.min(necDiff, rc5Diff) > 3000) return 'unknown';
    if (rc5Diff < necDiff) return 'rc5';
    if (necDiff < rc5Diff) return 'nec';

    // Tie-breaker: prefer RC5 for exact midpoint cases.
    return 'rc5';
  }

  /**
   * Convert an RC5 Pronto hex string back to an array of 14 Homey word indexes (0 or 1).
   * This is the inverse of rc5ToPronto and is used to feed Homey's rc5 signal.tx().
   *
   * RC5 pronto layout (repeat section, words[2]=0):
   *   header(4) + RLE durations (each a multiple of halfBitCycles=0x0020)
   * The first Manchester half-bit is stripped in rc5ToPronto, so we prepend it here.
   *
   * @param prontoHex  Space-separated pronto hex string
   * @returns 14-element array of word indexes (0 = [space,mark], 1 = [mark,space])
   */
  static prontoToRc5Bits(prontoHex: string): number[] {
    const words = prontoHex.trim().split(/\s+/).map(h => parseInt(h, 16));

    if (words.length < 4 || words[0] !== 0x0000) {
      throw new Error('prontoToRc5Bits: invalid pronto hex format');
    }

    // RC5 pronto stores data in the repeat section (words[2]=0, words[3]>0)
    const onceLen = words[2];
    const repeatLen = words[3];
    const dataStart = 4 + onceLen * 2;
    const durations = words.slice(dataStart, dataStart + repeatLen * 2);

    if (durations.length === 0) {
      throw new Error('prontoToRc5Bits: no duration data found');
    }

    const halfBitCycles = 0x0020;

    // Expand RLE durations into a sequence of half-bits.
    // Even indexes (0, 2, …) are marks (1), odd indexes (1, 3, …) are spaces (0).
    // The trailing gap (last element) is dropped.
    const expandedHalfBits: number[] = [];
    const durationCount = durations.length % 2 === 0
      ? durations.length - 1  // last word is the trailing gap — skip it
      : durations.length;

    for (let i = 0; i < durationCount; i++) {
      const level = i % 2 === 0 ? 1 : 0; // mark or space
      const count = Math.round(durations[i] / halfBitCycles);
      for (let j = 0; j < count; j++) expandedHalfBits.push(level);
    }

    // rc5ToPronto dropped the first half-bit (slice(1)); restore it.
    // RC5 always starts with a mark half-bit (start bit 1 → [1,0], first half = 1).
    const halfBits = [1, ...expandedHalfBits];

    // rc5ToPronto replaces the last run with a trailing gap when run-count is even.
    // That can remove the final half-bit run information; restore the missing
    // half-bit by completing the final Manchester pair.
    if (halfBits.length === 27) {
      halfBits.push(halfBits[halfBits.length - 1] === 1 ? 0 : 1);
    }

    if (halfBits.length !== 28) {
      throw new Error(`prontoToRc5Bits: expected 28 half-bits for 14 RC5 bits, got ${halfBits.length}`);
    }

    // Convert pairs of half-bits to Homey word indexes:
    //   [1, 0] (mark then space) → bit 1
    //   [0, 1] (space then mark) → bit 0
    const bits: number[] = [];
    for (let i = 0; i < halfBits.length; i += 2) {
      bits.push(halfBits[i] === 1 ? 1 : 0);
    }
    return bits;
  }
}
