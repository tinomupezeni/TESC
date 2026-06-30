from django.core.management.base import BaseCommand, CommandError
from users.models import CustomUser

class Command(BaseCommand):
    help = 'Resets the password for a specific user (defaults to admin@scalareye.com)'

    def add_arguments(self, parser):
        # We allow overriding the email and password via command line arguments
        parser.add_argument(
            '--email',
            type=str,
            default='admin@scalareye.com',
            help='Email of the user to reset'
        )
        parser.add_argument(
            '--password',
            type=str,
            default='Admin@123',
            help='New password to set'
        )

    def handle(self, *args, **options):
        email = options['email']
        password = options['password']

        try:
            user = CustomUser.objects.get(email=email)
            user.set_password(password)
            user.must_change_password = True
            user.save()
            
            # Using self.stdout.write with style.SUCCESS instead of print()
            self.stdout.write(
                self.style.SUCCESS(f"✅ Password for {email} has been reset to: {password}")
            )
            self.stdout.write(
                self.style.SUCCESS(f"✅ 'must_change_password' flag set to True for {email}")
            )
        except CustomUser.DoesNotExist:
            # Using CommandError properly handles the error and exits with code 1
            raise CommandError(f"❌ User with email '{email}' not found.")
