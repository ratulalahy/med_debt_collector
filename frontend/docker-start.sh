#!/bin/bash

echo "=========================================================="
echo "  Medical Debt Collection Frontend - Docker Launcher"
echo "=========================================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
else
    echo "✓ Docker is installed: $(docker --version)"
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "ERROR: Docker Compose is not installed. Please install Docker Compose first."
    echo "Visit: https://docs.docker.com/compose/install/"
    exit 1
else
    echo "✓ Docker Compose is installed"
fi

echo ""
echo "Starting the frontend application in Docker container..."
echo "This will take a moment for the first run as Docker needs to download the Node.js image."
echo ""

# Navigate to the frontend directory
cd "$(dirname "$0")" || exit

# Start the Docker container
docker-compose up

# Note: Press Ctrl+C to stop the container
