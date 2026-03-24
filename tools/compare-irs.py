#!/usr/bin/env python3

our_output = "0000 006D 0022 0000 0156 00AB 0015 0015 0015 0015 0015 0015 0015 0015 0015 0015 0015 0015 0015 0015 0015 0015 0015 0040 0015 0040 0015 0040 0015 0040 0015 0040 0015 0040 0015 0040 0015 0040 0015 0040 0015 0015 0015 0040 0015 0015 0015 0015 0015 0015 0015 0040 0015 0015 0015 0015 0015 0040 0015 0015 0015 0040 0015 0040 0015 0040 0015 0015 0015 0040 0015 05F1"

irs_output = "0000 006C 0022 0000 015B 00AD 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0041 0016 0041 0016 0041 0016 0041 0016 0041 0016 0041 0016 0041 0016 0041 0016 0041 0016 0016 0016 0041 0016 0016 0016 0016 0016 0016 0016 0041 0016 0016 0016 0016 0016 0041 0016 0016 0016 0041 0016 0041 0016 0041 0016 0016 0016 0041 0016 05F7"

our_parts = our_output.split()
irs_parts = irs_output.split()

print("Volledige vergelijking:")
print("="*80)

print("\nHeader:")
for i in range(4):
    match = "✓" if our_parts[i] == irs_parts[i] else "✗"
    diff = int(our_parts[i], 16) - int(irs_parts[i], 16)
    print(f"{match} [{i}] {our_parts[i]} vs {irs_parts[i]} (diff: {diff:+d})")

print("\nTrailing gap:")
match = "✓" if our_parts[-1] == irs_parts[-1] else "✗"
diff = int(our_parts[-1], 16) - int(irs_parts[-1], 16)
print(f"{match} [-1] {our_parts[-1]} vs {irs_parts[-1]} (diff: {diff:+d}, ~{abs(diff)*26:.0f}µs)")

print("\nSamenvatting verschillen:")
print(f"  Freq code: 006D vs 006C (diff: +1)")
print(f"  AGC pulse: 0156 vs 015B (diff: -5, ~130µs)")
print(f"  AGC space: 00AB vs 00AD (diff: -2, ~52µs)")  
print(f"  Bit pulse: 0015 vs 0016 (diff: -1, ~26µs)")
print(f"  Trailing:  05F1 vs 05F7 (diff: -6, ~156µs)")
print(f"\n  Totale output lengte: {len(our_parts)} vs {len(irs_parts)} ✓")
print(f"\n✅ Trailing gap succesvol toegevoegd!")
print(f"   Verschil nu slechts 6 counts (156µs) i.p.v. 40ms verschil")

