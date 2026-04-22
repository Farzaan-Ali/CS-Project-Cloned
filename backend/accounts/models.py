from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
'''
Abstract Base User provides the core implementation of a user model
including hashed passwords and tokenized password resets
'''

# Use this to determine which groups to assign when assigning roles to user
# Usage in a view:
#   from accounts.models import ROLE_HIERARCHY
#   groups_to_assign = ROLE_HIERARCHY["Moderator"]
#   # -> ["Viewer", "Editor", "Moderator"]
ROLE_HIERARCHY = {
    "Viewer":    ["Viewer"],
    "Editor":    ["Viewer", "Editor"],
    "Moderator": ["Viewer", "Editor", "Moderator"],
    "Admin":     ["Viewer", "Editor", "Moderator", "Admin"],
}

# Canonical ordered list of roles, lowest to highest
ROLES = list(ROLE_HIERARCHY.keys())
 
 

class User(AbstractUser):
     # AbstractUser already has: username, first_name, last_name, password, etc.
     # Add department for record keeping
     email = models.EmailField(unique=True)
     department = models.CharField(max_length=100, blank=True, default="")
     
     #add additional types of permissions here
     class Meta:
          permissions = [
            # Gates all user/role management endpoints
            ("manageRoles", "Can manage all user roles"),
 
            # gates connection management and connector triggers
            ("manageConnections", "Can manage connections and trigger connector runs"),
 
            # Gates audit log visibility
            ("viewAuditLog", "Can view the audit log"),
 
            # Gates creating new user accounts
            ("createUsers", "Can create new user accounts"),
        ]
 

     def __str__(self):
        return self.username
     