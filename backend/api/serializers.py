from rest_framework import serializers

class GeneralSDKSerializer(serializers.Serializer):
    #standardized these fields to sdk can be used elsewhere more easily
    id = serializers.IntegerField()
    name = serializers.CharField(max_length=200)
    status = serializers.CharField(max_length=50)
    last_updated = serializers.DateTimeField()

    # specific data for different tools without changing the code.
    metadata = serializers.JSONField()

#serializers for login
class LoginRequestSerializer(serializers.Serializer):
    #matches provided [UserLogin] coloumn
    UserLogin = serializers.CharField(max_length=15)
    Password = serializers.CharField(write_only=True)
    #the label the frontend passes to tell Django which DB to use
    ConnectionLabel = serializers.CharField(max_length=50, default="default_rcc_db")

class LoginResponseSerializer(serializers.Serializer):
    token = serializers.CharField()
    DisplayName = serializers.CharField()
    Role = serializers.CharField()
    Portal = serializers.CharField()
    IsActive = serializers.BooleanField()