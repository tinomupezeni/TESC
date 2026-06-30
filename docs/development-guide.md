# Development Guide

Welcome to the TESC (ScalarEye) development environment guide. This document outlines the modern, containerized workflow required to build and test the application locally.

## Prerequisites
- **Docker & Docker Compose** (Required for the database)
- **Python 3.10+**
- **Node.js 18+**

## Local Environment Setup

We have standardized our local development to mirror production by using **PostgreSQL via Docker**, permanently deprecating the use of local SQLite databases.

### 1. Database Setup (Docker)
You must spin up the Postgres container before running the backend. The container exposes port `5432` to your local machine.

```bash
# Start the database in the background
docker-compose up -d db
```

### 2. Backend Setup
```bash
cd backend

# Create your local environment file
cp .env.example .env

# Create virtual environment and install dependencies
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install pytest pytest-django # Ensure testing tools are installed

# Run migrations and start server
python manage.py migrate
python manage.py runserver
```

### 3. Frontend Setup
There are two frontends: the main client (`frontend/`) and the institution admin panel (`inst/`).

```bash
cd frontend  # or cd inst
npm install
npm run dev
```

## Testing Workflow (Pytest)
We have migrated away from standalone `smoke_test_*.py` scripts polluting the root directory. All tests now live in the `tests/` directory and use the `pytest` framework.

To run the test suite:
```bash
# Run all tests
pytest

# Run tests with verbose output
pytest -v

# Run a specific test file
pytest tests/test_departments.py
```
*Note: Tests automatically mock database transactions and roll back after execution, preventing test data leakage.*

## Management Commands
Utility scripts (like password resets, data syncing, or generation scripts) should be implemented as **Django Management Commands** rather than floating `.py` files.

Example of running a ported utility:
```bash
python manage.py reset_admin_pass --email admin@scalareye.com --password NewPass123
```
New commands should be added to `backend/<app_name>/management/commands/`.
