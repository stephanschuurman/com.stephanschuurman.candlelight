# IR Codes of LED Candles


## Taizhou Sparkle Lights Co., Ltd - BAT-LEDS01
The item is also sold under the house brand of HEMA, a well-known Dutch department store.

**Protocol:** NEC  
**Address:** 0x00

| Button | Code |
|--------|------|
| ON     | 0x45 |
| OFF    | 0x47 |
| 2H     | 0x44 |
| 4H     | 0x43 |
| 6H     | 0x07 |
| 8H     | 0x09 |

**Source:**
https://www.hema.nl/wonen-slapen/wonen/kaarsen/led-kaarsen/oplaadbare-theelichtjes---4-stuks-13550076.html

---

## Deluxe Homeart

**Protocol:** NEC  
**Address:** 0x00

| Button | Code         |
|--------|--------------|
| ON     | 0x5E         |
| OFF    | 0x0C         |
| 2H     | 0x5E + 0x46  |
| 4H     | 0x5E + 0x40  |
| 6H     | 0x5E + 0x15  |
| 8H     | 0x5E + 0x19  |

---

## Gerson - LED Candle

**Protocol:** NEC  
**Address:** 0x02

| Button      | Code |
|-------------|------|
| Power On    | 0x00 |
| Power Off   | 0x01 |
| Mood        | 0x02 |
| 5 Hours     | 0x04 |
| 8 Hours     | 0x05 |
| Color Fade  | 0x06 |
| Decrease    | 0x08 |
| Increase    | 0x0A |
| Cool Wick   | 0x0E |
| Green       | 0x11 |
| Blue        | 0x12 |
| Cyan        | 0x14 |
| Magenta     | 0x15 |

---

## Leap

**Protocol:** NEC  
**Address:** 0x00

| Function        | Command |
|-----------------|---------|
| ON              | 0x00    |
| OFF             | 0x02    |
| Timer (2h)      | 0x04    |
| Timer (4h)      | 0x06    |
| Timer (6h)      | 0x08    |
| Timer (8h)      | 0x0A    |
| Mode: Candle    | 0x0C    |
| Mode: Light     | 0x0E    |
| Dim (-)         | 0x10    |
| Dim (+)         | 0x12    |

**Reference:** https://leap.tardate.com/electronics101/led/remotecontrolcandles/

---

## Generic Dancing Flame Candles

**Protocol:** NEC  
**Source:** https://community.home-assistant.io/t/dancing-flame-candles-ir-remote-light/630802

| Button | Code (MSB) | Code (LSB) |
|--------|------------|------------|
| ON | 0xFFA25D | 0xFF45BA |
| OFF | 0xFFE21D | 0xFF47B8 |
| Mode: Candle | 0xFFE01F | 0xFF07F8 |
| Mode: Light | 0xFF906F | 0xFF09F6 |
| Brightness - | 0xFF6897 | 0xFF16E9 |
| Brightness + | 0xFFB04F | 0xFF0DF2 |

---

## Luminara Smart Candle

**Protocol:** NEC  
**Address:** 0x00  
**Source:** https://forum.mysensors.org/topic/993/ir-switch-for-luminara-candle-automation-repost-with-video-photos-and-final-sketch/21

| Button | Code |
|--------|------|
| ON | 0x46 |
| OFF | 0x15 |

---

## Krinner Lumix IR Remote

**Source:** https://tasmota.github.io/docs/Codes-for-IR-Remotes/#christmas-candle-weihnachtsbeleuchtung

Remote control has two buttons and three channels.
- Button 1 is to switch on
- Button 0 is to switch off
- Double click on button 1 is flicker mode

No usable protocol found yet, but raw mode does it.

### Channel A
| Function | Raw IR Code |
|----------|-------------|
| OFF | `0,2000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400, 400,1000, 400,1000, 400,1000, 400,2000,5600,2000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400, 400,1000, 400,1000, 400,1000, 400,2000,5600,2000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400, 400,1000, 400,1000, 400,1000, 400,2000,5600` |
| ON | `0,2000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400, 400,2000,5600,2000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400, 400,2000,5600,2000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400, 400,2000,5600` |
| FLICKER | `0,2000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400, 400,1000, 400,1100,1000, 400, 400,2000,5600,2000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400, 400,1000, 400,1100,1000, 400, 400,2000,5600,2000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400, 400,1000, 400,1100,1000, 400, 400,2000,5600` |

### Channel B
| Function | Raw IR Code |
|----------|-------------|
| OFF | `0,2000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400,1000, 400, 400,1000, 400,1000, 400,2000,5600,2000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400,1000, 400, 400,1000, 400,1000, 400,2000,5600,2000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400,1000, 400, 400,1000, 400,1000, 400,2000,5600` |
| ON | `0,2000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400,1000, 400,1000, 400,1000, 400, 400,2000,5600,2000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400,1000, 400,1000, 400,1000, 400, 400,2000,5600,2000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400,1000, 400,1000, 400,1000, 400, 400,2000,5600` |
| FLICKER | `0,2000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400,1000, 400, 400,1100,1000, 400, 400,2000,5600,2000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400,1000, 400, 400,1100,1000, 400, 400,2000,5600,2000,1000, 400,1000, 400, 400,1000,1000, 400,1000, 400,1000, 400, 400,1100,1000, 400, 400,2000,5600` |

