# Users/utils/jwt_utils.py
from datetime import timedelta
from django.conf import settings
from rest_framework_simplejwt.tokens import AccessToken

def generate_email_verification_token(user):
    token = AccessToken.for_user(user)
    token.set_exp(lifetime=timedelta(hours=24))  # expires in 24h
    token["email_verification"] = True
    return str(token)
