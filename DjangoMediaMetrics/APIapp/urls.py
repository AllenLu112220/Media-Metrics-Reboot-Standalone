from django.urls import path
from .views import get_news, fetch_CurrentsAPI_news
from . import views

urlpatterns = [
    path('api/get_news/', views.get_news, name='get_news'),
    path('api/fetch_CurrentsAPI_news/', views.fetch_CurrentsAPI_news, name='get_current_news'),
]