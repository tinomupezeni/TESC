from cryptography.fernet import Fernet
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured


def get_fernet():
    key = settings.FERNET_KEYS[0]
    if not key:
        raise ImproperlyConfigured("CRYPTOGRAPHY_KEY is not set in .env")
    return Fernet(key.encode())
