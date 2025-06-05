from django.core.management.base import BaseCommand
from authapp.models import CustomUser

class Command(BaseCommand):
    help = 'Create a new user'

    def add_arguments(self, parser):
        parser.add_argument('email', type=str)
        parser.add_argument('password', type=str)

    def handle(self, *args, **kwargs):
        email = kwargs['email']
        password = kwargs['password']
        user = CustomUser(AccountEmail=email)
        user.set_password(password) 
        user.save()
        self.stdout.write(self.style.SUCCESS(f'Successfully created user {email}'))
