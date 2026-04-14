#!/bin/bash

# Script to deploy the application to production

# Exit on error
set -e

# Load environment variables
if [ -f .env ]; then
    source .env
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Pull latest changes
echo "Pulling latest changes..."
git pull origin main

# Build and deploy
echo "Building and deploying..."
docker compose pull
docker compose build --no-cache
docker compose up -d

# Clean up old images
echo "Cleaning up old images..."
docker image prune -f

echo "Deployment completed successfully!"