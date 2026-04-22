from django.urls import path
from .views import (
    MeView,
    AdminUserListAllView,
    AdminUserCreateView,
    AdminUserUpdateView,
    AdminRolesUpdateView,
    AdminRolesCreateView,
    LoginView,
    LogoutView,
    csrf_view,
    CreateTestUserView,
)

urlpatterns = [
    #CSRF bootstrap
    path("csrf/", csrf_view, name="csrf"),

    #auth
    path("me/", MeView.as_view(), name="me"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),

    #admin user management
    path("admin/users/", AdminUserListAllView.as_view(), name="admin-users"),
    path("admin/users/create/", AdminUserCreateView.as_view(), name="create-user"),
    path("admin/users/<int:pk>/", AdminUserUpdateView.as_view(), name="admin-user-update-delete"),
    path("admin/users/<int:pk>/roles/", AdminRolesUpdateView.as_view(), name="admin-user-roles"),

    #admin roles
    path("admin/roles/", AdminRolesCreateView.as_view(), name="admin-roles"),

    #dev utility
    path("dev/create-test-user/", CreateTestUserView.as_view(), name="create-test-user"),
]
