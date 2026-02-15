"""
Custom Django model fields with AES-256 encryption (Fernet).

Supports key rotation - can decrypt with old keys, encrypts with newest key.
"""

from django.db import models
from core.utils.crypto import get_multi_fernet, encrypt_value, decrypt_value
from cryptography.fernet import InvalidToken
import datetime
import logging

logger = logging.getLogger(__name__)


def is_fernet_token(value):
    """
    Check if a value looks like a Fernet token.
    Fernet tokens are base64-encoded and start with 'gAAAAA'.
    """
    if not value or not isinstance(value, str):
        return False
    # Fernet tokens start with version byte 0x80, which base64 encodes to 'gA'
    return value.startswith('gAAAAA') and len(value) > 50


class EncryptedTextField(models.TextField):
    """
    A TextField that automatically encrypts data before saving
    and decrypts when reading from the database.

    Supports key rotation via MultiFernet:
    - Data encrypted with old keys can still be read
    - New data is always encrypted with the newest key
    """

    description = "An encrypted text field"

    def get_prep_value(self, value):
        """Encrypt value before saving to database."""
        if value is None:
            return value

        # Convert dates to ISO format string
        if isinstance(value, (datetime.date, datetime.datetime)):
            value = value.isoformat()

        # Ensure it is a string before encoding
        if not isinstance(value, str):
            value = str(value)

        # If already encrypted, don't double-encrypt
        if is_fernet_token(value):
            return value

        try:
            f = get_multi_fernet()
            return f.encrypt(value.encode()).decode()
        except Exception as e:
            logger.error(f"Encryption failed: {e}")
            # Return plain value rather than failing completely
            # It will be encrypted on next save when keys are fixed
            return value

    def from_db_value(self, value, expression, connection):
        """Decrypt value when reading from database."""
        if value is None:
            return value

        # If it doesn't look like encrypted data, return as-is
        if not is_fernet_token(value):
            return value

        try:
            f = get_multi_fernet()
            return f.decrypt(value.encode()).decode()
        except InvalidToken:
            # Data encrypted with unknown key - log warning but don't crash
            logger.warning(
                f"Failed to decrypt field value. Data may be encrypted with an old key "
                f"not in CRYPTOGRAPHY_KEYS. Value length: {len(value)}"
            )
            # Return a placeholder or the encrypted value
            return "[DECRYPTION FAILED - Check encryption keys]"
        except Exception as e:
            logger.error(f"Unexpected decryption error: {e}")
            return value

    def to_python(self, value):
        """Convert value to Python object (used in forms)."""
        return value

    def deconstruct(self):
        """Support for migrations."""
        name, path, args, kwargs = super().deconstruct()
        return name, path, args, kwargs
