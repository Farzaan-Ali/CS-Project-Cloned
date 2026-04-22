# audit/logger.py
#
# Manual logging utility. Import `audit_log` anywhere you need to record
# a specific event that the middleware can't infer on its own.
#
# Usage :
#
#   from audit.logger import audit_log
#   from audit.models import AuditLog
#
#   #in a view, after a successful action:
#   audit_log(request, AuditLog.ADMIN_CHANGE,
#             description="User jsmith assigned to role Analyst",
#             extra={"target_user": "jsmith", "role": "Analyst"})
#
#   #for a connector run (no request object available, pass user directly):
#   audit_log(None, AuditLog.CONNECTOR_RUN,
#             description="SQL Server connector ran successfully",
#             user=connector_job.triggered_by,
#             extra={"rows_read": 1200, "connector": "sql_server_v1"})

from .models import AuditLog


def get_client_ip(request):
    """Extract real IP, accounting for proxies."""
    if request is None:
        return None
    forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")


def audit_log(request, event_type, description, user=None, username_attempted="", extra=None):
    """
    Create an AuditLog entry.

    Parameters
    ===========
    request             : Django request object, or None if called outside a view
    event_type          : One of the AuditLog.EVENT_TYPE constants
    description         : Human-readable string describing what happened
    user                : Override the user (defaults to request.user if request is given)
    username_attempted  : Raw username string — use for LOGIN_FAILED events
    extra               : Dict of any additional structured data to store
    """
    resolved_user = user
    if resolved_user is None and request is not None:
        u = getattr(request, "user", None)
        if u and u.is_authenticated:
            resolved_user = u

    AuditLog.objects.create(
        user=resolved_user,
        username_attempted=username_attempted,
        event_type=event_type,
        description=description,
        ip_address=get_client_ip(request),
        path=request.path if request else "",
        extra=extra or {},
    )