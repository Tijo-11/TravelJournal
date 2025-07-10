import resend
from django.conf import settings
from Users.utils.jwt_utils import generate_email_verification_token
import logging

logger = logging.getLogger(__name__)

resend.api_key = settings.RESEND_API_KEY

def send_verification_email(user):
    try:
        token = generate_email_verification_token(user)
        url = f"{settings.FRONTEND_URL}/verify-email/{token}/"
        logger.info(f"Sending verification email to {user.email} with URL: {url}")

        resend.Emails.send({
            "from": "onboarding@resend.dev",
            "to": user.email,
            "subject": "Verify your TravelJournal account",
            "html": f"<p>Click below to verify your email:</p><a href='{url}'>Verify Email</a>"
        })
        logger.info(f"Verification email sent successfully to {user.email}")
    except Exception as e:
        logger.error(f"Failed to send verification email to {user.email}: {str(e)}")
        raise