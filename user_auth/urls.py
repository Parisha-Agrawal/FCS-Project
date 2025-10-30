from django.conf import settings
from django.conf.urls.static import static
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView
from .views import check_block_status, register_user, login_user, get_users, get_profile, update_profile, send_message, get_messages, pay, send_otp, validate_otp, payment_gateway
from .views import admin_get_users, admin_verify_user, admin_reject_user, admin_get_user_documents, admin_login
from django.views.decorators.csrf import csrf_exempt
import json
from django.contrib.auth import authenticate, login
from django.http import JsonResponse
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import create_group, user_groups, send_group_message, get_group_messages, remove_friend, list_friends
from rest_framework.routers import DefaultRouter
from .views import MessageViewSet, follow_user, search_users, send_friend_request, accept_friend_request, decline_friend_request, block_user, unblock_user, list_relationships, manage_relationship, get_user_id, FriendRequestViewSet

from django.urls import path, include 

router = DefaultRouter()
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'friend-requests', FriendRequestViewSet, basename='friend-requests')

@csrf_exempt  # Disable CSRF for API calls (use proper security in production)
def api_login(request):
    if request.method == "POST":
        data = json.loads(request.body)
        username = data.get("username")
        password = data.get("password")
        user = authenticate(username=username, password=password)

        if user is not None:
            login(request, user)
            return JsonResponse({"message": "Login successful"}, status=200)
        else:
            return JsonResponse({"message": "Invalid credentials"}, status=401)


urlpatterns = [
    path('register/', register_user, name="register"),
    path('login/', login_user, name="login"),
    path('users/', get_users, name="get_users"),
    path('profile/', get_profile, name="profile"),  
    path('update_profile/', update_profile, name="update_profile"),

    # Add JWT authentication endpoints
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("token/verify/", TokenVerifyView.as_view(), name="token_verify"),

    path('send-message/', send_message, name='send_message'),
    path('pay/', pay, name='pay'),
    path('send_otp/', send_otp, name='send_otp'),
    path('validate_otp/', validate_otp, name='validate_otp'),
    path('payment_gateway/', payment_gateway, name='payment_gateway'),
    path('get-messages/', get_messages, name='get_messages'),
    path("admin/login/", admin_login, name="admin_login"),
    path("admin/users/", admin_get_users, name="admin_get_users"),
    path("admin/verify-user/<int:user_id>/", admin_verify_user, name="admin_verify_user"),
    path("admin/reject-user/<int:user_id>/", admin_reject_user, name="admin_reject_user"),
    path("admin/user-documents/<int:user_id>/", admin_get_user_documents, name="admin_get_user_documents"),
    
    path("api/login/", api_login, name="api_login"),
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    path('create-group/', create_group, name='create_group'),
    path("user-groups/", user_groups, name="user-groups"),
    path('send-group-message/<int:group_id>/', send_group_message, name='send-group-message'),  
    path('get-group-messages/<int:group_id>/', get_group_messages, name='get-group-messages'),  
    path('follow/', follow_user, name='follow_user'),
    path('search-users/', search_users, name='search_users'),

    path('send-friend-request/', send_friend_request),
    path('accept-friend-request/', accept_friend_request),
    path('decline-friend-request/<int:pk>/', decline_friend_request),
    path('block-user/', block_user),
    path('unblock-user/', unblock_user),
    path('relationships/<str:rel_type>/', list_relationships),
    path('remove-friend/', remove_friend),
    path('list-friends/', list_friends),
    path('friend-requests/<int:pk>/cancel/', FriendRequestViewSet.cancel_friend_request),
    path('manage-relationship/', manage_relationship, name='manage_relationship'),
    path('get-user-id/', get_user_id, name='get_user_id'),
    path('check-block-status/', check_block_status, name='check_block_status'),

    
]

urlpatterns += router.urls


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)