### Channel C
| Function | Raw IR Code |
|----------|-------------|
| OFF | `0,2000,1000, 400,1000, 400, 400,1000,1000, 400, 400,1000,1000, 400, 400,1000, 400,1000, 400,2000,5600,2000,1000, 400,1000, 400, 400,1000,1000, 400, 400,1000,1000, 400, 400,1000, 400,1000, 400,2000,5600,2000,1000, 400,1000, 400, 400,1000,1000, 400, 400,1000,1000, 400, 400,1000, 400,1000, 400,2000,5600` |
| ON | `0,2000,1000, 400,1000, 400, 400,1000,1000, 400, 400,1000,1000, 400,1000, 400,1000, 400, 400,2000,5600,2000,1000, 400,1000, 400, 400,1000,1000, 400, 400,1000,1000, 400,1000, 400,1000, 400, 400,2000,5600,2000,1000, 400,1000, 400, 400,1000,1000, 400, 400,1000,1000, 400,1000, 400,1000, 400, 400,2000,5600` |
| FLICKER | `0,2000,1000, 400,1000, 400, 400,1000,1000, 400, 400,1000,1000, 400, 400,1100,1000, 400, 400,2000,5600,2000,1000, 400,1000, 400, 400,1000,1000, 400, 400,1000,1000, 400, 400,1100,1000, 400, 400,2000,5600,2000,1000, 400,1000, 400, 400,1000,1000, 400, 400,1000,1000, 400, 400,1100,1000, 400, 400,2000,5600` |

---

## Vinkor Flameless Flickering Candles (and clones probably)

**Protocol:** NEC  
**Source:** https://tasmota.github.io/docs/Codes-for-IR-Remotes/#vinkor-flameless-flickering-candles-and-clones-probably

| Button | Code |
|--------|------|
| ON | 0x10ED00FF |
| OFF | 0x10ED40BF |
| DIM | 0x10ED08F7 |
| BRIGHT | 0x10ED48B7 |
| CANDLE | 0x10ED30CF |
| LIGHT | 0x10ED708F |
| 2H | 0x10ED20DF |
| 4H | 0x10ED609F |
| 6H | 0x10ED10EF |
| 8H | 0x10ED50AF |

---

## Duni Warm White LED Candle / Duni Warmweiß LED Kerzen

**Protocol:** NEC  
**Address:** 0x00  
**Source:** https://tasmota.github.io/docs/Codes-for-IR-Remotes/#duni-warm-white-led-candle--duni-warmweiß-led-kerzen

| Button | Code |
|--------|------|
| ON | 0xFF00FF |
| OFF | 0xFF807F |
| 4H | 0xFF40BF |
| 8H | 0xFFC03F |
| Mode: Candle | 0xFF20DF |
| Mode: Light | 0xFFA05F |
| Mode: Dark | 0xFF906F |
| Mode: Bright | 0xFFE01F |
| Mode: Moon | 0xFF10EF |
| Mode: Night Light | 0xFF609F |

---

## Duni Multicoloured LED Candle / Duni Mehrfarbige LED Kerzen

**Protocol:** NEC  
**Source:** https://tasmota.github.io/docs/Codes-for-IR-Remotes/#duni-multicoloured-led-candle--duni-mehrfarbige-led-kerzen

| Button | Code (MSB) | Code (LSB) |
|--------|------------|------------|
| ON | 0x807F48B7 | 0x01FE12ED |
| OFF | 0x807F807F | 0x01FE01FE |
| Mode: Smooth | 0x807F58A7 | 0x01FE1AE5 |
| Mode: Night Light | 0x807F7887 | 0x01FE1EE1 |
| Mode: Candle | 0x807F40BF | 0x01FE02FD |
| Mode: Light | 0x807FC03F | 0x01FE03FC |
| Mode: Timer | 0x807F20DF | 0x01FE04FB |
| Mode: Dark | 0x807FA05F | 0x01FE05FA |
| Mode: Bright | 0x807F609F | 0x01FE06F9 |
| Color: Red | 0x807FE01F | 0x01FE07F8 |
| Color: Green | 0x807F10EF | 0x01FE08F7 |
| Color: Blue | 0x807F906F | 0x01FE09F6 |
| Color: Orange | 0x807F50AF | 0x01FE0AF5 |
| Color: Light Green | 0x807FD827 | 0x01FE1BE4 |
| Color: Light Blue | 0x807FF807 | 0x01FE1FE0 |
| Color: Violet | 0x807F30CF | 0x01FE0CF3 |
| Color: Yellow | 0x807FB04F | 0x01FE0DF2 |
| Color: Blue White | 0x807F708F | 0x01FE0EF1 |
| Color: Pink | 0x807F00FF | 0x01FE00FF |
| Color: Yellow White | 0x807FF00F | 0x01FE0FF0 |
| Color: White | 0x807F9867 | 0x01FE19E6 |

---

## Fishtec Bougie / Generic Multicolored Led Candle / Generische mehrfarbige LED Kerzen

**Protocol:** NEC  
**Source:** https://tasmota.github.io/docs/Codes-for-IR-Remotes/#fishtec-bougie--generic-multicolored-led-candle--generische-mehrfarbige-led-kerzen

| Button | Code |
|--------|------|
| ON | 0x1FE48B7 |
| OFF | 0x1FE58A7 |
| Color: Blue | 0x1FE609F |
| Color: Red | 0x1FE20DF |
| Color: Green | 0x1FEA05F |
| Color: White | 0x1FE30CF |
| Color: Turkis | 0x1FE10EF |
| Color: Orange | 0x1FE50AF |
| Color: Pink | 0x1FE708F |
| Color: Purple | 0x1FEF807 |
| Color: Light Purple | 0x1FE906F |
| Color: Light Blue | 0x1FED827 |
| Color: Ocean Blue | 0x1FEB04F |
| Mode: Multi Color | 0x1FEC03F |
| Mode: Switch | 0x1FE7887 |

---

Make: ???
Model: Magic Lighting' Remote

https://arduinoplusplus.wordpress.com/2021/11/26/ir-remote-codes/

---
