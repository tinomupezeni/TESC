#!/bin/bash
# automated_backup.sh
BACKUP_DIR="$(dirname "$0")/../../backups"
mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="tesc_db_backup_$TIMESTAMP.sql.enc"
ENCRYPTION_KEY=${BACKUP_ENCRYPTION_KEY:-"DefaultFallbackSecretKey!123"}

echo "Starting automated database backup..."

# Dump the database from the db container and pipe it directly to OpenSSL for encryption
docker compose -f "$(dirname "$0")/../../docker-compose.yml" exec -T db pg_dump -U tesc_user tesc_db | \
openssl enc -aes-256-cbc -salt -pbkdf2 -k "$ENCRYPTION_KEY" > "$BACKUP_DIR/$FILENAME"

if [ $? -eq 0 ]; then
    echo "✅ Backup completed and encrypted: $(realpath $BACKUP_DIR/$FILENAME)"
else
    echo "❌ Backup failed!"
    exit 1
fi
