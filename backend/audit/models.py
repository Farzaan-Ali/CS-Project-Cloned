from django.db import models
from django.conf import settings


class AuditLog(models.Model):

    #=============
    # Event types
    LOGIN           = "LOGIN"
    LOGOUT          = "LOGOUT"
    LOGIN_FAILED    = "LOGIN_FAILED"
    USER_ACTION     = "USER_ACTION"
    ADMIN_CHANGE    = "ADMIN_CHANGE"
    PERMISSION_CHANGE = "PERMISSION_CHANGE"
    TOOL_USAGE      = "TOOL_USAGE"
    CONNECTOR_RUN   = "CONNECTOR_RUN"
    CONNECTOR_FAILED = "CONNECTOR_FAILED"

    EVENT_TYPES = [
        (LOGIN,             "Login"),
        (LOGOUT,            "Logout"),
        (LOGIN_FAILED,      "Login Failed"),
        (USER_ACTION,       "User Action"),
        (ADMIN_CHANGE,      "Admin Change"),
        (PERMISSION_CHANGE, "Permission Change"),
        (TOOL_USAGE,        "Tool Usage"),
        (CONNECTOR_RUN,     "Connector Run"),
        (CONNECTOR_FAILED,  "Connector Failed"),
    ]

    # ======================
    # Fields

    # who did it, nullable because failed logins may have no valid user
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="audit_logs",
    )

    #raw username string, useful when login fails and user FK is null
    username_attempted = models.CharField(max_length=150, blank=True, default="")

    event_type  = models.CharField(max_length=32, choices=EVENT_TYPES)
    description = models.TextField()                        # human-readable summary
    ip_address  = models.GenericIPAddressField(null=True, blank=True)
    path        = models.CharField(max_length=512, blank=True, default="")  # URL path
    extra       = models.JSONField(default=dict, blank=True) # any additional structured data
    timestamp   = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-timestamp"]  # newest first
        indexes  = [
            models.Index(fields=["event_type"]),
            models.Index(fields=["user"]),
            models.Index(fields=["timestamp"]),
        ]

    def __str__(self):
        who = self.user.username if self.user else (self.username_attempted or "anonymous")
        return f"[{self.timestamp:%Y-%m-%d %H:%M:%S}] {self.event_type} — {who}"