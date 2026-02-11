from django.db import models
from core.utils.crypto import get_fernet


class EncryptedTextField(models.TextField):
    def get_prep_value(self, value):
        if value is None:
            return value
        f = get_fernet()
        return f.encrypt(value.encode()).decode()

    def from_db_value(self, value, expression, connection):
        if value is None:
            return value
        f = get_fernet()
        return f.decrypt(value.encode()).decode()

    def to_python(self, value):
        return value
