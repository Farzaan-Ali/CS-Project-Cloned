from rest_framework.permissions import BasePermission

'''
+------------------------------+--------+--------+-----------+-------+
| Action                       | Viewer | Editor | Moderator | Admin |
+------------------------------+--------+--------+-----------+-------+
| Log in / use platform        |   X    |   X    |     X     |   X   |
| View and use analysis tools  |   X    |   X    |     X     |   X   |
| Edit tool configurations     |        |   X    |     X     |   X   |
| Manage connections           |        |   X    |     X     |   X   |
| Trigger connector runs       |        |        |     X     |   X   |
| Create new users             |        |        |     X     |   X   |
| View audit logs              |        |        |     X     |   X   |
| Manage users and roles       |        |        |           |   X   |
| Create/delete roles          |        |        |           |   X   |
+------------------------------+--------+--------+-----------+-------+
'''
class CanManageRoles(BasePermission):
    #Admin only - manage users, assign roles, create/delete roles
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.has_perm("accounts.manageRoles")
        )


class CanManageConnections(BasePermission):
    #Moderator and above - manage connections, trigger connector runs
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.has_perm("accounts.manageConnections")
        )


class CanViewAuditLog(BasePermission):
    #Moderator and above - read-only access to audit logs
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.has_perm("accounts.viewAuditLog")
        )


class CanCreateUsers(BasePermission):
    #Moderator and Admin - create new user accounts
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.has_perm("accounts.createUsers")
        )