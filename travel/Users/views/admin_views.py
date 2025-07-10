from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from django.core.mail import send_mail
from django.conf import settings
from Users.serializers import UserSerializer
from Users.models import CustomUser
import logging

logger = logging.getLogger(__name__)

class AdminUserListView(generics.ListCreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer  #tells the view which serializer to use for validating input and formatting output data.
    permission_classes = [IsAdminUser]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True) #checks if the input data is valid according to the serializer rules.If validation fails, it raises a ValidationError immediately, returning a 400 Bad Request with error details.
        user = serializer.save() #calls the serializer’s create() or update() method to save the validated data to the database.

        logger.info(f"Admin created user: {user.email}")

        # Skipping email verification here as accounts created by admin are trusted
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)#partial = kwargs.pop('partial', False) checks if the update should be partial, defaulting to False.
        instance = self.get_object()
        if instance.is_superuser and not request.user.is_superuser:
            return Response({"error": "Cannot edit superuser accounts"}, status=status.HTTP_403_FORBIDDEN)
        serializer = self.get_serializer(instance, data=request.data, partial=partial) #This initializes the serializer with an existing instance and new data from the request
        logger.info(f"PUT request data: {request.data}") #Logging request.data can expose sensitive user info 
        serializer.is_valid(raise_exception=True)
        logger.info(f"Validated data: {serializer.validated_data}")
        self.perform_update(serializer) #calls the serializer’s save() method to apply the validated changes to the database.
        instance.refresh_from_db() # reloads the model instance from the database, updating it with the latest saved values.
        logger.info(f"Updated instance: {UserSerializer(instance).data}")
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs): #handles DELETE requests to remove an object from the database. pk, id extra are captured by args and kwargs. DRF passes URL params (like pk) via kwargs
        instance = self.get_object() #retrieves the specific model instance the view is supposed to work with, based on URL parameters like pk.
        if instance.id == request.user.id:
            return Response({"error": "Cannot delete your own account"}, status=status.HTTP_403_FORBIDDEN)
        if instance.is_superuser:
            return Response({"error": "Cannot delete superuser accounts"}, status=status.HTTP_403_FORBIDDEN)
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

class AdminBlockUserView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        try:
            user = CustomUser.objects.get(pk=pk)
            if user.id == request.user.id:
                return Response({"error": "Cannot block your own account"}, status=status.HTTP_403_FORBIDDEN)
            if user.is_superuser:
                return Response({"error": "Cannot block superuser accounts"}, status=status.HTTP_403_FORBIDDEN)
            user.is_blocked = not user.is_blocked
            user.save()
            return Response({"message": f"User {'blocked' if user.is_blocked else 'unblocked'}"})
        except CustomUser.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        
        
# A POST request is used here because it changes server state by toggling the user’s is_blocked status, 
# even though it doesn’t create a new resource.
# Using POST for actions that modify data without creating fits REST principles better than GET, 
# which should be safe and idempotent.
#POST is often used for custom actions like “block/unblock” since they don’t fit neatly into 
# standard CRUD (create/read/update/delete).
#Some APIs use PATCH or PUT for such changes, but POST for custom actions is widely accepted and clear.
