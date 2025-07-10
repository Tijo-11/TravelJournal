from django.urls import path, include
from Users.views.register_login_views import RegisterView, LoginView, LogoutView
from Users.views.user_views import ProfileView, PasswordResetRequestView, EditUserDetailView,PublicProfileView
from Users.views.admin_views import AdminUserListView, AdminUserDetailView, AdminBlockUserView
from rest_framework_simplejwt.views import TokenRefreshView
from Users.views.verify_email_view import VerifyEmailView
from Users.views.resend_verification_view import ResendVerificationEmailView

from rest_framework.routers import DefaultRouter
from Users.views.Follow_views import FollowViewSet, UserSuggestionsView, FollowersView, FollowingView

router = DefaultRouter()
router.register('follow', FollowViewSet, basename='follow')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('profile/<int:userId>/', PublicProfileView.as_view(), name='public-profile'),
    path('password-reset/', PasswordResetRequestView.as_view(), name='password-reset'),
    path('admin/users/', AdminUserListView.as_view(), name='admin-users'),
    path('admin/users/<int:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('admin/users/<int:pk>/block/', AdminBlockUserView.as_view(), name='admin-block-user'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('edit-profile/', EditUserDetailView.as_view(), name='edit-profile'),
    path('resend-verification/', ResendVerificationEmailView.as_view(), name='resend-verification'),
    path('verify-email/<str:token>/', VerifyEmailView.as_view(), name='verify-email'),
    
    path('', include(router.urls)),
    path('suggestions/', UserSuggestionsView.as_view(), name='user-suggestions'),
    path('followers/', FollowersView.as_view(), name='followers'),
    path('followers/<int:user_id>/', FollowersView.as_view(), name='user-followers'),
    path('following/', FollowingView.as_view(), name='following'),
    path('following/<int:user_id>/', FollowingView.as_view(), name='user-following'),
    
]

# <int:pk> in the URL pattern captures an integer from the URL and passes it as the pk (primary key) 
# argument to the view.
# This lets the view retrieve a specific user by their unique ID for 
# detailed operations like view, update, or delete.

# edit-profile/ doesn’t need an ID because it operates on the currently authenticated user, identified via 
# the request (e.g., request.user).

# TokenRefreshView from rest_framework_simplejwt.views handles refreshing JWT access tokens 
# using a valid refresh token. It allows clients to obtain a new access token without re-authenticating, 
# keeping the user logged in securely.

# path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
# This URL pattern maps the 'refresh/' endpoint to the TokenRefreshView, enabling clients to send a refresh token 
# and get a new access token. It supports maintaining user sessions securely without requiring users to log in again.