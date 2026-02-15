"""
Management command to re-encrypt all data with the current primary encryption key.

Usage:
    python manage.py reencrypt_data
    python manage.py reencrypt_data --dry-run
    python manage.py reencrypt_data --model Student
    python manage.py reencrypt_data --model Staff
"""

from django.core.management.base import BaseCommand
from django.db import transaction
from core.utils.crypto import get_multi_fernet, rotate_token, get_fernet_keys
from core.fields import is_fernet_token
from cryptography.fernet import InvalidToken
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Re-encrypt all encrypted fields with the current primary key (key rotation)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be re-encrypted without making changes',
        )
        parser.add_argument(
            '--model',
            type=str,
            help='Only re-encrypt a specific model (Student, Staff)',
        )
        parser.add_argument(
            '--batch-size',
            type=int,
            default=100,
            help='Number of records to process at a time (default: 100)',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        target_model = options.get('model')
        batch_size = options['batch_size']

        # Show current key configuration
        keys = get_fernet_keys()
        self.stdout.write(f"\nEncryption keys configured: {len(keys)}")
        self.stdout.write(f"Primary key (for encryption): ...{keys[0][-8:]}")
        for i, key in enumerate(keys[1:], 2):
            self.stdout.write(f"Key {i} (for decryption): ...{key[-8:]}")

        if dry_run:
            self.stdout.write(self.style.WARNING('\n--- DRY RUN MODE - No changes will be made ---\n'))

        # Models with encrypted fields
        encrypted_models = self._get_encrypted_models()

        if target_model:
            # Filter to specific model
            target_model_lower = target_model.lower()
            encrypted_models = {
                name: config for name, config in encrypted_models.items()
                if name.lower() == target_model_lower
            }
            if not encrypted_models:
                self.stdout.write(self.style.ERROR(f"Model '{target_model}' not found or has no encrypted fields."))
                return

        total_updated = 0
        total_failed = 0

        for model_name, config in encrypted_models.items():
            self.stdout.write(f"\n{'='*50}")
            self.stdout.write(f"Processing: {model_name}")
            self.stdout.write(f"Encrypted fields: {', '.join(config['fields'])}")
            self.stdout.write(f"{'='*50}")

            model_class = config['model']
            fields = config['fields']

            updated, failed = self._process_model(
                model_class, fields, dry_run, batch_size
            )
            total_updated += updated
            total_failed += failed

        # Summary
        self.stdout.write(f"\n{'='*50}")
        self.stdout.write(self.style.SUCCESS(f"SUMMARY"))
        self.stdout.write(f"{'='*50}")
        self.stdout.write(f"Total records updated: {total_updated}")
        if total_failed:
            self.stdout.write(self.style.ERROR(f"Total records failed: {total_failed}"))
        if dry_run:
            self.stdout.write(self.style.WARNING('\nThis was a dry run. Run without --dry-run to apply changes.'))

    def _get_encrypted_models(self):
        """Return dict of models with their encrypted fields."""
        from academic.models import Student
        from staff.models import Staff

        return {
            'Student': {
                'model': Student,
                'fields': ['national_id', 'first_name', 'last_name', 'date_of_birth']
            },
            'Staff': {
                'model': Staff,
                'fields': ['first_name', 'last_name', 'email', 'phone', 'specialization', 'date_joined']
            },
        }

    def _process_model(self, model_class, fields, dry_run, batch_size):
        """Process a single model, re-encrypting all specified fields."""
        updated_count = 0
        failed_count = 0

        total = model_class.objects.count()
        self.stdout.write(f"Total records: {total}")

        # Process in batches
        processed = 0
        while processed < total:
            # Get batch of records (using raw values to avoid auto-decryption)
            records = list(model_class.objects.all()[processed:processed + batch_size])

            for record in records:
                try:
                    needs_update = False

                    for field_name in fields:
                        # Get the raw database value
                        raw_value = getattr(record, field_name)

                        if raw_value and is_fernet_token(str(raw_value)):
                            try:
                                # Try to rotate (decrypt with any key, encrypt with primary)
                                new_value = rotate_token(str(raw_value))

                                if new_value != raw_value:
                                    if not dry_run:
                                        setattr(record, field_name, new_value)
                                    needs_update = True
                            except InvalidToken:
                                self.stdout.write(
                                    self.style.WARNING(
                                        f"  Cannot decrypt {model_class.__name__} ID={record.pk} field={field_name}"
                                    )
                                )
                                failed_count += 1

                    if needs_update and not dry_run:
                        # Save without triggering re-encryption (direct update)
                        model_class.objects.filter(pk=record.pk).update(
                            **{f: getattr(record, f) for f in fields if getattr(record, f)}
                        )
                        updated_count += 1
                    elif needs_update:
                        updated_count += 1  # Count for dry run

                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(f"  Error processing {model_class.__name__} ID={record.pk}: {e}")
                    )
                    failed_count += 1

            processed += batch_size
            self.stdout.write(f"  Processed {min(processed, total)}/{total} records...")

        self.stdout.write(f"  Updated: {updated_count}, Failed: {failed_count}")
        return updated_count, failed_count
