from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from .models import ROLE_HIERARCHY

User = get_user_model()

class MeSerializer(serializers.ModelSerializer):
    roles = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "department", "roles", "permissions"]

    def get_roles(self, obj) -> list:
        return list(obj.groups.values_list("name", flat=True))

    def get_permissions(self, obj) -> list:
        return list(obj.get_all_permissions())
    
class AdminUserSerializer(serializers.ModelSerializer):
    roles = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "department",
            "roles",
            "is_active",
        ]

    def get_roles(self, obj):
        return list(obj.groups.values_list("name", flat=True))


class UpdateUserRolesSerializer(serializers.ModelSerializer):
    role_ids = serializers.PrimaryKeyRelatedField(
        source="groups",
        queryset=Group.objects.all(),
        many=True,
        write_only=True
    )
    roles = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = ["id", "email", "username", "role_ids", "roles"]

    def get_roles(self, obj):
        return list(obj.groups.values_list("name", flat=True))

    def update(self, instance, validated_data):
        groups = validated_data.pop("groups", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if groups is not None:
            instance.groups.set(groups)

        instance.save()
        return instance
     
class CreateUserSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(choices=list(ROLE_HIERARCHY.keys()))
    password = serializers.CharField(write_only=True)
    is_active = serializers.BooleanField(required=False, default=True)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "first_name",
            "last_name",
            "department",
            "role",
            "password",
            "is_active",
        ]

class AdminUpdateUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            "email",
            "first_name",
            "last_name",
            "department",
            "is_active",
            "password",
        ]

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()
        return instance
    
    def create(self, validated_data):
        role_name = validated_data.pop("role")
        password = validated_data.pop("password")

        user = User(**validated_data)
        user.set_password(password)
        user.save()

        group_names = ROLE_HIERARCHY[role_name]
        groups = Group.objects.filter(name__in=group_names)
        user.groups.set(groups)

        return user

class GroupSerializer(serializers.ModelSerializer):
     class Meta:
        model = Group
        fields = ["id", "name"]
