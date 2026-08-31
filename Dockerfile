# Multi-stage Dockerfile for ReconX
# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Backend & Production Runner
FROM python:3.13-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python backend dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy Backend Code
COPY backend/ ./backend

# Copy Built Frontend Assets into static directory or server root
COPY --from=frontend-builder /app/frontend/dist ./frontend_dist

ENV PORT=8000
ENV DATABASE_URL="sqlite:///./reconx.db"
ENV AMOUNT_TOLERANCE=0.01
ENV DATE_WINDOW_DAYS=3
ENV DEFAULT_GST_RATE=0.18

EXPOSE 8000

WORKDIR /app/backend
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
