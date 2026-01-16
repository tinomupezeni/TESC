# Use Python 3.11
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY backend/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend code
COPY backend/ .

# Collect static files
RUN python manage.py collectstatic --noinput

# Expose port for Gunicorn
EXPOSE 8000

# Start Gunicorn
<<<<<<< HEAD
CMD ["gunicorn", "backend.wsgi:application", "--bind", "0.0.0.0:8000"]
=======
CMD ["gunicorn", "core.wsgi:application", "--bind", "0.0.0.0:8000"]
>>>>>>> origin/main
