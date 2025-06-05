from django.urls import path
from .views import fetch_serp_api

urlpatterns = [
    path('api/serp', fetch_serp_api, name='fetch_serp_api'),
]
