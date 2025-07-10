from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from Users.serializers import UserSerializer, PasswordResetSerializer
from Users.models import CustomUser
from Journal.models import Journal
from Journal.serializers import JournalSerializer
from django.core.mail import send_mail
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.hashers import check_password
import logging
logger = logging.getLogger(__name__)

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        user = request.user
        profile_image = request.FILES.get('profile_image')
        banner_image = request.FILES.get('banner_image')
        if profile_image or banner_image:
            if profile_image:
                user.profile_image = profile_image
            if banner_image:
                user.banner_image = banner_image
            user.save()
        else:
            serializer = UserSerializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer = UserSerializer(user)
        return Response(serializer.data)

class PublicProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, userId):
        try:
            user = CustomUser.objects.get(id=userId)
            user_serializer = UserSerializer(user)
            journals = Journal.objects.filter(user=user).order_by('-created_at')
            journal_serializer = JournalSerializer(journals, many=True, context={'request': request})
            data = {
                'user': user_serializer.data,
                'journals': journal_serializer.data
            }
            return Response(data)
        except CustomUser.DoesNotExist:
            return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)

class PasswordResetRequestView(APIView):
    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user = CustomUser.objects.get(email=email)
            token = RefreshToken.for_user(user).access_token
            subject = 'Password Reset'
            message = f'Click to reset your password: http://localhost:5173/reset-password/{user.id}/{token}/'
            send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [email])
            return Response({"message": "Password reset email sent"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class EditUserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        user = request.user
        current_password = request.data.get('current_password')

        if not current_password:
            return Response({"current_password": "This field is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Check if current_password matches user's password
        if not check_password(current_password, user.password):
            return Response({"current_password": "Incorrect password."}, status=status.HTTP_400_BAD_REQUEST)

        # Remove current_password from data so it doesn't get passed to serializer
        data = request.data.copy()
        data.pop('current_password', None)

        serializer = UserSerializer(user, data=data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            logger.error(f"EditUserDetailView errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)