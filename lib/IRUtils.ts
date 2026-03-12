/**
 * IR Utilities Helper Class
 * Contains helper functions for IR signal processing and conversion
 */
export class IRUtils {

    /**
     * Convert hex command to Homey bits array
     * @param hex Hex number to convert
     * @returns Array of bits (0s and 1s)
     */
    static hexToHomeyBits(hex: number): number[] {
        const bits: number[] = [];

        // Extract high byte (0xA2) and low byte (0x5D) from 0xA25D
        const highByte = (hex >> 8) & 0xFF;  // 0xA2
        const lowByte = hex & 0xFF;          // 0x5D

        // Process high byte first, then low byte
        const bytes = [highByte, lowByte];

        for (const byte of bytes) {
            // MSB-first bit ordering (7 down to 0)
            for (let j = 7; j >= 0; j--) {
                bits.push((byte >> j) & 1);
            }
        }
        return bits;
    }

    /**
     * Convert hex string to number
     * @param hexString Hex string (e.g., "0x45" or "45")
     * @returns Hex number
     */
    static hexStringToNumber(hexString: string): number {
        // Remove 0x prefix if present
        const cleanHex = hexString.replace(/^0x/i, '');
        return parseInt(cleanHex, 16);
    }

    static numberToHexString(num: number): string {
        return '0x' + num.toString(16).toUpperCase().padStart(4, '0');
    }

    /**
     * Convert hex command string to Homey bits
     * @param hexString Hex string command
     * @returns Array of bits
     */
    static hexCommandToHomeyBits(hexString: string): number[] {
        const hexNumber = this.hexStringToNumber(hexString);
        return this.hexToHomeyBits(hexNumber);
    }

    static necCommandToHex(cmd: number): number {
        // 1. bitreverse het commando (8 bits)
        const rev = this.reverseByte(cmd);

        // 2. inverse voor checksum
        const inv = (~rev) & 0xFF;

        // 3. combineer tot 16-bit
        return (rev << 8) | inv;
    }

    static reverseByte(b: number): number {
        let r = 0;
        for (let i = 0; i < 8; i++) {
            r = (r << 1) | (b & 1);
            b >>= 1;
        }
        return r;
    }

    // static necCommandToHomeyBits(cmd: number): number[] {
    //     const hex = this.necCommandToHex(cmd);
    //     return this.hexToHomeyBits(hex);
    // }

    static necCommandToHomeyBits(cmd: number, address: number = 0x00): number[] {
        // Address byte (NEC uses LSB-first; reverse address byte)
        const addrRev = this.reverseByte(address);
        const addrBits = this.hexToHomeyBits((addrRev << 8) | (~addrRev & 0xFF));
        
        // Command byte  
        const rev = this.reverseByte(cmd);
        const inv = (~rev) & 0xFF;
        const cmdBits = this.hexToHomeyBits((rev << 8) | inv);
        
        return [...addrBits, ...cmdBits]; // 32 bits totaal
    }

    static rc5CommandToHomeyBits(cmd: number, address: number = 0x00): number[] {
        // RC5 format: 2 start bits + 1 toggle + 5 address bits + 6 command bits = 14 bits
        // In Homey's Manchester encoding:
        //   words[0] = [1, 0] = HIGH-to-LOW = logical '0' in RC5
        //   words[1] = [0, 1] = LOW-to-HIGH = logical '1' in RC5
        const bits: number[] = [];
        
        // Start bits (always logical 1, 1 in RC5)
        bits.push(1, 1);
        
        // Toggle bit (0 for now - could be made dynamic later)
        bits.push(0);
        
        // Address (5 bits, MSB first)
        for (let i = 4; i >= 0; i--) {
            bits.push((address >> i) & 1);
        }
        
        // Command (6 bits, MSB first)  
        for (let i = 5; i >= 0; i--) {
            bits.push((cmd >> i) & 1);
        }
        
        return bits; // 14 bits total
    }
}
