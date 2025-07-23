// server.js - Express server with PostgreSQL backend
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Load environment variables - prefer .env.local if it exists
if (fs.existsSync('.env.local')) {
    require('dotenv').config({ path: '.env.local' });
} else {
    require('dotenv').config();
}

// Import database and routes
const { query, pool } = require('./database/db');
const ambassadorsRouter = require('./routes/ambassadors');
const eventsRouter = require('./routes/events');
const registrationsRouter = require('./routes/registrations');
const messagesRouter = require('./routes/messages');

const app = express();
const PORT = process.env.PORT || 3000;

// Security headers middleware
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
});

// CORS middleware
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware for debugging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Serve static files from public directory for assets
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));
app.use('/videos', express.static(path.join(__dirname, 'public', 'videos')));

// Special handling for CSS and JS files
app.get('/style.css', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'style.css');
    console.log('Serving style.css from:', filePath);
    res.type('text/css');
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error('Error serving style.css:', err);
            res.status(404).send('style.css not found');
        }
    });
});

app.get('/main.js', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'main.js');
    console.log('Serving main.js from:', filePath);
    res.type('application/javascript');
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error('Error serving main.js:', err);
            res.status(404).send('main.js not found');
        }
    });
});

app.get('/api-client.js', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'api-client.js');
    console.log('Serving api-client.js from:', filePath);
    res.type('application/javascript');
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error('Error serving api-client.js:', err);
            res.status(404).send('api-client.js not found');
        }
    });
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'emsi-career-center-secret-key-change-in-production';

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Auth Routes
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;

    // Input validation
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        // Find user in database
        const result = await query(
            'SELECT * FROM users WHERE username = $1 OR email = $1',
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = result.rows[0];

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Create token
        const token = jwt.sign(
            { 
                id: user.id, 
                username: user.username,
                email: user.email,
                role: user.role 
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        database: pool ? 'connected' : 'disconnected'
    });
});

// API Routes (protected)
app.use('/api/ambassadors', authenticateToken, ambassadorsRouter);
app.use('/api/events', authenticateToken, eventsRouter);
app.use('/api/registrations', authenticateToken, registrationsRouter);
app.use('/api/messages', authenticateToken, messagesRouter);

// Dashboard stats endpoint
app.get('/api/admin/stats', authenticateToken, async (req, res) => {
    try {
        const stats = await query(`
            SELECT 
                (SELECT COUNT(*) FROM events WHERE event_date >= CURRENT_DATE) as upcoming_events,
                (SELECT COUNT(*) FROM ambassadors WHERE status = 'active') as active_ambassadors,
                (SELECT COUNT(*) FROM event_registrations) as total_registrations,
                (SELECT COUNT(*) FROM messages WHERE status = 'unread') as unread_messages
        `);
        
        res.json({
            success: true,
            data: stats.rows[0]
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics'
        });
    }
});

// Public API endpoints (for event registration form)
app.get('/api/public/events', async (req, res) => {
    try {
        const result = await query(
            `SELECT id, title, description, event_date, event_time, location, capacity,
                    (SELECT COUNT(*) FROM event_registrations WHERE event_id = events.id AND status != 'cancelled') as registered_count
             FROM events 
             WHERE status = 'upcoming' AND event_date >= CURRENT_DATE
             ORDER BY event_date ASC`
        );
        
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching public events:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching events'
        });
    }
});

app.get('/api/public/ambassadors', async (req, res) => {
    try {
        const result = await query(
            `SELECT id, name, role, major, year, status, email, linkedin, bio, image_url
             FROM ambassadors 
             WHERE status = 'active'
             ORDER BY created_at DESC`
        );
        
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching public ambassadors:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching ambassadors'
        });
    }
});

app.post('/api/public/register', async (req, res) => {
    try {
        const { 
            event_id,
            student_name,
            student_email,
            student_phone,
            major,
            year
        } = req.body;
        
        // Validate required fields
        if (!event_id || !student_name || !student_email) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        
        // Check if event exists and has capacity
        const eventCheck = await query(
            `SELECT id, capacity, 
                    (SELECT COUNT(*) FROM event_registrations WHERE event_id = $1 AND status != 'cancelled') as current_registrations
             FROM events 
             WHERE id = $1 AND status = 'upcoming'`,
            [event_id]
        );
        
        if (eventCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Event not found or registration closed'
            });
        }
        
        const event = eventCheck.rows[0];
        if (event.capacity > 0 && event.current_registrations >= event.capacity) {
            return res.status(400).json({
                success: false,
                message: 'Event is full'
            });
        }
        
        const result = await query(
            `INSERT INTO event_registrations 
             (event_id, student_name, student_email, student_phone, major, year, status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) 
             RETURNING *`,
            [event_id, student_name, student_email, student_phone, major, year, 'pending']
        );
        
        res.status(201).json({
            success: true,
            message: 'Registration successful! We will contact you soon.',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating registration:', error);
        
        if (error.code === '23505') {
            return res.status(400).json({
                success: false,
                message: 'You are already registered for this event'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error processing registration'
        });
    }
});

// Serve static HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'about.html'));
});

app.get('/about.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'about.html'));
});

app.get('/jobs', (req, res) => {
    res.sendFile(path.join(__dirname, 'jobs.html'));
});

app.get('/jobs.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'jobs.html'));
});

app.get('/events', (req, res) => {
    res.sendFile(path.join(__dirname, 'events.html'));
});

app.get('/events.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'events.html'));
});

app.get('/ambassadors', (req, res) => {
    console.log('Ambassadors route hit - serving ambassadors.html');
    const filePath = path.join(__dirname, 'ambassadors.html');
    console.log('File path:', filePath);
    console.log('File exists:', fs.existsSync(filePath));
    
    if (!fs.existsSync(filePath)) {
        console.error('ambassadors.html not found!');
        return res.status(404).send('Ambassadors page not found');
    }
    
    res.sendFile(filePath);
});

app.get('/ambassadors.html', (req, res) => {
    console.log('Ambassadors.html route hit');
    const filePath = path.join(__dirname, 'ambassadors.html');
    res.sendFile(filePath);
});

app.get('/admin-login', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-login.html'));
});

app.get('/admin-login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-login.html'));
});

app.get('/admin-login-test', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-login-test.html'));
});

app.get('/admin-login-test.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-login-test.html'));
});

app.get('/admin-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-dashboard.html'));
});

app.get('/admin-dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-dashboard.html'));
});

// 404 handler
app.use((req, res) => {
    console.log('404 - Not found:', req.path);
    res.status(404).send('Page not found');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).send('Something went wrong!');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    await pool.end();
    process.exit(0);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});