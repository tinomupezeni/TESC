#!/bin/bash

# ============================================
# TESC Encryption Key Rotation Script
# Generates a new key and updates .env
# ============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_DIR/.env"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  TESC Encryption Key Rotation${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if .env exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}ERROR: .env file not found at $ENV_FILE${NC}"
    exit 1
fi

# Generate new key
echo -e "${YELLOW}Generating new Fernet encryption key...${NC}"
NEW_KEY=$(python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())" 2>/dev/null || \
          docker run --rm python:3.11-slim python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())")

echo ""
echo -e "${GREEN}New key generated:${NC}"
echo "$NEW_KEY"
echo ""

# Get current key(s)
source "$ENV_FILE"
CURRENT_KEYS="${CRYPTOGRAPHY_KEYS:-$CRYPTOGRAPHY_KEY}"

if [ -z "$CURRENT_KEYS" ]; then
    echo -e "${YELLOW}No existing key found. This will be your first key.${NC}"
    NEW_KEYS="$NEW_KEY"
else
    echo -e "${YELLOW}Existing key(s) found. Adding new key as primary.${NC}"
    NEW_KEYS="$NEW_KEY,$CURRENT_KEYS"
fi

echo ""
echo -e "${BLUE}New CRYPTOGRAPHY_KEYS value:${NC}"
echo "$NEW_KEYS"
echo ""

# Confirm update
read -p "Update .env file with new key configuration? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${YELLOW}Aborted. To manually update, add this to your .env:${NC}"
    echo "CRYPTOGRAPHY_KEYS=$NEW_KEYS"
    exit 0
fi

# Backup .env
cp "$ENV_FILE" "$ENV_FILE.backup.$(date +%Y%m%d_%H%M%S)"
echo -e "${GREEN}✓ Backed up .env file${NC}"

# Update .env file
if grep -q "^CRYPTOGRAPHY_KEYS=" "$ENV_FILE"; then
    # Replace existing CRYPTOGRAPHY_KEYS
    sed -i "s|^CRYPTOGRAPHY_KEYS=.*|CRYPTOGRAPHY_KEYS=$NEW_KEYS|" "$ENV_FILE"
elif grep -q "^CRYPTOGRAPHY_KEY=" "$ENV_FILE"; then
    # Replace old single key format with new format
    sed -i "s|^CRYPTOGRAPHY_KEY=.*|CRYPTOGRAPHY_KEYS=$NEW_KEYS|" "$ENV_FILE"
else
    # Add new line
    echo "CRYPTOGRAPHY_KEYS=$NEW_KEYS" >> "$ENV_FILE"
fi

echo -e "${GREEN}✓ Updated .env file${NC}"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Key Rotation Step 1 Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo ""
echo "1. Restart the application to use new keys:"
echo "   docker compose -f docker-compose.prod.yml restart backend"
echo ""
echo "2. Re-encrypt all data with the new key:"
echo "   ./scripts/reencrypt.sh"
echo ""
echo "3. After verifying everything works, you can remove old keys"
echo "   by editing .env and keeping only the new key"
echo ""
echo -e "${BLUE}Quick command to do steps 1 & 2:${NC}"
echo "   docker compose -f docker-compose.prod.yml restart backend && ./scripts/reencrypt.sh --auto"
echo ""
