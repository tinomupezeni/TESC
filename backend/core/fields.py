from django.db import models
from core.utils.crypto import get_fernet
import datetime  

class EncryptedTextField(models.TextField):
    def get_prep_value(self, value):
        if value is None:
            return value
        
        
        if isinstance(value, (datetime.date, datetime.datetime)):
            value = value.isoformat()
        
        # Ensure it is a string before encoding
        if not isinstance(value, str):
            value = str(value)

        f = get_fernet()
        return f.encrypt(value.encode()).decode()

    def from_db_value(self, value, expression, connection):
        if value is None:
            return value
        f = get_fernet()
        return f.decrypt(value.encode()).decode()

    def to_python(self, value):
        # If this field is used for dates, you might want to 
        # convert back to a date object here if necessary,
        # but returning the string is fine for now.
        return value
