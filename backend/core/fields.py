from django.db import models
from core.utils.crypto import get_fernet
import datetime
from cryptography.fernet import InvalidToken


class EncryptedTextField(models.TextField):
    def get_prep_value(self, value):
        if value is None:
            return value

        if isinstance(value, (datetime.date, datetime.datetime)):
            value = value.isoformat()

        if not isinstance(value, str):
            value = str(value)

        f = get_fernet()
        return f.encrypt(value.encode()).decode()

    def from_db_value(self, value, expression, connection):
        if value is None:
            return value

        try:
            f = get_fernet()
            return f.decrypt(value.encode()).decode()
        except InvalidToken:
            # In case DB already contains plaintext
            return value

    def to_python(self, value):
        if value is None:
            return value

        # If it's already decrypted, just return it
        try:
            f = get_fernet()
            return f.decrypt(value.encode()).decode()
        except Exception:
            return value
