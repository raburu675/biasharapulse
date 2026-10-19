import os
from pathlib import Path
import dj_database_url

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get(
    'SECRET_KEY',
    'django-insecure-^2pmskkwblgbupv51$)iad=h2d6l#-tg%62!9ql=fie8fdk!y9'
)

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get('DEBUG', 'True') == 'True'

ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '*').split(',')


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework.authtoken',
    'app',
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'flutterbackend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'flutterbackend.wsgi.application'


# ═══════════════════════════════════════════════════════════
# DATABASE
# ═══════════════════════════════════════════════════════════
#
# Only ONE of these blocks should be uncommented at a time.
#
# ── LOCAL (SQLite) — use when running on your laptop ──
# DATABASES = {
#     'default': dj_database_url.config(
#         default=f'sqlite:///{BASE_DIR / "db.sqlite3"}',
#         conn_max_age=600,
#     )
# }
#
# ── RAILWAY (Postgres) — use when you move to Railway ──
# DATABASES = {
#     'default': dj_database_url.config(
#         conn_max_age=600,
#         conn_health_checks=True,
#     )
# }
#
# ── RENDER (Postgres, free tier) — CURRENTLY ACTIVE ──
# DATABASES = {
#     'default': dj_database_url.config(
#         conn_max_age=600,
#         conn_health_checks=True,
#     )
# }
DATABASES = {
    'default': dj_database_url.config(
        default=f'sqlite:///{BASE_DIR / "db.sqlite3"}',
        conn_max_age=600,
        conn_health_checks=True,
    )
}


# Password validation

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]


# Internationalization

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True


# ═══════════════════════════════════════════════════════════
# STATIC FILES
# ═══════════════════════════════════════════════════════════

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# ── ORIGINAL (manifest version) — uncomment when you're ready
#    to fail the build on missing static files (local, Railway, or
#    any environment where you've verified every asset is present).
# STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# ── RENDER (non-manifest) — CURRENTLY ACTIVE
#    Forgiving version for first-time deploys. Won't fail the build
#    if a referenced static file is missing. Switch back to the
#    manifest version once the deploy is stable.
STATICFILES_STORAGE = 'whitenoise.storage.CompressedStaticFilesStorage'


# ═══════════════════════════════════════════════════════════
# CORS
# ═══════════════════════════════════════════════════════════

# ── ORIGINAL (allow all) — fine for local testing
# CORS_ALLOW_ALL_ORIGINS = True

# ── RENDER (specific origin) — CURRENTLY ACTIVE
#    Replace the URL with your deployed frontend's actual hostname.
#    Add more entries to the list if you have multiple frontends.
CORS_ALLOWED_ORIGINS = [
    'https://your-project-id.web.app',
    'https://your-project-id.firebaseapp.com',
]


# ═══════════════════════════════════════════════════════════
# REST FRAMEWORK
# ═══════════════════════════════════════════════════════════

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'app.authentication.ExpiringTokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
}