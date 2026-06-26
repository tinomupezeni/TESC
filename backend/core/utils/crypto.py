"""
Encryption utilities using Fernet (AES-256)

Supports key rotation via MultiFernet:
- Decryption: Tries all keys in FERNET_KEYS (allows reading old data)
- Encryption: Always uses the FIRST key (newest)

Key rotation process:
1. Generate new key: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
2. Add new key as FIRST in CRYPTOGRAPHY_KEYS: new_key,old_key
3. Deploy - old data still readable, new data uses new key
4. Run: python manage.py reencrypt_data
5. After all data re-encrypted, remove old key from CRYPTOGRAPHY_KEYS
"""

from cryptography.fernet import Fernet, MultiFernet, InvalidToken
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
import logging

logger = logging.getLogger(__name__)

# Cache the fernet instances
_fernet_instance = None
_multi_fernet_instance = None


def get_fernet_keys():
    """Get all configured Fernet keys."""
    keys = getattr(settings, 'FERNET_KEYS', [])
    if not keys or not keys[0]:
        raise ImproperlyConfigured(
            "CRYPTOGRAPHY_KEYS is not set in .env. "
            "Generate a key with: python -c \"from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())\""
        )
    return keys


def get_fernet():
    """
    Get a single Fernet instance using the primary (first) key.
    Used for encryption only.
    """
    global _fernet_instance
    if _fernet_instance is None:
        keys = get_fernet_keys()
        _fernet_instance = Fernet(keys[0].encode())
    return _fernet_instance


def get_multi_fernet():
    """
    Get a MultiFernet instance that can decrypt with any key.
    - Decrypts using any key in the list (tries each one)
    - Encrypts using the FIRST key (newest)
    """
    global _multi_fernet_instance
    if _multi_fernet_instance is None:
        keys = get_fernet_keys()
        fernet_instances = [Fernet(k.encode()) for k in keys]
        _multi_fernet_instance = MultiFernet(fernet_instances)
    return _multi_fernet_instance


def encrypt_value(value: str) -> str:
    """Encrypt a string value using the primary key."""
    if not value:
        return value
    f = get_multi_fernet()
    return f.encrypt(value.encode()).decode()


def decrypt_value(value: str) -> str:
    """
    Decrypt a string value, trying all available keys.
    Returns the original value if decryption fails (data may be plain text).
    """
    if not value:
        return value
    try:
        f = get_multi_fernet()
        return f.decrypt(value.encode()).decode()
    except InvalidToken:
        # Data might be plain text or encrypted with unknown key
        logger.warning(f"Failed to decrypt value (length={len(value)}). May be plain text.")
        return value


def rotate_token(encrypted_value: str) -> str:
    """
    Re-encrypt a value with the current primary key.
    Useful for key rotation - decrypts with any key, encrypts with newest.

    Returns:
        - Re-encrypted value if successful
        - Original value if it's not encrypted or decryption fails
    """
    if not encrypted_value:
        return encrypted_value

    try:
        f = get_multi_fernet()
        # MultiFernet.rotate() decrypts with any key and re-encrypts with the first
        return f.rotate(encrypted_value.encode()).decode()
    except InvalidToken:
        # Not a valid Fernet token - might be plain text
        # Encrypt it with the current key
        return encrypt_value(encrypted_value)


def clear_cache():
    """Clear cached Fernet instances. Call after key changes."""
    global _fernet_instance, _multi_fernet_instance
    _fernet_instance = None
    _multi_fernet_instance = None


def generate_key() -> str:
    """Generate a new Fernet key."""
    return Fernet.generate_key().decode()
