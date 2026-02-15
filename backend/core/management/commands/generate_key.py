"""
Management command to generate a new Fernet encryption key.

Usage:
    python manage.py generate_key
"""

from django.core.management.base import BaseCommand
from cryptography.fernet import Fernet


class Command(BaseCommand):
    help = 'Generate a new Fernet encryption key for CRYPTOGRAPHY_KEYS'

    def handle(self, *args, **options):
        key = Fernet.generate_key().decode()

        self.stdout.write("\n" + "="*60)
        self.stdout.write(self.style.SUCCESS("New Fernet Encryption Key Generated"))
        self.stdout.write("="*60)
        self.stdout.write(f"\n{key}\n")
        self.stdout.write("="*60)

        self.stdout.write(self.style.WARNING("\nKey Rotation Instructions:"))
        self.stdout.write("1. Add the new key as FIRST in your .env file:")
        self.stdout.write(f"   CRYPTOGRAPHY_KEYS={key},<your_old_key>")
        self.stdout.write("")
        self.stdout.write("2. Deploy the application (old data still readable)")
        self.stdout.write("")
        self.stdout.write("3. Run the re-encryption command:")
        self.stdout.write("   python manage.py reencrypt_data")
        self.stdout.write("")
        self.stdout.write("4. Once all data is re-encrypted, you can remove the old key")
        self.stdout.write("   (optional, but reduces attack surface)")
        self.stdout.write("")
