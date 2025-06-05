from django.urls import path
from . import views

urlpatterns = [
    path('api/upload-csv/', views.upload_csv, name='upload_csv'),
]
