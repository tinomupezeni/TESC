# TESC CI/CD Deployment Guide

This guide explains how to set up automatic deployment for TESC using GitHub Actions with a self-hosted runner on your ZCHPC VM.

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────────────┐     ┌─────────────────┐
│   Developer     │     │   GitHub Actions        │     │   ZCHPC VM      │
│                 │     │                         │     │   (No public IP)│
│  git push ──────┼────►│  1. Build Docker images │     │                 │
│                 │     │  2. Push to GHCR        │     │                 │
│                 │     │  3. Trigger deploy job  │     │                 │
│                 │     │          │              │     │                 │
│                 │     │          ▼              │     │                 │
│                 │     │   ┌─────────────────┐   │     │  ┌───────────┐  │
│                 │     │   │ Deploy Job      │◄──┼─────┼──│ Runner    │  │
│                 │     │   │ (self-hosted)   │   │     │  │ (pulls)   │  │
│                 │     │   └─────────────────┘   │     │  └───────────┘  │
│                 │     │                         │     │       │         │
└─────────────────┘     └─────────────────────────┘     │       ▼         │
                                                        │  ┌───────────┐  │
                                                        │  │ Docker    │  │
                                                        │  │ Compose   │  │
                                                        │  └───────────┘  │
                                                        └─────────────────┘
```

**Key Point**: The runner on your VM initiates an *outbound* connection to GitHub. No inbound access (SSH/ports) is needed!

## Prerequisites

- GitHub account with access to the repository
- VM with Ubuntu/Debian and Docker installed
- Outbound internet access from VM

## Setup Instructions

### Step 1: Prepare the VM

SSH into your ZCHPC VM and run:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker (if not installed)
sudo apt install -y docker.io docker-compose
sudo usermod -aG docker $USER

# Log out and back in for docker group to take effect
```

### Step 2: Get GitHub Runner Token

1. Go to your repository: https://github.com/tinomupezeni/TESC
2. Click **Settings** → **Actions** → **Runners**
3. Click **New self-hosted runner**
4. Select **Linux** and **x64**
5. Copy the **token** shown (starts with `A...`)

⚠️ **Token expires quickly!** Use it within 1 hour.

### Step 3: Install the Runner

**Option A: Use the setup script**
```bash
# Clone the repo first
git clone https://github.com/tinomupezeni/TESC.git
cd TESC

# Make script executable and run
chmod +x scripts/setup-runner.sh
./scripts/setup-runner.sh
```

**Option B: Manual installation**
```bash
# Create runner directory
mkdir -p ~/actions-runner && cd ~/actions-runner

# Download runner (check latest version)
curl -o actions-runner.tar.gz -L https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz
tar xzf actions-runner.tar.gz

# Configure
./config.sh --url https://github.com/tinomupezeni/TESC --token YOUR_TOKEN

# Install and start as service
sudo ./svc.sh install
sudo ./svc.sh start
```

### Step 4: Verify Runner is Connected

1. Go to GitHub → Settings → Actions → Runners
2. You should see your runner listed as **Idle** (green dot)

### Step 5: Create Environment File on VM

```bash
cd ~/TESC  # or wherever you cloned the repo

cat > .env << 'EOF'
# Database
DB_NAME=tesc_db
DB_USER=tesc_user
DB_PASSWORD=your_secure_password_here
DB_HOST=db
DB_PORT=5432

# Django
SECRET_KEY=your-super-secret-key-here
DEBUG=False
ALLOWED_HOSTS=tesc.zchpc.ac.zw,tesc-inst.zchpc.ac.zw,localhost

# Encryption
ENCRYPTION_KEY=your-fernet-key-here
EOF

chmod 600 .env
```

### Step 6: Push Code to Deploy!

From your development machine:
```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

Watch the deployment:
1. Go to GitHub → Actions tab
2. See the workflow run in real-time
3. Check your VM: `docker ps` to see running containers

## Workflow Details

The CI/CD pipeline (`.github/workflows/deploy.yml`) does:

| Job | Runs On | Steps |
|-----|---------|-------|
| **build** | GitHub Ubuntu | Build 3 Docker images, push to GHCR |
| **deploy** | Your VM | Pull images, run docker-compose |

## Useful Commands

### On the VM

```bash
# Check runner status
sudo ~/actions-runner/svc.sh status

# View runner logs
journalctl -u actions.runner.tinomupezeni-TESC.zchpc-runner.service -f

# Check running containers
docker ps

# View container logs
docker compose -f docker-compose.prod.yml logs -f

# Restart services
docker compose -f docker-compose.prod.yml restart

# Manual deploy (without push)
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

### Troubleshooting

**Runner not connecting?**
```bash
# Check service status
sudo systemctl status actions.runner.*

# Restart runner
sudo ~/actions-runner/svc.sh stop
sudo ~/actions-runner/svc.sh start
```

**Docker permission denied?**
```bash
sudo usermod -aG docker $USER
# Then log out and back in
```

**Images not pulling?**
```bash
# Login to GHCR
echo $GITHUB_TOKEN | docker login ghcr.io -u YOUR_USERNAME --password-stdin
```

## File Structure

```
TESC/
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD pipeline
├── scripts/
│   └── setup-runner.sh         # VM setup script
├── docker-compose.yml          # Development
├── docker-compose.prod.yml     # Production (uses GHCR images)
├── backend/
│   └── Dockerfile
├── frontend/
│   └── Dockerfile
├── inst/
│   └── Dockerfile
└── DEPLOYMENT.md               # This file
```

## Security Notes

1. **Never commit `.env`** - It's in `.gitignore`
2. **Runner token** - Expires quickly, one-time use
3. **GHCR authentication** - Uses `GITHUB_TOKEN` (automatic in Actions)
4. **Database credentials** - Store securely on VM only

## Rollback

To rollback to a previous version:

```bash
# List available image tags
docker images ghcr.io/tinomupezeni/tesc-backend

# Pull specific version (use the SHA tag)
docker pull ghcr.io/tinomupezeni/tesc-backend:abc1234

# Update compose file or run directly
docker compose -f docker-compose.prod.yml up -d
```

## Support

For issues with the CI/CD pipeline, check:
1. GitHub Actions logs (Actions tab)
2. Runner logs on VM (`journalctl`)
3. Docker logs (`docker compose logs`)
