#!/bin/bash

# Simple database setup using current system user
echo "🚀 Setting up PostgreSQL database for EMSI Career Center..."
echo ""

DB_NAME="emsi_career_center"

# Create database using current user (peer authentication)
echo "📊 Creating database as current user..."
createdb $DB_NAME 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Database created successfully!"
else
    echo "ℹ️  Database might already exist or creation failed"
fi

# Run schema using current user
echo "🔨 Creating tables..."
psql -d $DB_NAME < "$(dirname "$0")/database/schema.sql"

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
    echo ""
    echo "⚠️  Note: The application is configured to use 'postgres' user."
    echo "   You may need to update the .env file to use your current user,"
    echo "   or grant access to the postgres user."
else
    echo ""
    echo "❌ Database setup failed."
    echo ""
    echo "💡 Try running: sudo -u postgres psql"
fi