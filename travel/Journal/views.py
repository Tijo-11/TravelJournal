from rest_framework import generics, viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q, Count, F, Value, CharField
from django.db.models.functions import Coalesce
from .models import Journal, Like, Comment, SharedJournal
from .serializers import JournalSerializer, LikeSerializer, CommentSerializer, SharedJournalSerializer
from .permissions import IsOwnerOrAdminDeleteOnly
from Users.models import Follow
from .querysets import with_engagement_scores

class MyJournalListCreateView(generics.ListCreateAPIView):
    """
    GET: List user's own journals.
    POST: Create a new journal.
    """
    serializer_class = JournalSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdminDeleteOnly]

    def get_queryset(self):
        # Use existing like_count and comment_count fields; only annotate share_count
        qs = Journal.objects.filter(user=self.request.user).annotate(
            annotated_share_count=Count('shares', distinct=True)
        )
        return with_engagement_scores(qs).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class MyJournalDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET, PUT, DELETE for a single user's journal.
    """
    serializer_class = JournalSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdminDeleteOnly]

    def get_queryset(self):
        return Journal.objects.filter(user=self.request.user)

class FeedJournalListView(generics.ListAPIView):
    """
    Journals from followed users and shared journals (user's feed).
    """
    serializer_class = JournalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        followed_users = Follow.objects.filter(follower=user).values_list('followed', flat=True)
        shared_journal_ids = SharedJournal.objects.filter(user__in=followed_users).values_list('journal', flat=True)

        # Use existing like_count and comment_count; annotate share_count
        qs = Journal.objects.filter(
            Q(user__in=followed_users) | Q(id__in=shared_journal_ids)
        ).distinct().annotate(
            annotated_share_count=Count('shares', distinct=True)
        )
        return with_engagement_scores(qs).order_by('-engagement_score')

class ExploreJournalListView(generics.ListAPIView):
    """
    Discover popular journals globally (not just followed users).
    """
    serializer_class = JournalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Use existing like_count and comment_count; annotate share_count
        qs = Journal.objects.annotate(
            annotated_share_count=Count('shares', distinct=True)
        )
        return with_engagement_scores(qs).order_by('-engagement_score')

class ProfileJournalListView(generics.ListAPIView):
    """
    List user's own journals and shared journals, sorted by recency.
    """
    serializer_class = JournalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Fetch owned journals
        owned_journals = Journal.objects.filter(user=user).annotate(
            annotated_share_count=Count('shares', distinct=True),
            display_date=F('created_at'),  # Use journal's created_at
            is_shared=Value(False, output_field=CharField())
        )
        # Fetch shared journals
        shared_journals = Journal.objects.filter(
            shares__user=user
        ).annotate(
            annotated_share_count=Count('shares', distinct=True),
            display_date=F('shares__created_at'),  # Use share's created_at
            is_shared=Value(True, output_field=CharField()),
            shared_by_user_id=F('shares__user__id')
        ).select_related('user', 'shares__user')

        # Combine and sort by display_date
        return (owned_journals | shared_journals).order_by('-display_date')

class LikeJournalViewSet(viewsets.ModelViewSet):
    """
    Create/Remove user likes.
    """
    serializer_class = LikeSerializer
    permission_classes = [IsAuthenticated]
    queryset = Like.objects.all()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_queryset(self):
        return Like.objects.filter(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.user != request.user:
            return Response({"detail": "You can only unlike your own likes."}, status=status.HTTP_403_FORBIDDEN)
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

class CommentJournalViewSet(viewsets.ModelViewSet):
    """
    Create, update, delete comments on journals.
    """
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdminDeleteOnly]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_queryset(self):
        return Comment.objects.filter(user=self.request.user)

class ShareJournalViewSet(viewsets.ModelViewSet):
    """
    Share or unshare a journal.
    """
    serializer_class = SharedJournalSerializer
    permission_classes = [IsAuthenticated]
    queryset = SharedJournal.objects.all()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_queryset(self):
        return SharedJournal.objects.filter(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.user != request.user:
            return Response({"detail": "You can only delete your own shares."}, status=status.HTTP_403_FORBIDDEN)
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)