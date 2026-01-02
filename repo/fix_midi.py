import sys
import mido
from mido import MidiFile, MetaMessage

def fix_time_signature(input_file, output_file, num=4, den=4):
    mid = MidiFile(input_file)
    
    # Create a 4/4 time signature message (default)
    # AIVA usually expects this at tick 0 of the first track
    time_sig = MetaMessage('time_signature', numerator=num, denominator=den, time=0)
    
    # Beepbox often puts data in track 1 or later, but metadata usually goes in track 0
    # We insert it at the very beginning of the first track
    if mid.tracks:
        mid.tracks[0].insert(0, time_sig)
        
    mid.save(output_file)
    print(f"Saved fixed MIDI to: {output_file}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python fix_midi.py <input.mid> <output.mid>")
    else:
        fix_time_signature(sys.argv[1], sys.argv[2])
