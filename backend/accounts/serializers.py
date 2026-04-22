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
        fields = ["id", "username", "email", "first_name", "last_name", "department", "roles"]

     def get_roles(self, obj):
        return list(obj.groups.values_list("name", flat=True))


class UpdateUserRolesSerializer(serializers.ModelSerializer):
     # Allow updating the user's groups via a list of group IDs
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
     
     #updates roles whenever a user role is changed/PATCHED
     def update(self, instance, validated_data):
        role_name = validated_data.pop("role")
        group_names = ROLE_HIERARCHY[role_name]
        groups = Group.objects.filter(name__in=group_names)
        # Replace all groups with the full cumulative set for this role
        instance.groups.set(groups)
        instance.save()
        return instance
     
class CreateUserSerializer(serializers.ModelSerializer):
    
    #Create a new user. Accepts a role name and expands it via ROLE_HIERARCHY
    #Password is set properly via set_password() so it gets hashed
    
    role = serializers.ChoiceField(choices=list(ROLE_HIERARCHY.keys()))
    password = serializers.CharField(write_only=True)
 
    class Meta:
        model = User
        fields = ["username", "email", "first_name", "last_name", "department", "role", "password"]
 
    def create(self, validated_data):
        role_name = validated_data.pop("role")
        password = validated_data.pop("password")
 
        user = User(**validated_data)
        user.set_password(password)  # hashes the password — never store plaintext
        user.save()
 
        # Assign all groups in the hierarchy for this role
        group_names = ROLE_HIERARCHY[role_name]
        groups = Group.objects.filter(name__in=group_names)
        user.groups.set(groups)
 
        return user
 


class GroupSerializer(serializers.ModelSerializer):
     class Meta:
        model = Group
        fields = ["id", "name"]