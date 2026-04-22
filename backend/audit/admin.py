from django.contrib import admin
from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display  = ("timestamp", "event_type", "user", "username_attempted", "ip_address", "path")
    list_filter   = ("event_type",)
    search_fields = ("user__username", "username_attempted", "description", "path")
    readonly_fields = ("timestamp", "user", "username_attempted", "event_type",
                       "description", "ip_address", "path", "extra")

    #prevent anyone from creating or deleting audit entries through admin
    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False