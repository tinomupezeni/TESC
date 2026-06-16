import sys
from cryptography.fernet import Fernet

key = b'Q4XPvwv7sTDLIgp7YuOd0JVKUp4bdQVDKFDNJaY75II='
f = Fernet(key)

matches = []
with open('tesc_db_backup_20260615.sql', 'r') as file:
    for line in file:
        if 'gAAAAAB' in line:
            parts = line.split('\t')
            for i, part in enumerate(parts):
                if part.startswith('gAAAAAB'):
                    try:
                        decrypted = f.decrypt(part.encode()).decode()
                        if 'davis' in decrypted.lower() or 'muza' in decrypted.lower():
                            line_prefix = str(parts[0:2])
                            matches.append(f"Line: {line_prefix} -> Decrypted field {i}: {decrypted}")
                    except Exception as e:
                        pass

for m in matches:
    print(m)
if not matches:
    print("No matches found after decryption.")
