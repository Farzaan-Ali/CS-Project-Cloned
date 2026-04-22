from django.urls import path
from .views import (
    MeView,
    AdminUserListAllView,
    AdminRolesUpdateView,
    AdminRolesCreateView,
    AdminRolesUpdateView,
    LoginView,
    LogoutView,
    csrf_view,
    CreateTestUserView,
)
urlpatterns = [
        #CSRF bootstrap, frontend calls this once on app load to get the cookie
    path("csrf/", csrf_view, name="csrf"),

    path("me/", MeView.as_view(), name="me"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),

    # sysadmin-only
    path("admin/users/", AdminUserListAllView.as_view(), name="admin-users"),
    path("admin/users/<int:pk>/roles/", AdminRolesUpdateView.as_view(), name="admin-user-roles"),
    path("admin/roles/", AdminRolesCreateView.as_view(), name="admin-roles"),

    # Moderator + Admin
    path("admin/users/create/", CreateTestUserView.as_view(), name="create-user"),
]
