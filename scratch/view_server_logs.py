import os
import sys

# Reconfigure stdout to use UTF-8 to avoid CP1252 errors on Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def read_last_lines(filename, encodings=['utf-16', 'utf-8', 'latin-1'], num_lines=80):
    if not os.path.exists(filename):
        print(f"{filename} does not exist.")
        return
    
    print(f"\n--- Last {num_lines} lines of {filename} ---")
    size = os.path.getsize(filename)
    chunk_size = min(200000, size)
    with open(filename, 'rb') as f:
        f.seek(size - chunk_size)
        raw_data = f.read()
        
    decoded = ""
    for enc in encodings:
        try:
            decoded = raw_data.decode(enc)
            if len(decoded.strip()) > 10:
                print(f"(Decoded with {enc})")
                break
        except Exception:
            continue
            
    if not decoded:
        print("Failed to decode with any encoding.")
        return
        
    lines = decoded.splitlines()
    for line in lines[-num_lines:]:
        # Safe print replacing non-encodable characters
        print(line.encode('utf-8', errors='replace').decode('utf-8'))

if __name__ == "__main__":
    read_last_lines("debug.log")
    read_last_lines("status_error.log")
