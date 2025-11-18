"""
Simple test script for YS-IRTM NEC infrared transceiver module.
Connect to serial port and send/receive NEC infrared codes.
Stephan Schuurman, 2025-11
"""

import serial
import time

# Serial port configuration
SERIAL_PORT = "/dev/cu.usbmodem5A320002981"
BAUD_RATE = 9600

ser = serial.Serial(
    port=SERIAL_PORT,
    baudrate=BAUD_RATE,
    bytesize=serial.EIGHTBITS,
    parity=serial.PARITY_NONE,
    stopbits=serial.STOPBITS_ONE,
    timeout=1
)

print(f"Serial port {SERIAL_PORT} opened: {ser.is_open}")

# References:
# https://roboeq.ir/files/id/7263/name/NEC%20infrared%20codec%20module%20YS-IRTM.pdf/
# https://github.com/mcauser/micropython-ys-irtm

# Send test NEC command (format: A1 F1 + addr + ~addr + cmd)


for i in range(50):
     test_cmd = bytes.fromhex("a1 f1 00 ff 10")
     print(f"TX: {test_cmd.hex(' ')}")
     ser.write(test_cmd)
     time.sleep(0.5)



# Read and decode incoming NEC infrared codes
print("Listening for IR codes...")
while True:
    data = ser.read(3)
    if not data:
        continue

    if len(data) == 3:
        # NEC format: byte0=addr, byte1=~addr, byte2=cmd
        addr = data[0]
        cmd = data[2]
        print(f"RX - Addr: 0x{addr:02x}, Cmd: 0x{cmd:02x}           Msg:  0x{addr:02x}{(~addr & 0xFF):02x} 0x{cmd:02x}{(~cmd & 0xFF):02x}")
