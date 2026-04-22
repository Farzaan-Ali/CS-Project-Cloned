from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .serializers import MeSerializer

#stuff for sys admins
from rest_framework import generics
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from .permissions import CanManageRoles
from .serializers import (
    AdminUserSerializer,
    UpdateUserRolesSerializer,
    GroupSerializer,
)

#stuff for dev login and logout
from django.contrib.auth import authenticate, login, logout
from rest_framework.parsers import JSONParser, FormParser, MultiPartParser
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie #we need to exempt the login view from CSRF verification since React won't have the CSRF token.
from django.utils.decorators import method_decorator
from django.http import JsonResponse
from audit.logger import audit_log
from audit.models import AuditLog

# CSRF bootstrap endpoint
# frontend calls GET /api/csrf/ once on app load
# Django sets the csrftoken cookie in the response.
# Every subsequent POST reads that cookie and sends it as X-CSRFToken header
@ensure_csrf_cookie
def csrf_view(request):
    return JsonResponse({"detail": "CSRF cookie set"})


class MeView(APIView):
     '''
     This should be the main profile page of the user
     they should be able to see the perms/roles they have and decide what they would
     see on their front page

     Main profile endpoint for the user.
     Returns identity + roles + permissions for frontend to render tabs/modules.
     '''
     permission_classes = [IsAuthenticated]

    #stripped down to just user data, front end does'nt use wrapper
     def get(self, request):  
        print("Running the Me View")
        return Response(MeSerializer(request.user).data)


User = get_user_model()


class AdminUserListAllView(generics.ListAPIView):
    """
    Lists all Users in the databases
    GET /api/admin/users/ - list all users
    Admin Only
    """
    queryset = User.objects.all().order_by("id")
    serializer_class = AdminUserSerializer
    permission_classes = [CanManageRoles]


class AdminRolesUpdateView(generics.UpdateAPIView):
    """
    Updates different aspects of a User (focus on giving them different roles
    and perms)
    PATCH /api/admin/users/<pk>/roles/ - update a user's role
    Admin Only
    """
    queryset = User.objects.all()
    serializer_class = UpdateUserRolesSerializer
    permission_classes = [CanManageRoles]
    http_method_names = ["patch", "options", "head"]

    def perform_update(self, serializer):
        old_roles = list(serializer.instance.groups.values_list("name", flat=True))
        serializer.save()
        new_roles = list(serializer.instance.groups.values_list("name", flat=True))

        # Manual log, role changes are sensitive, should have explicit detail
        audit_log(
            self.request,
            AuditLog.PERMISSION_CHANGE,
            description=f"Roles updated for user '{serializer.instance.username}'",
            extra={
                "target_user": serializer.instance.username,
                "old_roles": old_roles,
                "new_roles": new_roles,
            },
        )


class AdminRolesCreateView(generics.ListCreateAPIView):
    """
    Creates new roles/permissions
    GET/POST /api/admin/roles/ - list and create roles 
    Admin only
    """
    queryset = Group.objects.all().order_by("name")
    serializer_class = GroupSerializer
    permission_classes = [CanManageRoles]

    def perform_create(self, serializer):
        group = serializer.save()
        audit_log(
            self.request,
            AuditLog.ADMIN_CHANGE,
            description=f"New role created: '{group.name}'",
            extra={"role": group.name},
        )


#safe to be exempt because theres no session before login
@method_decorator(csrf_exempt, name="dispatch")
class LoginView(APIView):
    permission_classes = [AllowAny]
    parser_classes = [JSONParser, FormParser, MultiPartParser]

    """
    POST /api/login/  { username, password }

    csrf_exempt here because:
    The user has no session yet, so there is nothing to protect with CSRF

    Django's CSRF middleware would otherwise 403 every login attempt from
      a fresh browser that hasn't hit /api/csrf/ yet.

    All other endpoints (post-login) remain CSRF-protected via
      SessionAuthentication.
    """

    def post(self, request):
        #add "" to avoid typeError and make sure its None string, not a None 
        email = request.data.get("email", "")
        password = request.data.get("password", "")
        if not email or not password:
            return Response({"detail": "Username and password are required."}, status=400)

        user = authenticate(request, username=email, password=password)

        #if user not found in system
        if user is None:
            # Manual log, middleware can't see who was attempted on a failed auth
            audit_log(
                request,
                AuditLog.LOGIN_FAILED,
                description=f"Failed login attempt for email '{email}'",
                username_attempted=email,
            )
            return Response({"detail": "Invalid username or password."}, status=400)

        if not user.is_active:
            audit_log(
                request,
                AuditLog.LOGIN_FAILED,
                description=f"Login attempt for disabled account '{email}'",
                username_attempted=email,
            )
            return Response({"detail": "This account is disabled."}, status=403)

        login(request, user)  # sets session cookie

        # Manual log, middleware skips /api/login/ (it's csrf_exempt + pre-session)
        audit_log(
            request,
            AuditLog.LOGIN,
            description=f"User '{user.username}' logged in",
            user=user,
        )
        return Response({"detail": "Logged in"})


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Log before the session is destroyed (after, request.user is anonymous)
        audit_log(
            request,
            AuditLog.LOGOUT,
            description=f"User '{request.user.username}' logged out",
        )
        logout(request)
        return Response({"detail": "Logged out"})


class CreateTestUserView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        if not User.objects.filter(username="admin@test.com").exists():
            User.objects.create_superuser(
                username="admin@test.com",
                email="admin@test.com",
                password="1234"
            )
            return Response({"message": "SUCCESS! Test user created. You can now log in with admin@test.com and password 1234."})
        return Response({"message": "Test user already exists! Go log in."})
