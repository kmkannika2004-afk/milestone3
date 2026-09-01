from django.core.management.base import BaseCommand
from django.conf import settings


class Command(BaseCommand):
    help = 'Create a default superuser admin account if one does not already exist'

    def handle(self, *args, **kwargs):
        from apps.users.models import User

        phone    = settings.ADMIN_PHONE
        password = settings.ADMIN_PASSWORD
        name     = settings.ADMIN_NAME

        if User.objects.filter(phone_number=phone).exists():
            user = User.objects.get(phone_number=phone)
            # Make sure existing account has full admin rights
            updated = False
            if not user.is_staff:
                user.is_staff = True
                updated = True
            if not user.is_superuser:
                user.is_superuser = True
                updated = True
            if user.role != User.Role.ADMIN:
                user.role = User.Role.ADMIN
                updated = True
            if updated:
                user.set_password(password)
                user.save()
                self.stdout.write(self.style.WARNING(
                    f'Admin account updated: {phone}'
                ))
            else:
                self.stdout.write(self.style.SUCCESS(
                    f'Admin account already exists: {phone}'
                ))
        else:
            User.objects.create_superuser(
                phone_number=phone,
                password=password,
                full_name=name,
                role=User.Role.ADMIN,
            )
            self.stdout.write(self.style.SUCCESS(
                f'Admin account created successfully!\n'
                f'  Phone:    {phone}\n'
                f'  Password: {password}\n'
                f'  URL:      http://localhost:8000/admin/'
            ))
