
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenBlacklistView,
)

urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/login/', TokenObtainPairView.as_view(), name='login'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/logout/', TokenBlacklistView.as_view(), name='logout'),
    path('api/', include('tutores.urls')),
    path('api/', include('pets.urls')),
    path('api/', include('agendamentos.urls')),
]
