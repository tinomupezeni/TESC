import bleach
from rest_framework import serializers

class SanitizedModelSerializer(serializers.ModelSerializer):
    """
    A base ModelSerializer that automatically sanitizes all string inputs
    using bleach to prevent XSS attacks before they hit the database.
    """
    def to_internal_value(self, data):
        # We need to copy the data since QueryDicts might be immutable
        if hasattr(data, 'copy'):
            sanitized_data = data.copy()
        else:
            sanitized_data = dict(data)
            
        for key, value in sanitized_data.items():
            if isinstance(value, str):
                # Strip all HTML tags entirely for maximum security.
                # If rich text is ever needed, we would pass allowed_tags here.
                sanitized_data[key] = bleach.clean(value, tags=[], attributes={}, strip=True)
                
        return super().to_internal_value(sanitized_data)
