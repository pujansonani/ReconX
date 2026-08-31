#!/bin/bash
set -e

# ==============================================================================
# ReconX — Automated 1-Click Server & Docker Deployment Script
# ==============================================================================

echo "================================================================="
echo "  🚀 Starting ReconX Production Server Deployment"
echo "================================================================="

# 1. Detect and install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "📦 Docker not found. Installing Docker CE..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm -f get-docker.sh
    echo "✓ Docker installed successfully."
fi

# 2. Check Docker daemon status
if ! docker info > /dev/null 2>&1; then
    echo "⚠️  Starting Docker daemon service..."
    if command -v systemctl &> /dev/null; then
        sudo systemctl start docker
        sudo systemctl enable docker
    elif command -v service &> /dev/null; then
        sudo service docker start
    fi
fi

# 3. Create .env if missing
if [ ! -f .env ]; then
    echo "⚙️  Generating default production .env file..."
    cat << 'EOF' > .env
AMOUNT_TOLERANCE=0.01
DATE_WINDOW_DAYS=3
DEFAULT_GST_RATE=0.18
DATABASE_URL=sqlite:////app/data/reconx.db
GEMINI_MODEL=gemini-2.5-flash
EOF
    echo "✓ .env created."
fi

# 4. Pull latest git code if git repo
if [ -d .git ]; then
    echo "🔄 Syncing latest code from git..."
    git pull origin main || true
fi

# 5. Build and launch Docker Compose services
echo "🔨 Building and launching ReconX containers (Backend + Frontend Nginx)..."
if docker compose version > /dev/null 2>&1; then
    docker compose down --remove-orphans || true
    docker compose up -d --build
elif command -v docker-compose &> /dev/null; then
    docker-compose down --remove-orphans || true
    docker-compose up -d --build
else
    echo "❌ Neither 'docker compose' nor 'docker-compose' was found."
    exit 1
fi

# 6. Wait for healthcheck verification
echo "⏳ Verifying service health..."
sleep 6

# 7. Print status and access endpoints
SERVER_IP=$(curl -s https://api.ipify.org || echo "localhost")

echo "================================================================="
echo "  🎉 ReconX is LIVE and running in production!"
echo "================================================================="
echo "  🌐 Web App:         http://${SERVER_IP}"
echo "  🩺 Health Endpoint: http://${SERVER_IP}/health"
echo "  📚 API Docs:        http://${SERVER_IP}:8000/docs"
echo "================================================================="
echo "  To view live container logs: docker compose logs -f"
echo "================================================================="
