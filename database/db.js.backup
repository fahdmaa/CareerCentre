const { Pool } = require('pg');
require('dotenv').config();

// Create a connection pool
// Configure connection based on environment
const poolConfig = {
    database: process.env.DB_NAME || 'emsi_career_center',
    user: process.env.DB_USER || 'postgres',
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
};

// Add host and port if not using socket connection
if (process.env.DB_HOST && !process.env.DB_HOST.startsWith('/')) {
    poolConfig.host = process.env.DB_HOST;
    poolConfig.port = process.env.DB_PORT || 5432;
    poolConfig.password = process.env.DB_PASSWORD || 'postgres';
} else if (process.env.DB_HOST) {
    // Socket connection
    poolConfig.host = process.env.DB_HOST;
}

const pool = new Pool(poolConfig);

// Test database connection
pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('❌ Unexpected error on idle client', err);
    process.exit(-1);
});

// Helper function to execute queries
const query = async (text, params) => {
    try {
        const start = Date.now();
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('Executed query', { text, duration, rows: res.rowCount });
        return res;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
};

// Transaction helper
const getClient = () => {
    return pool.connect();
};

module.exports = {
    query,
    getClient,
    pool
};