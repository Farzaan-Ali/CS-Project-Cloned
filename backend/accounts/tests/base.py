import unittest 
from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from rest_framework.test import APIClient

User = get_user_model()

class BaseTestCase(TestCase):
     """
     Basic Django Tests template, allows you to make test to checking
     the different views and models and return responses to the terminal

     It setups up the base server that it will quit after it runs and it 
     already does all the database and server clean up for any new models
     made. Also creates a regular and an admin user and admin user with 
     the username, password and email.
     """
     def setUp(self):
          self.client = APIClient()
          self.groups = create_groups()

          # regular user 
          self.user = User.objects.create_user(
               username="testuser",
               password="TestPass123",
               email="testuser@example.com"
          )
        
          # admin user 
          self.admin = User.objects.create_superuser(
               username="adminuser",
               password="TestPass123",
               email="admin@example.com"
          )
     def login_as_user(self):
          self.client.force_authenticate(user=self.user)

     def login_as_admin(self):
          self.client.force_authenticate(user=self.admin)

     def logout(self):
          self.client.force_authenticate(user=None)

def create_groups():
    """
    Creates the four role groups with correct permissions and
    must be called in setUp() for any test that checks RBAC.
    """
    content_type = ContentType.objects.get_for_model(User)
 
    perm_manage_roles, _ = Permission.objects.get_or_create(codename="manageRoles",      content_type=content_type)
    perm_manage_conns, _ = Permission.objects.get_or_create(codename="manageConnections", content_type=content_type)
    perm_view_audit,   _ = Permission.objects.get_or_create(codename="viewAuditLog",      content_type=content_type)
    perm_create_users, _ = Permission.objects.get_or_create(codename="createUsers",       content_type=content_type)
 
    viewer,    _ = Group.objects.get_or_create(name="Viewer")
    editor,    _ = Group.objects.get_or_create(name="Editor")
    moderator, _ = Group.objects.get_or_create(name="Moderator")
    admin,     _ = Group.objects.get_or_create(name="Admin")
 
    moderator.permissions.set([perm_manage_conns, perm_view_audit, perm_create_users])
    admin.permissions.set([perm_manage_roles, perm_manage_conns, perm_view_audit, perm_create_users])