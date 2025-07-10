from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MyJournalListCreateView,
    MyJournalDetailView,
    FeedJournalListView,
    ExploreJournalListView,
    LikeJournalViewSet,
    CommentJournalViewSet,
    ShareJournalViewSet,
    ProfileJournalListView,  # New view
)

router = DefaultRouter()
router.register('likes', LikeJournalViewSet, basename='like')
router.register('comments', CommentJournalViewSet, basename='comment')
router.register('shared-journals', ShareJournalViewSet, basename='shared-journal')

urlpatterns = [
    path('', include(router.urls)),
    path('journals/my/', MyJournalListCreateView.as_view(), name='my-journal-list-create'),
    path('journals/my/<int:pk>/', MyJournalDetailView.as_view(), name='my-journal-detail'),
    path('journals/feed/', FeedJournalListView.as_view(), name='feed-journal-list'),
    path('journals/explore/', ExploreJournalListView.as_view(), name='explore-journal-list'),
    path('journals/profile/', ProfileJournalListView.as_view(), name='profile-journal-list'),  # New endpoint
]