from django.conf import settings
from django.db import migrations
from django.contrib.auth.hashers import make_password


def create_default_user(apps, schema_editor):
    # Use the swappable user model configured in settings.AUTH_USER_MODEL
    app_label, model_name = settings.AUTH_USER_MODEL.split(".")
    User = apps.get_model(app_label, model_name)
    username = "mutarepoly"
    password = "tesc1234"
    user, created = User.objects.get_or_create(
        username=username, defaults={"email": "mutarepoly@example.com"}
    )
    # Historical models used in migrations may not expose convenience methods
    # like set_password; hash the password directly to be safe.
    user.password = make_password(password)
    user.is_active = True
    user.save()


def remove_default_user(apps, schema_editor):
    app_label, model_name = settings.AUTH_USER_MODEL.split(".")
    User = apps.get_model(app_label, model_name)
    User.objects.filter(username="mutarepoly").delete()


class Migration(migrations.Migration):
    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RunPython(create_default_user, remove_default_user),
    ]
