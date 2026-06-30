#!/bin/bash
set -e
cd "$(dirname "$0")/.."

echo "Building Prelegal..."
docker compose build

echo "Starting Prelegal..."
docker compose up -d

echo ""
echo "Prelegal is running at http://localhost:8000"
