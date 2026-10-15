from datetime import timedelta
from django.utils import timezone
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from rest_framework.exceptions import AuthenticationFailed

# How long a login stays valid
TOKEN_TTL = timedelta(days=14)


class ExpiringTokenAuthentication(TokenAuthentication):
    """Same as TokenAuthentication, but rejects tokens older than TOKEN_TTL."""

    def authenticate_credentials(self, key):
        user, token = super().authenticate_credentials(key)
        if timezone.now() - token.created > TOKEN_TTL:
            token.delete()
            raise AuthenticationFailed('Session expired. Please sign in again.')
        return user, token


def fresh_token(user):
    """Returns the user's token, replacing it if it has expired."""
    token, _ = Token.objects.get_or_create(user=user)
    if timezone.now() - token.created > TOKEN_TTL:
        token.delete()
        token = Token.objects.create(user=user)
    return token