from rest_framework import serializers, generics
from accounts.permissions import CanViewAuditLog
from .models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = [
            "id",
            "timestamp",
            "username",
            "username_attempted",
            "event_type",
            "description",
            "ip_address",
            "path",
            "extra",
        ]

    def get_username(self, obj):
        return obj.user.username if obj.user else None


class AuditLogListView(generics.ListAPIView):
    """
    GET /api/audit/logs/
    returns audit log
    Only accessible to Django superusers 

    Optional query filters:
      ?event_type=LOGIN
      ?user=jsmith
    """
    serializer_class = AuditLogSerializer
    permission_classes = [CanViewAuditLog]   # is_staff=True required

    def get_queryset(self):
        qs = AuditLog.objects.select_related("user").all()

        event_type = self.request.query_params.get("event_type")
        if event_type:
            qs = qs.filter(event_type=event_type)

        username = self.request.query_params.get("user")
        if username:
            qs = qs.filter(user__username=username)

        return qs