import logging
import datetime
from django.db import models
from cryptography.fernet import InvalidToken
# Import get_fernet as the multi-fernet tool
from core.utils.crypto import get_fernet

logger = logging.getLogger(__name__)

class EncryptedTextField(models.TextField):
    description = "An encrypted text field"

    @staticmethod
    def is_fernet_token(value):
        """Check if a string looks like a Fernet token."""
        if not isinstance(value, str):
            return False
        return value.startswith('gAAAAA')

    def get_prep_value(self, value):
        """Encrypt value before saving to database."""
        if value is None:
            return value

        # Convert dates/datetimes to ISO strings
        if isinstance(value, (datetime.date, datetime.datetime)):
            value = value.isoformat()

        if not isinstance(value, str):
            value = str(value)

        # Use the static method to check for existing encryption
        if self.is_fernet_token(value):
            return value

        try:
            # Use the imported get_fernet
            f = get_fernet()
            return f.encrypt(value.encode()).decode()
        except Exception as e:
            logger.error(f"Encryption failed: {e}")
            return value

    def from_db_value(self, value, expression, connection):
        if value is None:
            return value
        try:
            f = get_fernet()
            return f.decrypt(value.encode()).decode()
        except (InvalidToken, Exception):
            return value

    def to_python(self, value):
        if value is None:
            return value
        try:
            f = get_fernet()
            # If it's already a token, decrypt it
            if self.is_fernet_token(value):
                return f.decrypt(value.encode()).decode()
            return value
        except Exception:
            return value