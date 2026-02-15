#!/bin/bash

# ============================================
# TESC Deployment Script
# Handles migrations, re-encryption, and startup
# ============================================

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$PROJECT_DIR/backend"
COMPOSE_FILE="$PROJECT_DIR/docker-compose.prod.yml"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  TESC Deployment Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# ============================================
# Pre-flight Checks
# ============================================
echo -e "${YELLOW}[1/6] Running pre-flight checks...${NC}"

# Check if .env exists
if [ ! -f "$PROJECT_DIR/.env" ]; then
    echo -e "${RED}ERROR: .env file not found at $PROJECT_DIR/.env${NC}"
    echo "Please create .env file with required variables."
    exit 1
fi

# Check if CRYPTOGRAPHY_KEYS is set
source "$PROJECT_DIR/.env"
if [ -z "$CRYPTOGRAPHY_KEYS" ] && [ -z "$CRYPTOGRAPHY_KEY" ]; then
    echo -e "${RED}ERROR: No encryption key configured!${NC}"
    echo "Please set CRYPTOGRAPHY_KEYS in .env file."
    echo ""
    echo "Generate a key with:"
    echo "  python -c \"from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())\""
    exit 1
fi

echo -e "${GREEN}✓ Pre-flight checks passed${NC}"

# ============================================
# Pull Latest Images
# ============================================
echo ""
echo -e "${YELLOW}[2/6] Pulling latest Docker images...${NC}"

cd "$PROJECT_DIR"

# Login to GHCR if token available
if [ -n "$GITHUB_TOKEN" ]; then
    echo "$GITHUB_TOKEN" | docker login ghcr.io -u "$GITHUB_ACTOR" --password-stdin
fi

docker compose -f "$COMPOSE_FILE" pull

echo -e "${GREEN}✓ Images pulled${NC}"

# ============================================
# Start Database (if not running)
# ============================================
echo ""
echo -e "${YELLOW}[3/6] Ensuring database is running...${NC}"

docker compose -f "$COMPOSE_FILE" up -d db
echo "Waiting for database to be ready..."
sleep 5

# Wait for PostgreSQL to be ready
for i in {1..30}; do
    if docker compose -f "$COMPOSE_FILE" exec -T db pg_isready -U "$DB_USER" -d "$DB_NAME" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Database is ready${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}ERROR: Database did not become ready in time${NC}"
        exit 1
    fi
    echo "  Waiting for database... ($i/30)"
    sleep 2
done

# ============================================
# Run Migrations
# ============================================
echo ""
echo -e "${YELLOW}[4/6] Running database migrations...${NC}"

docker compose -f "$COMPOSE_FILE" run --rm backend python manage.py migrate --noinput

echo -e "${GREEN}✓ Migrations complete${NC}"

# ============================================
# Re-encrypt Data (Key Rotation)
# ============================================
echo ""
echo -e "${YELLOW}[5/6] Checking encryption and re-encrypting data...${NC}"

# First do a dry run to see what needs to be done
echo "Running dry-run to check encryption status..."
docker compose -f "$COMPOSE_FILE" run --rm backend python manage.py reencrypt_data --dry-run

echo ""
read -p "Do you want to proceed with re-encryption? (y/N) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Re-encrypting data..."
    docker compose -f "$COMPOSE_FILE" run --rm backend python manage.py reencrypt_data
    echo -e "${GREEN}✓ Re-encryption complete${NC}"
else
    echo -e "${YELLOW}⚠ Skipped re-encryption${NC}"
fi

# ============================================
# Start All Services
# ============================================
echo ""
echo -e "${YELLOW}[6/6] Starting all services...${NC}"

docker compose -f "$COMPOSE_FILE" up -d

echo ""
echo "Waiting for services to start..."
sleep 10

# ============================================
# Health Check
# ============================================
echo ""
echo -e "${YELLOW}Running health checks...${NC}"

# Check if containers are running
RUNNING=$(docker compose -f "$COMPOSE_FILE" ps --status running -q | wc -l)
EXPECTED=5  # nginx, db, backend, frontend_client, frontend_admin

if [ "$RUNNING" -ge "$EXPECTED" ]; then
    echo -e "${GREEN}✓ All $RUNNING containers are running${NC}"
else
    echo -e "${YELLOW}⚠ Only $RUNNING/$EXPECTED containers running${NC}"
    docker compose -f "$COMPOSE_FILE" ps
fi

# Try backend health check
if curl -sf http://localhost:8000/api/ > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend API is responding${NC}"
else
    echo -e "${YELLOW}⚠ Backend API not responding (may still be starting)${NC}"
fi

# ============================================
# Done!
# ============================================
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Services:"
docker compose -f "$COMPOSE_FILE" ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo -e "${BLUE}Useful commands:${NC}"
echo "  View logs:     docker compose -f $COMPOSE_FILE logs -f"
echo "  Restart:       docker compose -f $COMPOSE_FILE restart"
echo "  Stop:          docker compose -f $COMPOSE_FILE down"
echo ""
