from .base import BaseTestCase
from django.contrib.auth import get_user_model

User = get_user_model()

def make_user(username, role=None):
    """Create a plain (non superuser) user and assign cumulative groups"""
    user = User.objects.create_user(
        username=username,
        password="TestPass123",
        email=f"{username}@test.com"
    )
    if role:
        group_names = ROLE_HIERARCHY[role]
        groups = Group.objects.filter(name__in=group_names)
        user.groups.set(groups)
    return user
 

class AdminAbilTest(BaseTestCase):
     
     def test_reg_user(self):
          print("running admin tests")
          self.login_as_user()
          response =  self.client.get("/api/admin/users/")
          self.assertEqual(response.status_code, 403)
     
     def test_admin_user(self):
          self.login_as_admin()
          response = self.client.get("/api/admin/users/")
          self.assertEqual(response.status_code, 200)
     
     def test_view_all_users(self):
          self.login_as_admin()
          response = self.client.get("/api/admin/users/")
          print(response.data)
          self.assertEqual(response.status_code,200)
     
     def test_create_role(self):
          self.login_as_admin()
          response = self.client.get("/api/admin/")
          ...
     def test_create_user(self):
          ...
     def test_update_role(self):
          ...
     def test_update_user(self):
          ...

