import os
import sys
import django
import uuid
import re

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model
from django.core import mail
from django.conf import settings

User = get_user_model()

def run_smoke_test():
    print("--- Starting Password Reset Smoke Test ---")
    
    # Force use of memory email backend so we can read the email programmatically
    settings.EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'
    mail.outbox = []
    
    # 1. Create a dummy user
    dummy_email = f"reset_test_{uuid.uuid4().hex[:6]}@test.com"
    old_password = "OldPassword123!"
    new_password = "NewPassword456!"
    
    print(f"\n1. Creating dummy user: {dummy_email}")
    user = User.objects.create_user(
        username=dummy_email,
        email=dummy_email,
        password=old_password
    )
    
    client = Client()
    
    # 2. Request Password Reset
    print("\n2. Hitting /api/users/password-reset/ endpoint...")
    response = client.post('/api/users/password-reset/', {'email': dummy_email})
    print(f"   Status Code: {response.status_code}")
    print(f"   Response: {response.json()}")
    assert response.status_code == 200, "Failed to request password reset"
    
    # 3. Read the email from the outbox
    print("\n3. Checking Django email outbox...")
    assert len(mail.outbox) == 1, "No email was sent!"
    sent_email = mail.outbox[0]
    print(f"   Subject: {sent_email.subject}")
    
    # Extract uid and token using regex
    # Link format: .../reset-password?uid=XYZ&token=ABC-123
    body = sent_email.body
    match = re.search(r"uid=([^&]+)&token=([^\s]+)", body)
    if not match:
        print("❌ Failed to parse uid and token from email body")
        print(f"Body: {body}")
        sys.exit(1)
        
    uid = match.group(1)
    token = match.group(2)
    print(f"   Extracted UID: {uid}")
    print(f"   Extracted Token: {token}")
    
    # 4. Confirm Password Reset
    print("\n4. Hitting /api/users/password-reset-confirm/ endpoint...")
    response = client.post('/api/users/password-reset-confirm/', {
        'uid': uid,
        'token': token,
        'new_password': new_password
    })
    print(f"   Status Code: {response.status_code}")
    print(f"   Response: {response.json()}")
    assert response.status_code == 200, "Failed to confirm password reset"
    
    # 5. Verify the password actually changed
    print("\n5. Verifying password change in database...")
    user.refresh_from_db()
    assert user.check_password(new_password) is True, "Password did not change!"
    assert user.check_password(old_password) is False, "Old password still works!"
    print("✅ Password successfully updated!")
    
    # Cleanup
    user.delete()
    print("\n--- Smoke Test Completed Successfully ---")

if __name__ == "__main__":
    run_smoke_test()
