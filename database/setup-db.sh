#!/bin/bash

# Database setup script for EMSI Career Center
echo "🚀 Setting up PostgreSQL database for EMSI Career Center..."
echo ""
echo "This script will create the database and tables needed for the application."
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    exit 1
fi

# Database configuration
DB_NAME="emsi_career_center"
DB_USER="postgres"

echo "📝 Database configuration:"
echo "  - Database name: $DB_NAME"
echo "  - Database user: $DB_USER"
echo ""

# Create database (if not exists)
echo "📊 Creating database..."
createdb -U $DB_USER $DB_NAME 2>/dev/null || echo "Database already exists or creation failed"

# Run schema
echo "🔨 Creating tables..."
psql -U $DB_USER -d $DB_NAME < "$(dirname "$0")/schema.sql"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database setup completed successfully!"
    echo ""
    echo "📋 Created tables:"
    echo "  - users (with default admin user)"
    echo "  - events"
    echo "  - ambassadors"
    echo "  - event_registrations"
    echo "  - messages"
    echo ""
    echo "🔐 Default admin credentials:"
    echo "  - Username: admin"
    echo "  - Password: admin123"
else
    echo ""
    echo "❌ Database setup failed. Please check your PostgreSQL configuration."
    echo ""
    echo "💡 Common solutions:"
    echo "  1. Make sure PostgreSQL is running: sudo service postgresql start"
    echo "  2. Check your PostgreSQL user permissions"
    echo "  3. Update the .env file with correct database credentials"
fi