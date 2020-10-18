from django.urls import path
from .views import ProductCode, ObtainToken, \
    CustomUserCreate, Message, BlacklistToken, ProductTextCode
from rest_framework_simplejwt import views as jwt_views


urlpatterns = [
    path('product/', ProductCode.as_view(), name='post_list'),
    path('create/', CustomUserCreate.as_view(), name="create_user"),
    path('token/obtain/', ObtainToken.as_view(), name='token-obtain'),
    path('token/refresh/', jwt_views.TokenRefreshView.as_view(), name='token-refresh'),
    path('hello/', Message.as_view(), name='hello_world'),
    path('blacklist/', BlacklistToken.as_view(), name='blacklist'),
    path('product-text/', ProductTextCode.as_view(), name='post_list_text')
]