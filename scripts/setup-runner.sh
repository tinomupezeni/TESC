#!/bin/bash

# ============================================
# TESC - GitHub Actions Self-Hosted Runner Setup
# Run this script on your ZCHPC VM
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  TESC CI/CD Runner Setup Script${NC}"
echo -e "${GREEN}========================================${NC}"

# Check if running as root
if [ "$EUID" -eq 0 ]; then
  echo -e "${RED}Please do NOT run as root. Run as a regular user with sudo privileges.${NC}"
  exit 1
fi

# Variables - UPDATE THESE
GITHUB_REPO="tinomupezeni/TESC"
RUNNER_NAME="zchpc-runner"
RUNNER_DIR="$HOME/actions-runner"

echo ""
echo -e "${YELLOW}Before continuing, you need a GitHub Runner Token.${NC}"
echo -e "${YELLOW}Get it from: https://github.com/${GITHUB_REPO}/settings/actions/runners/new${NC}"
echo ""
read -p "Enter your GitHub Runner Token: " RUNNER_TOKEN

if [ -z "$RUNNER_TOKEN" ]; then
  echo -e "${RED}Token cannot be empty!${NC}"
  exit 1
fi

# ============================================
# Step 1: Install Dependencies
# ============================================
echo ""
echo -e "${GREEN}[1/5] Installing dependencies...${NC}"

sudo apt-get update
sudo apt-get install -y \
  curl \
  jq \
  git \
  docker.io \
  docker-compose

# Add current user to docker group
sudo usermod -aG docker $USER

echo -e "${GREEN}Docker installed successfully!${NC}"

# ============================================
# Step 2: Download GitHub Actions Runner
# ============================================
echo ""
echo -e "${GREEN}[2/5] Downloading GitHub Actions Runner...${NC}"

mkdir -p "$RUNNER_DIR"
cd "$RUNNER_DIR"

# Get latest runner version
RUNNER_VERSION=$(curl -s https://api.github.com/repos/actions/runner/releases/latest | jq -r '.tag_name' | sed 's/v//')
RUNNER_ARCH="linux-x64"

echo "Downloading runner version ${RUNNER_VERSION}..."
curl -o actions-runner.tar.gz -L "https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-${RUNNER_ARCH}-${RUNNER_VERSION}.tar.gz"

tar xzf actions-runner.tar.gz
rm actions-runner.tar.gz

# ============================================
# Step 3: Configure the Runner
# ============================================
echo ""
echo -e "${GREEN}[3/5] Configuring runner...${NC}"

./config.sh --url "https://github.com/${GITHUB_REPO}" \
  --token "$RUNNER_TOKEN" \
  --name "$RUNNER_NAME" \
  --labels "self-hosted,linux,x64,zchpc" \
  --unattended \
  --replace

# ============================================
# Step 4: Install as Systemd Service
# ============================================
echo ""
echo -e "${GREEN}[4/5] Installing as systemd service...${NC}"

sudo ./svc.sh install
sudo ./svc.sh start

# ============================================
# Step 5: Verify Installation
# ============================================
echo ""
echo -e "${GREEN}[5/5] Verifying installation...${NC}"

sudo ./svc.sh status

# ============================================
# Done!
# ============================================
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Runner installed at: ${RUNNER_DIR}"
echo -e "Runner name: ${RUNNER_NAME}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Clone your repo: git clone https://github.com/${GITHUB_REPO}.git"
echo "2. Create .env file with your database credentials"
echo "3. Push to main branch to trigger deployment!"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo "  Check status:  sudo ${RUNNER_DIR}/svc.sh status"
echo "  Stop runner:   sudo ${RUNNER_DIR}/svc.sh stop"
echo "  Start runner:  sudo ${RUNNER_DIR}/svc.sh start"
echo "  View logs:     journalctl -u actions.runner.${GITHUB_REPO/\//-}.${RUNNER_NAME}.service -f"
echo ""
echo -e "${GREEN}NOTE: You may need to log out and back in for docker group to take effect.${NC}"
