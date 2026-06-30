# TESC Production Architecture & Engineering Guide

## 1. High-Level Architecture Overview
The TESC production environment is hosted on a Linux VM (`10.50.200.35`) using Docker Compose. The system is designed following Principal Engineering best practices for security, performance, and disaster recovery.

### 1.1 The Gateway: Nginx Reverse Proxy
Traffic reaches the VM through a central Nginx reverse proxy.
*   **Security:** The Gunicorn backend and Vite frontends **do not** expose ports to the host VM. They are shielded within the private `main_net` Docker network. 
*   **Routing:** Nginx listens on Port 80 and routes traffic based on the requested domain (`tesc.zchpc.ac.zw` vs `tesc-inst.zchpc.ac.zw`) and path (routing `/api/` to the backend seamlessly).
*   **Performance:** Nginx is configured to apply aggressive `gzip` compression to all JavaScript, CSS, and API responses, reducing payload sizes by ~70% before they traverse the network.

*(Note: SSL/TLS termination is handled further upstream by an external cPanel proxy, which forwards all traffic natively to Port 80 on the VM).*

### 1.2 The Caching Layer: Redis
*   A `redis:alpine` container sits inside the network, operating as the primary in-memory cache for Django.
*   It significantly reduces the load on PostgreSQL by caching heavy queries, session data, and frequent API responses.

### 1.3 The Database: PostgreSQL 15
*   The system uses a containerized PostgreSQL 15 database. 
*   **Persistent Storage:** Data is stored in a permanent Docker volume (`postgres_data`) to ensure it survives container rebuilds and server restarts.

---

## 2. Disaster Recovery & Backups
Data safety is guaranteed by a completely automated, off-system process:
*   **The Script:** `/home/user/backup_db.sh` executes daily. It runs a `pg_dump` natively inside the Docker container and compresses the output via `gzip`.
*   **The Cron Job:** Scheduled in the VM's `crontab`, the backup runs silently every day at 2:00 AM.
*   **Disk Management:** The script automatically purges backup files older than 7 days to prevent server disk exhaustion.
*   **Location:** Backups are stored safely at `/home/user/backups/`. 

---

## 3. Automated CI/CD Deployment Pipeline
TESC utilizes a custom Bash-driven pipeline that automates staging, testing, and production deployment with zero manual intervention.

### 3.1 The Pipeline Script (`/home/user/deploy_pipeline.sh`)
When executed on the VM, the script runs the following sequence:
1. **Pull Staging:** Fetches the latest code from the GitHub `staging` branch.
2. **Build Staging:** Spins up an isolated, hyper-optimized staging environment (`docker-compose.staging.yml`) containing only Postgres, Redis, and the Backend. It explicitly skips building the heavy React frontends to save compute time.
3. **Run Test Suite:** Executes `docker exec tesc-backend-staging-v2 pytest`. This runs the full suite of Django integration/unit tests natively inside the staging container environment.
4. **Merge to Main:** If (and only if) the tests pass, it merges `staging` into `main`.
5. **Deploy Production:** Rebuilds `docker-compose.prod.yml` and performs a rolling upgrade (`up -d --no-deps`) on the production containers without causing downtime.

### 3.2 Troubleshooting Deployments
If Docker freezes or complains about `permission denied` when stopping containers (a known AppArmor/containerd conflict):
1. SSH into the VM: `ssh user@10.50.200.35`
2. Run the hard reset script: `bash ~/docker_hard_restart.sh`
3. Provide your `sudo` password. The script will aggressively wipe the stuck Docker shims, restart the core daemons, and bring production back online instantly.

---

## 4. Environment Variables (.env)
*   `.env` files are strictly banned from Git version control.
*   The production `.env` file must physically reside at `/home/user/Documents/TESC-main/.env` on the VM. If it is missing, Docker Compose will fail to build.
