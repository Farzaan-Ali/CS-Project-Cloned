from django.contrib.auth import get_user_model

User = get_user_model()


class EmailBackend:
    # Custom auth backend that authenticates using email instead of username.
    # Registered in settings.py via AUTHENTICATION_BACKENDS.

    def authenticate(self, request, username=None, password=None, **kwargs):
        # username here is the email value sent by the frontend
        try:
            user = User.objects.get(email=username)
        except User.DoesNotExist:
            return None
        return user if user.check_password(password) else None

    def get_user(self, user_id):
        # Required by Django to reload the user from the session
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
        
