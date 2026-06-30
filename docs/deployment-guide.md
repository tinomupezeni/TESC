# Deployment & Production Guide

This document outlines the production architecture for the TESC (ScalarEye) platform.

## Production Environment
- **Host / IP:** `10.50.200.35`
- **Access:** Password-less SSH is configured for the `user` account (`ssh user@10.50.200.35`).
- **Orchestration:** Docker Compose

## Docker Architecture

The production environment runs fully containerized with four main services:

1. **`tesc-main-db-1` (Postgres 15)**
   - The core database. Data is persisted via Docker volumes (`postgres_data`).
   - Runs natively, strictly isolated from external port bindings (internal Docker network only).

2. **`tesc-main-backend-1` (Django Gunicorn)**
   - Serves the API on port `8000`.
   - Bootstrapped via `gunicorn core.wsgi:application`.

3. **`tesc-main-frontend_client-1` (Vite/React)**
   - The main student/analytical frontend exposed on port `8080`.

4. **`tesc-main-frontend_admin-1` (Vite/React)**
   - The institution administration frontend exposed on port `8081`.

## Security & Maintenance Policies

1. **No Untracked Secrets:** 
   `.env` files must **never** be committed to version control. They are provisioned directly on the production host.
   
2. **No DB Dumps in Source Control:**
   Database backups (e.g., `.sql` or `.sql.enc`) must be stored in secure external storage (like AWS S3) and absolutely never committed to Git. The Git history has been scrubbed to enforce this.

3. **Database Consistency:**
   Local development must use Postgres (via Docker Compose) to ensure parity with this production environment.

## Restarting Services
To apply updates on the server:
```bash
# Example update flow on 10.50.200.35
git pull origin main
docker-compose -f docker-compose.prod.yml up -d --build
```
*(Note: A `docker_hard_restart.sh` script is also available in the user's home directory on the server).*
