## Homey + IR
- https://apps.developer.homey.app/wireless/rf-433mhz-868mhz
- https://apps-sdk-v3.developer.homey.app/Signal.html#tx
- https://apps.developer.homey.app/wireless/infrared
- https://apps-sdk-v2.developer.athom.com/tutorial-Signals-Prontohex.html
- https://apps-sdk-v3.developer.homey.app/SignalInfrared.html
- https://tools.developer.homey.app/tools/ir

## Driver
- https://github.com/athombv/node-homey-rfdriver
- https://www.npmjs.com/package/homey-rfdriver/v/2.0.0

## NEC IR Protocol
- https://www.sbprojects.net/knowledge/ir/nec.php
- https://github.com/johnosbb/hx1838decoder
- https://www.youtube.com/watch?v=VX-b89jkovc

 **Parameter**                      | **Value**   | **Code**
------------------------------------|-------------|------------
 Carrier Frequency                  | 38 kHz      | 38000 
 Start of Frame (SOF) : Lead / AGC  | 9.0 ms      | 9000
 Start of Frame (SOF) : Space       | 4.5 ms      | 4500
 End of Frame (EOF)                 | 562.5 µs    | 560
 Logical "0" : Pulse                | 562.5 µs    | 560
 Logical "0" : Space                | 562.5 µs    | 560
 Logical "1" : Pulse                | 562.5 µs    | 560
 Logical "1" : Space                | 1687.5 µs   | 1690
 Interval                           | 110 ms      | 110000
 Sensitivity                        | 0.0 - 0.5   | 0.5
 Repetitions                        | 1 - 10      | 3
 Bit Length                         | 32 words    | 32
 Prefix (Address)                   | None        | 0x00

### NEC Protocol Frame Structure
Total 32 words (bits), where the LSB (Least Significant Bit) first and second byte is the inverse of the first.

| Address | Address INV | Command | Command INV |
|---------|-------------|---------|-------------|
| 8 bits  | 8 bits      | 8 bits  | 8 bits      |

# Codes
Note the **Adress** is always **0x00** for this specific device.

### Example Power Command

| Addr    | Cmd     | Message  | Address | Address INV | Command                   | Command INV | Telegram.   |
|---------|---------|----------|---------|-------------|---------------------------|-------------|-------------|
| 0       | 69      | 0x0045   | 0x00    | 0xFF        | 0xA2 (bit-reverse 0x45)   | 0x5D        | 0x00FFA25D

`^(?:0x)?(?<ADDR>[0-9A-Fa-f]{2})(?<ADDR_INV>[0-9A-Fa-f]{2})(?<CMD>[0-9A-Fa-f]{2})(?<CMD_INV>[0-9A-Fa-f]{1,2})$`

## Recoder from Remote

 **Button**            | **Command** | **Code + Inverse Code**            | **Notes**          
-----------------------|-------------|------------------------------------|-------------------------------------------
 **ON**               | 0x45        | `1,0,1,0,0,0,1,0, 0,1,0,1,1,1,0,1` | On 


- Normal NEC frame:
    - Leader: 9 ms HIGH + 4.5 ms LOW
	- 32 bits: 8-bit address + 8-bit ~address + 8-bit command + 8-bit ~command

- Note then a button is presses longer there is a NEC repeat frame: 
    - Leader: 9 ms HIGH + 2.25 ms LOW
    - No data bits, only a short end pulse (≈ 562.5 µs HIGH).


## RC5 Protocol (Philips)
- https://en.wikipedia.org/wiki/RC-5
- https://www.sbprojects.net/knowledge/ir/rc5.php
- https://commons.wikimedia.org/wiki/File:Manchester_encoding_both_conventions.svg
- https://github.com/TheHomeyAppBackupRepositories/nl.philips.ir-1/blob/da4a14719d0096bfa0b221838afc2b1da550e333/app.json

 **Parameter**                      | **Value**   | **Code**
------------------------------------|-------------|------------
 Carrier Frequency                  | 36 kHz      | 36000 
 Manchester Unit (half-bit time)   | 889 µs      | 889
 Bit time (constant)                | 1.778 ms    | 1778
 Start of Frame (SOF)               | None        | []
 End of Frame (EOF)                 | None        | []
 Logical "0" (bi-phase)            | HIGH-LOW    | [1, 0]
 Logical "1" (bi-phase)            | LOW-HIGH    | [0, 1]
 Interval (between repetitions)    | 114 ms      | 114000
 Sensitivity                        | 0.0 - 0.5   | 0.5
 Repetitions                        | 1 - 10      | 1
 Bit Length                         | 14 bits     | 14

### RC5 Protocol Frame Structure
Total 14 bits using Manchester (bi-phase) encoding:

| Start 1 | Start 2 | Toggle | Address | Command |
|---------|---------|--------|---------|----------|
| 1 bit   | 1 bit   | 1 bit  | 5 bits  | 6 bits   |

- **Start bits**: Always logical '1' (both)
- **Toggle bit**: Flips on each new key press (not on repeat)
- **Address**: 5 bits, MSB first (device address 0x00-0x1F)
- **Command**: 6 bits, MSB first (command 0x00-0x3F)