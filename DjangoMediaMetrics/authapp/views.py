from django.views import View
from django.http import JsonResponse
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.middleware.csrf import get_token
from django.contrib.auth import login
import json 
import logging

#Handles the login functionality ensuring the correct credentials are entered.
class LoginView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            username = data.get('username') 
            password = data.get('password') 
            user = authenticate(request, AccountEmail=username, password=password)

            if user is not None:
                login(request, user)#Session created for the logged in user allowing access to database.
                csrf_token = get_token(request)
                return JsonResponse({
                    'message': 'Login successful!',
                    'csrfToken': csrf_token,
                    'user': {
                        'userID': user.UserID,
                        'AccountEmail': user.AccountEmail,
                    }
                }, status=200)
            else:
                return JsonResponse({'message': 'Invalid credentials'}, status=400)

        except json.JSONDecodeError:
            return JsonResponse({'message': 'Invalid JSON'}, status=400)
        

class CsrfTokenView(View):
    def get(self, request):
        return JsonResponse({'csrfToken': get_token(request)})
    

User = get_user_model()
@api_view(['POST'])
def reset_password_request(request):
    email = request.data.get('email')
    if not email:
        return Response({'message': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(AccountEmail=email)
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        #reset_link = f"http://52.6.97.91:3000/set-new-password/?uid={uid}&token={token}"
        reset_link = f"http://localhost:3000/set-new-password/?uid={uid}&token={token}"
        send_mail(
            'Password Reset Request',
            f'Click on the link to reset your password: {reset_link}',
            'dash.hound@blue-marble.com',
            [email],
            fail_silently=False,
        )  
        return Response({'message' : 'Password reset link sent.'}) 
    except User.DoesNotExist:
        return Response({'message': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
    

@api_view(['POST'])
def set_new_password(request):
    uid = request.data.get('uid')
    token = request.data.get('token')
    new_password = request.data.get('password')

    try:
        user_id = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_id)
        if default_token_generator.check_token(user, token):
            user.set_password(new_password)
            user.save()
            return Response({'message': 'Password has been reset.'})
        else:
            return Response({'message': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response({'message': 'Invalid request.'}, status=status.HTTP_400_BAD_REQUEST)
    

User = get_user_model()
@api_view(['POST'])
def register_user(request):
    try:
        data = request.data
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return Response({'message': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(AccountEmail=email).exists():
            return Response({'message': 'Email already registered'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(email=email, password=password)
        csrf_token = get_token(request)  # Generate CSRF token
        return Response({
            'message': 'User created successfully',
            'csrfToken': csrf_token,  # Return the CSRF token
            'user': {
                'userID': user.UserID,
                'AccountEmail': user.AccountEmail,
            }
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({'message': f'Error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)