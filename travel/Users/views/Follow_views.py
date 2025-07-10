from rest_framework import viewsets, status, generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import action
from django.contrib.auth import get_user_model
from django.db.models import Q

from Users.models import Follow
from Journal.serializers import PublicUserSerializer

User = get_user_model()

class FollowViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = PublicUserSerializer

    def get_queryset(self):
        followed_id = self.request.query_params.get('followed')
        if followed_id:
            try:
                followed_user = User.objects.get(id=followed_id)
                return User.objects.filter(
                    id__in=Follow.objects.filter(
                        follower=self.request.user, followed=followed_user
                    ).values_list('followed_id', flat=True)
                )
            except User.DoesNotExist:
                return User.objects.none()
        return User.objects.filter(
            id__in=Follow.objects.filter(follower=self.request.user).values_list('followed_id', flat=True)
        )

    @action(detail=False, methods=['get'], url_path='status')
    def check_follow_status(self, request):
        followed_id = request.query_params.get('followed')
        if not followed_id:
            return Response(
                {"detail": "Followed user ID is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            followed = User.objects.get(id=followed_id)
            is_following = Follow.objects.filter(
                follower=request.user, followed=followed
            ).exists()
            return Response({"is_following": is_following}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )

    def create(self, request, *args, **kwargs):
        followed_id = request.data.get('followed')
        if not followed_id:
            return Response(
                {"detail": "Followed user ID is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            followed = User.objects.get(id=followed_id)
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        if followed == request.user:
            return Response(
                {"detail": "Cannot follow yourself."},
                status=status.HTTP_400_BAD_REQUEST
            )
        if Follow.objects.filter(follower=request.user, followed=followed).exists():
            return Response(
                {"detail": "Already following this user."},
                status=status.HTTP_400_BAD_REQUEST
            )

        Follow.objects.create(follower=request.user, followed=followed)
        serializer = PublicUserSerializer(followed, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        try:
            follow = Follow.objects.get(follower=request.user, followed__id=kwargs['pk'])
        except Follow.DoesNotExist:
            return Response(
                {"detail": "Not following this user."},
                status=status.HTTP_404_NOT_FOUND
            )
        follow.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class UserSuggestionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        followed_ids = Follow.objects.filter(
            follower=request.user
        ).values_list('followed__id', flat=True)

        suggestions = User.objects.filter(
            ~Q(id__in=followed_ids),
            ~Q(id=request.user.id)
        ).order_by('?')

        paginator = PageNumberPagination()
        paginator.page_size = 10
        page = paginator.paginate_queryset(suggestions, request)

        serializer = PublicUserSerializer(page, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)

class ProfileView(generics.RetrieveAPIView):
    serializer_class = PublicUserSerializer
    permission_classes = [IsAuthenticated]
    queryset = User.objects.all()
    lookup_field = 'id'

class FollowersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id=None):
        if user_id is None:
            user = request.user  # Current user for /api/Users/followers/
        else:
            try:
                user = User.objects.get(id=user_id)  # Specific user for /api/Users/followers/:userId/
            except User.DoesNotExist:
                return Response(
                    {"detail": "User not found."},
                    status=status.HTTP_404_NOT_FOUND
                )

        followers = User.objects.filter(
            id__in=Follow.objects.filter(followed=user).values_list('follower_id', flat=True)
        )

        paginator = PageNumberPagination()
        paginator.page_size = 10
        page = paginator.paginate_queryset(followers, request)

        serializer = PublicUserSerializer(page, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)

class FollowingView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id=None):
        if user_id is None:
            user = request.user  # Current user for /api/Users/following/
        else:
            try:
                user = User.objects.get(id=user_id)  # Specific user for /api/Users/following/:userId/
            except User.DoesNotExist:
                return Response(
                    {"detail": "User not found."},
                    status=status.HTTP_404_NOT_FOUND
                )

        following = User.objects.filter(
            id__in=Follow.objects.filter(follower=user).values_list('followed_id', flat=True)
        )

        paginator = PageNumberPagination()
        paginator.page_size = 10
        page = paginator.paginate_queryset(following, request)

        serializer = PublicUserSerializer(page, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)