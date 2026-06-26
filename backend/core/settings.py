from pathlib import Path
import os
from dotenv import load_dotenv
from datetime import timedelta # Added timedelta

# Load environment variables
load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# --- SECURITY CONFIGURATION ---

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv("SECRET_KEY")

# 🔐 AES-256 Field Encryption (Fernet) - Supports key rotation
# Format: CRYPTOGRAPHY_KEYS=new_key,old_key1,old_key2 (newest first)
# The first key is used for encryption, all keys are tried for decryption
_crypto_keys = os.getenv("CRYPTOGRAPHY_KEYS") or os.getenv("CRYPTOGRAPHY_KEY") or ""
FERNET_KEYS = [k.strip() for k in _crypto_keys.split(",") if k.strip()]

print(FERNET_KEYS)

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG=False

ALLOWED_HOSTS = [
    'tesc.zchpc.ac.zw',
    'tesc-inst.zchpc.ac.zw',
    '10.50.200.35',
    '127.0.0.1',
    'localhost',
    '*', # Add this
]


# --- APPLICATION DEFINITION ---

INSTALLED_APPS = [
    'corsheaders',
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    'rest_framework_simplejwt',

    # Third-party
    "rest_framework",
    'django_filters',

    # Local Apps
    "users",
    "academic",
    'instauth',
    'faculties',
    "staff",
    "reports",
    "analysis",
    "innovation",
    "iseop",
]


MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


ROOT_URLCONF = "core.urls"


TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]


WSGI_APPLICATION = "core.wsgi.application"

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}



AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
]


REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    )
}

# --- SIMPLE_JWT SETTINGS ---
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUDIENCE': None,
    'ISSUER': None,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'USER_AUTHENTICATION_RULE': 'rest_framework_simplejwt.authentication.default_user_authentication_rule',
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
    'JTI_CLAIM': 'jti',
    'SLIDING_TOKEN_REFRESH_EXP_CLAIM': 'refresh_exp',
    'SLIDING_TOKEN_LIFETIME': timedelta(minutes=5),
    'SLIDING_TOKEN_REFRESH_LIFETIME': timedelta(days=1),
}

# --- INTERNATIONALIZATION ---

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True


# --- STATIC FILES ---

STATIC_URL = "static/"
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')


DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# --- AUTH MODEL ---

AUTH_USER_MODEL = 'users.CustomUser'


# --- CORS & CSRF CONFIGURATION ---

CORS_ALLOW_ALL_ORIGINS = True

CORS_ALLOWED_ORIGINS = [
    "http://localhost:8080",
    "http://127.0.0.1:8000",
    "http://127.0.0.1",
    "http://localhost:8081",
    "http://localhost",
    "http://10.50.200.35",
    "http://10.50.200.35:8081",
    "http://10.50.200.35:8082",
    "https://tesc-inst.zchpc.ac.zw",
    "https://tesc.zchpc.ac.zw",
    "http://tesc-inst.zchpc.ac.zw",
    "http://tesc.zchpc.ac.zw",
]


CSRF_TRUSTED_ORIGINS = [
    "http://localhost",
    "http://127.0.0.1",
    "http://10.50.200.35",
    "http://10.50.200.35:8081",
    "http://10.50.200.35:8082",
    "https://tesc.zchpc.ac.zw",
    "https://tesc-inst.zchpc.ac.zw",
    "http://tesc.zchpc.ac.zw",
    "http://tesc-inst.zchpc.ac.zw",
]
