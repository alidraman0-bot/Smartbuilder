# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Serve Backend & Static Frontend
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY app/ ./app/

# Copy built frontend from Stage 1 to a static directory (if served by FastAPI)
# Or keep them separate if using a proxy like Nginx.
# For simplicity in this mono-deploy, we'll assume FastAPI serves the frontend build.
COPY --from=frontend-builder /app/frontend/out ./static/frontend

# Environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

# Expose the API port
EXPOSE 8000

# Start command
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
