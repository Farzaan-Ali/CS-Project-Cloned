# audit/middleware.py
#
# Automatically logs every authenticated request as a USER_ACTION.
# Does not have a ton of detail, that part needs to be done manually
#
# Skipped paths (to avoid spam):
#   /api/me/         (session check on every page load)
#   /api/csrf/       (cookie bootstrap)
#   /admin/          
#   Static files

from .models import AuditLog
from .logger import audit_log

#Paths that fire on every page load and would flood the log with noise
SKIP_PATHS = {
    "/api/me/",
    "/api/csrf/",
}

SKIP_PREFIXES = (
    "/static/",
    "/admin/",   # Django admin has its own logging
)


class AuditMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        # Only log authenticated users, anonymous GETs are noise
        user = getattr(request, "user", None)
        if not user or not user.is_authenticated:
            return response

        path = request.path

        # Skip noisy or irrelevant paths
        if path in SKIP_PATHS:
            return response
        if path.startswith(SKIP_PREFIXES):
            return response

        # Skip GET requests to non-sensitive paths, too much noise
        # Keep GET on admin paths if full read trail is wanted
        if request.method == "GET":
            return response

        # Build a readable description
        status = response.status_code
        description = f"{request.method} {path} → {status}"

        # Classify more specifically where possible
        event_type = AuditLog.USER_ACTION
        if path.startswith("/api/admin/"):
            event_type = AuditLog.ADMIN_CHANGE

        audit_log(
            request,
            event_type,
            description=description,
            extra={"method": request.method, "status": status},
        )

        return response