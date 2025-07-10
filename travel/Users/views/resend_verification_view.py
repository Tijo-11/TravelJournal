from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from Users.utils.email_utils import send_verification_email
from Users.models import CustomUser
import logging

logger = logging.getLogger(__name__)

class ResendVerificationEmailView(APIView):
    def post(self, request):
        email = request.data.get('email')
        if not email:
            logger.error("Resend verification failed: No email provided")
            return Response(
                {'error': 'Email is required', 'code': 'missing_email'},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            user = CustomUser.objects.get(email=email)
            if user.is_verified:
                logger.info(f"Resend verification attempted for already verified user: {email}")
                return Response(
                    {'error': 'Email is already verified', 'code': 'already_verified'},
                    status=status.HTTP_200_OK
                )
            logger.info(f"Sending verification email to {email}")
            send_verification_email(user)
            return Response(
                {'message': 'Verification email sent'},
                status=status.HTTP_200_OK
            )
        except CustomUser.DoesNotExist:
            logger.error(f"Resend verification failed: User not found for email {email}")
            return Response(
                {'error': 'Failed to resend verification email', 'code': 'user_not_found'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Resend verification failed for {email}: {str(e)}")
            return Response(
                {'error': 'Failed to resend verification email', 'code': 'server_error'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )