
from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from .serializers import GeneralSDKSerializer
from .providers import MockSDKProvider

from .serializers import LoginRequestSerializer, LoginResponseSerializer
from .providers import SQLServerAuthProvider


@api_view(['GET'])
@permission_classes([AllowAny])
def platform_ping(request):
    return Response({
        "message": "pong",
        "status": "online",
        "platform": "RCC Security Spine" #request condition check
    })



#apiview used to generalize
class SDKGeneralListView(APIView):
    """
    A general API view that the SDK uses to list all available tools.
    This is "general" because it doesn't care about specific tool logic
    """
    permission_classes = [AllowAny] # allow any for internal dev

    def get(self, request):
        # 1. ask provider for data
        provider = MockSDKProvider()
        raw_data = provider.get_internal_tools()
        
        # 2. translate and validate data with the Serializer
        serializer = GeneralSDKSerializer(raw_data, many=True)
        
        # 3. send it to React
        return Response(serializer.data)

class SDKLoginView(APIView):
    """
    authenticates users against a dynamic SQL Server database using connection label
    """
    permission_classes = [AllowAny]

    def post(self, request):
        #1. validate the incoming payload
        request_serializer = LoginRequestSerializer(data=request.data)
        if not request_serializer.is_valid():
            return Response(request_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        #2. extract credentials and the connection label
        user_login = request_serializer.validated_data['UserLogin']
        password = request_serializer.validated_data['Password']
        connection_label = request_serializer.validated_data['ConnectionLabel']
        
        #3. initialize Provider with the specific label frontend requested
        try:
            provider = SQLServerAuthProvider(connection_label=connection_label)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        #4. attempt to login
        auth_result = provider.verify_credentials(user_login, password)

        if not auth_result['success']:
            return Response({"detail": auth_result['error']}, status=status.HTTP_401_UNAUTHORIZED)

        #5. format successful response using schema fields
        response_serializer = LoginResponseSerializer(data={
            "token": auth_result['token'],
            **auth_result['user_data'] #unpack DisplayName, Role, Portal, IsActive
        })
        
        response_serializer.is_valid(raise_exception=True)
        return Response(response_serializer.data, status=status.HTTP_200_OK)