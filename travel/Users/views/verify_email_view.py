# Users/views/verify_email_view.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import AccessToken
from django.utils import timezone
from Users.models import CustomUser

class VerifyEmailView(APIView):
    def get(self, request, token):
        try:
            access_token = AccessToken(token)
            if not access_token.get("email_verification"):
                return Response({"error": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)

            user_id = access_token["user_id"]
            user = CustomUser.objects.get(id=user_id)

            if user.is_verified:
                return Response({"message": "Already verified."}, status=status.HTTP_200_OK)

            user.is_verified = True
            user.save()

            return Response({"message": "Email verified successfully."}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": f"Invalid or expired token: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
