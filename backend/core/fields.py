from django.db import models
from core.utils.crypto import get_fernet
from cryptography.fernet import InvalidToken
import datetime


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
    def get_prep_value(self, value):
        if value is None:
            return value

        if isinstance(value, (datetime.date, datetime.datetime)):
            value = value.isoformat()

        # Ensure it is a string before encoding
        if not isinstance(value, str):
            value = str(value)

        # If already encrypted, don't double-encrypt
        if is_fernet_token(value):
            return value

        f = get_fernet()
        return f.encrypt(value.encode()).decode()

    def from_db_value(self, value, expression, connection):
        if value is None:
            return value

        # Try to decrypt - if it fails, the data is plain text
        try:
            f = get_fernet()
            return f.decrypt(value.encode()).decode()
        except InvalidToken:
            # Data is not encrypted (plain text) - return as-is
            # It will be encrypted on next save
            return value

    def to_python(self, value):
        # If this field is used for dates, you might want to
        # convert back to a date object here if necessary,
        # but returning the string is fine for now.
        return value
