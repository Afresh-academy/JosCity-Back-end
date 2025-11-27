#!/bin/bash

# Database Setup Script for Render
# This script initializes the database with all necessary schemas

set -e

echo "🚀 Starting database setup..."

if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set"
    exit 1
fi

echo "📦 Running users schema..."
psql "$DATABASE_URL" -f database/joscity/users_schema.sql || {
    echo "⚠️  Warning: users_schema.sql may have already been run"
}

echo "📦 Running landing page schema..."
psql "$DATABASE_URL" -f database/joscity/setup_landing_page.sql || {
    echo "⚠️  Warning: setup_landing_page.sql may have already been run"
}

echo "✅ Database setup complete!"

