#!/bin/bash

# ============================================
# TESC Data Re-encryption Script
# Run this after changing encryption keys
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
COMPOSE_FILE="$PROJECT_DIR/docker-compose.prod.yml"

# Check for --auto flag (skip prompts)
AUTO_MODE=false
DRY_RUN=false

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --auto) AUTO_MODE=true ;;
        --dry-run) DRY_RUN=true ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --auto      Run without prompts (for CI/CD)"
            echo "  --dry-run   Show what would be changed without making changes"
            echo "  -h, --help  Show this help message"
            exit 0
            ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  TESC Data Re-encryption${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Load environment
if [ -f "$PROJECT_DIR/.env" ]; then
    source "$PROJECT_DIR/.env"
fi

# Show key info
echo -e "${YELLOW}Checking encryption configuration...${NC}"

# Count keys
KEY_VAR="${CRYPTOGRAPHY_KEYS:-$CRYPTOGRAPHY_KEY}"
if [ -z "$KEY_VAR" ]; then
    echo -e "${RED}ERROR: No encryption keys configured in .env${NC}"
    exit 1
fi

KEY_COUNT=$(echo "$KEY_VAR" | tr ',' '\n' | wc -l)
echo -e "Keys configured: ${GREEN}$KEY_COUNT${NC}"

if [ "$KEY_COUNT" -gt 1 ]; then
    echo -e "${YELLOW}Multiple keys detected - key rotation mode${NC}"
fi

echo ""

# Dry run first
echo -e "${YELLOW}[1/2] Running analysis (dry-run)...${NC}"
echo ""

docker compose -f "$COMPOSE_FILE" run --rm backend python manage.py reencrypt_data --dry-run

echo ""

if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}Dry run complete. No changes made.${NC}"
    exit 0
fi

# Confirm before proceeding
if [ "$AUTO_MODE" = false ]; then
    echo -e "${YELLOW}[2/2] Ready to re-encrypt data${NC}"
    echo ""
    echo -e "${RED}WARNING: This will modify encrypted data in the database.${NC}"
    echo "Make sure you have a backup before proceeding."
    echo ""
    read -p "Proceed with re-encryption? (y/N) " -n 1 -r
    echo ""

    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Aborted.${NC}"
        exit 0
    fi
fi

# Run re-encryption
echo ""
echo -e "${YELLOW}Re-encrypting data...${NC}"
echo ""

docker compose -f "$COMPOSE_FILE" run --rm backend python manage.py reencrypt_data

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Re-encryption Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

if [ "$KEY_COUNT" -gt 1 ]; then
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Verify the application works correctly"
    echo "2. Once confirmed, you can remove old keys from CRYPTOGRAPHY_KEYS"
    echo "   (Keep only the first/newest key)"
    echo ""
fi
