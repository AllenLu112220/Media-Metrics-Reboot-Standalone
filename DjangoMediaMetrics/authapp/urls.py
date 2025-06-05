from django.urls import path
from .views import LoginView, CsrfTokenView, reset_password_request, set_new_password, register_user


urlpatterns = [
    path('api/login/', LoginView.as_view(), name='login'),
    path('api/csrf-token/', CsrfTokenView.as_view(), name='csrf-token'),
    path('reset-password/', reset_password_request, name='reset_password_request'),
    path('api/set-new-password/', set_new_password, name='set_new_password'),
    path('api/create-account/', register_user, name='register_user'),
]