#!/bin/bash

# Script to setup development environment

# Exit on error
set -e

# Check Node.js version
required_node_version="18"
current_node_version=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)

if [ "$current_node_version" -lt "$required_node_version" ]; then
    echo "Node.js version $required_node_version or higher is required"
    exit 1
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "Installing pnpm..."
    corepack enable
    corepack prepare pnpm@latest --activate
fi

# Install dependencies
echo "Installing dependencies..."
pnpm install

# Setup environment file
if [ ! -f .env.local ]; then
    echo "Creating .env.local..."
    cp .env.example .env.local
fi

# Build project
echo "Building project..."
pnpm build

echo "Development environment setup completed!"
echo "Run 'pnpm dev' to start the development server"