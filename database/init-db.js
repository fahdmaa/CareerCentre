const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

async function initializeDatabase() {
    try {
        console.log('🚀 Starting database initialization...');
        
        // Read the schema file
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        // Execute the schema
        await pool.query(schema);
        
        console.log('✅ Database initialized successfully!');
        console.log('📊 Tables created:');
        console.log('  - users');
        console.log('  - events');
        console.log('  - ambassadors');
        console.log('  - event_registrations');
        console.log('  - messages');
        console.log('');
        console.log('👤 Default admin user created:');
        console.log('  Username: admin');
        console.log('  Password: admin123');
        
    } catch (error) {
        console.error('❌ Error initializing database:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

// Run if called directly
if (require.main === module) {
    initializeDatabase()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

module.exports = { initializeDatabase };