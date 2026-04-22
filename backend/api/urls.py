from django.urls import path
from .views import platform_ping, SDKGeneralListView

# path( 'url_pattern/', view_to_call, name='unique_identity' )
# 1. 'url_pattern/': The string the browser and frontend types after the base URL
# 2. view_to_call: The actual Python function/class to execute
# 3. name='...': An internal nickname so URL can be changed without needing to change the rest of the code

urlpatterns = [
    #this creates the endpoint: /api/v1/ping/
    path('v1/ping/', platform_ping, name='platform_ping'),

    path('sdk/tools/', SDKGeneralListView.as_view(), name = 'sdk-tools-list'),
    

]