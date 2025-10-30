from django.urls import path
from .views import admin_reports_list, get_users
# from .views import UserListView
from .views import admin_login
from .views import verify_user

urlpatterns = [
    path("users/", get_users, name="get_users"),
    # path("api/admin/users/", UserListView.as_view(), name="admin-users"),
    path("api/admin/login/", admin_login, name="admin-login"),
    path('users/verify/<int:user_id>/', verify_user, name="verify_user"),
    path("reports/", admin_reports_list, name="admin_reports"),
]
