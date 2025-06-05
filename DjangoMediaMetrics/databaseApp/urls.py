from django.urls import path
from .views import save_search_query, csrf_token_view, upload_csv, get_search_history
from . import views

urlpatterns = [
    path('api/save-search/', save_search_query, name='save_search_query'),  # Add the URL pattern
    path('api/csrf-token/', csrf_token_view, name='csrf_token'),
    path('api/save-articles/', views.save_articles, name='save_articles'),
    path('api/search-news/', views.search_news, name='search_news'),
    path('api/upload-csv', upload_csv, name='upload_csv'),
    path('api/search-history/', get_search_history, name='get_search_history')
]