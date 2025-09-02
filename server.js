// server-postgres.js - Express server with PostgreSQL integration
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { query, supabase } = require('./database/supabase');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Security headers middleware
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
});

// Middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from public directory for assets
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));
app.use('/videos', express.static(path.join(__dirname, 'public', 'videos')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Special handling for CSS and JS files
app.get('/style.css', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'style.css');
    res.type('text/css');
    res.sendFile(filePath, (err) => {
        if (err) {
            res.status(404).send('style.css not found');
        }
    });
});

app.get('/main.js', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'main.js');
    res.type('application/javascript');
    res.sendFile(filePath, (err) => {
        if (err) {
            res.status(404).send('main.js not found');
        }
    });
});

// General static file serving from public directory
app.use(express.static(path.join(__dirname, 'public')));

// CORS configuration for development
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        next();
    });
}

// Serve static HTML files with explicit routes
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
    const filePath = path.join(__dirname, 'ambassadors.html');
    
    if (!fs.existsSync(filePath)) {
        return res.status(404).send('Ambassadors page not found');
    }
    
    res.sendFile(filePath);
});

app.get('/ambassadors.html', (req, res) => {
    const filePath = path.join(__dirname, 'ambassadors.html');
    res.sendFile(filePath);
});

app.get('/admin-login', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-login.html'));
});

app.get('/admin-login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-login.html'));
});

app.get('/admin-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-dashboard.html'));
});

app.get('/admin-dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-dashboard.html'));
});

// Secret key for JWT (use environment variables in production)
const JWT_SECRET = process.env.JWT_SECRET || 'emsi-career-center-secret-key-change-in-production';

// Rate limiting for login attempts (simple in-memory implementation)
const loginAttempts = new Map();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

function rateLimitLogin(req, res, next) {
    const clientIp = req.ip || req.connection.remoteAddress;
    const attempts = loginAttempts.get(clientIp) || { count: 0, lastAttempt: 0 };
    
    const now = Date.now();
    if (attempts.count >= MAX_LOGIN_ATTEMPTS && (now - attempts.lastAttempt) < LOCKOUT_DURATION) {
        return res.status(429).json({ 
            message: 'Too many login attempts. Please try again later.',
            retryAfter: Math.ceil((LOCKOUT_DURATION - (now - attempts.lastAttempt)) / 1000)
        });
    }
    
    // Reset attempts if lockout period has passed
    if ((now - attempts.lastAttempt) >= LOCKOUT_DURATION) {
        attempts.count = 0;
    }
    
    next();
}

// Login route
app.post('/api/auth/login', rateLimitLogin, async (req, res) => {
    const { username, password } = req.body;
    const clientIp = req.ip || req.connection.remoteAddress;

    // Input validation
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    if (typeof username !== 'string' || typeof password !== 'string') {
        return res.status(400).json({ message: 'Invalid input format' });
    }

    if (username.length > 50 || password.length > 200) {
        return res.status(400).json({ message: 'Input too long' });
    }

    try {
        // Find user in database
        const result = await query('SELECT * FROM users WHERE username = $1', [username]);
        
        if (result.rows.length === 0) {
            // Record failed attempt
            const attempts = loginAttempts.get(clientIp) || { count: 0, lastAttempt: 0 };
            attempts.count++;
            attempts.lastAttempt = Date.now();
            loginAttempts.set(clientIp, attempts);
            
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = result.rows[0];

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            // Record failed attempt
            const attempts = loginAttempts.get(clientIp) || { count: 0, lastAttempt: 0 };
            attempts.count++;
            attempts.lastAttempt = Date.now();
            loginAttempts.set(clientIp, attempts);
            
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Reset failed attempts on successful login
        loginAttempts.delete(clientIp);

        // Create JWT token
        const token = jwt.sign(
            { id: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Send token
        res.json({ 
            token,
            user: {
                id: user.id,
                username: user.username
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided' });
    }

    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({ message: 'Invalid token' });
        } else {
            return res.status(500).json({ message: 'Token verification failed' });
        }
    }
};

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, 'public', 'uploads', 'ambassadors');
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'ambassador-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Protected route example - now fetching real data from database
app.get('/api/admin/dashboard', authenticateToken, async (req, res) => {
    try {
        const stats = {};
        
        // Get upcoming events count
        const eventsResult = await query('SELECT COUNT(*) FROM events WHERE status = $1', ['upcoming']);
        stats.upcomingEvents = parseInt(eventsResult.rows[0].count);
        
        // Get active ambassadors count  
        const ambassadorsResult = await query('SELECT COUNT(*) FROM ambassadors WHERE status = $1', ['active']);
        stats.activeAmbassadors = parseInt(ambassadorsResult.rows[0].count);
        
        // Get total registrations
        const registrationsResult = await query('SELECT COUNT(*) FROM event_registrations');
        stats.eventRegistrations = parseInt(registrationsResult.rows[0].count);
        
        // Get unread messages count
        const messagesResult = await query('SELECT COUNT(*) FROM messages WHERE status = $1', ['unread']);
        stats.unreadMessages = parseInt(messagesResult.rows[0].count);
        
        res.json(stats);
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Error fetching dashboard statistics' });
    }
});

// Ambassador endpoints
app.get('/api/ambassadors', authenticateToken, async (req, res) => {
    try {
        const result = await query('SELECT * FROM ambassadors ORDER BY id DESC');
        res.json({ data: result.rows });
    } catch (error) {
        console.error('Error fetching ambassadors:', error);
        res.status(500).json({ message: 'Error fetching ambassadors' });
    }
});

app.get('/api/ambassadors/:id', authenticateToken, async (req, res) => {
    try {
        const result = await query('SELECT * FROM ambassadors WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Ambassador not found' });
        }
        res.json({ data: result.rows[0] });
    } catch (error) {
        console.error('Error fetching ambassador:', error);
        res.status(500).json({ message: 'Error fetching ambassador' });
    }
});

app.post('/api/ambassadors', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const { name, role, major, year, email, linkedin, bio, status } = req.body;
        const image_url = req.file ? `/uploads/ambassadors/${req.file.filename}` : null;
        
        const result = await query(
            `INSERT INTO ambassadors (name, role, major, year, email, linkedin, bio, image_url, status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [name, role, major, year, email, linkedin, bio, image_url, status || 'active']
        );
        
        res.status(201).json({ data: result.rows[0] });
    } catch (error) {
        console.error('Error creating ambassador:', error);
        res.status(500).json({ message: 'Error creating ambassador' });
    }
});

app.put('/api/ambassadors/:id', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const { name, role, major, year, email, linkedin, bio, status } = req.body;
        let image_url = req.body.image_url;
        
        if (req.file) {
            image_url = `/uploads/ambassadors/${req.file.filename}`;
        }
        
        const result = await query(
            `UPDATE ambassadors 
             SET name = $1, role = $2, major = $3, year = $4, email = $5, 
                 linkedin = $6, bio = $7, image_url = $8, status = $9, updated_at = CURRENT_TIMESTAMP
             WHERE id = $10 RETURNING *`,
            [name, role, major, year, email, linkedin, bio, image_url, status, req.params.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Ambassador not found' });
        }
        
        res.json({ data: result.rows[0] });
    } catch (error) {
        console.error('Error updating ambassador:', error);
        res.status(500).json({ message: 'Error updating ambassador' });
    }
});

app.delete('/api/ambassadors/:id', authenticateToken, async (req, res) => {
    try {
        const result = await query('DELETE FROM ambassadors WHERE id = $1 RETURNING id', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Ambassador not found' });
        }
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting ambassador:', error);
        res.status(500).json({ message: 'Error deleting ambassador' });
    }
});

// Event endpoints
app.get('/api/events', authenticateToken, async (req, res) => {
    try {
        const result = await query('SELECT * FROM events ORDER BY event_date DESC');
        res.json({ data: result.rows });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Error fetching events' });
    }
});

app.get('/api/events/:id', authenticateToken, async (req, res) => {
    try {
        const result = await query('SELECT * FROM events WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json({ data: result.rows[0] });
    } catch (error) {
        console.error('Error fetching event:', error);
        res.status(500).json({ message: 'Error fetching event' });
    }
});

app.post('/api/events', authenticateToken, async (req, res) => {
    try {
        const { title, description, event_date, event_time, location, capacity, status } = req.body;
        
        const result = await query(
            `INSERT INTO events (title, description, event_date, event_time, location, capacity, status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [title, description, event_date, event_time, location, capacity || 0, status || 'upcoming']
        );
        
        res.status(201).json({ data: result.rows[0] });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ message: 'Error creating event' });
    }
});

app.put('/api/events/:id', authenticateToken, async (req, res) => {
    try {
        const { title, description, event_date, event_time, location, capacity, status } = req.body;
        
        const result = await query(
            `UPDATE events 
             SET title = $1, description = $2, event_date = $3, event_time = $4, 
                 location = $5, capacity = $6, status = $7, updated_at = CURRENT_TIMESTAMP
             WHERE id = $8 RETURNING *`,
            [title, description, event_date, event_time, location, capacity, status, req.params.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }
        
        res.json({ data: result.rows[0] });
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ message: 'Error updating event' });
    }
});

app.delete('/api/events/:id', authenticateToken, async (req, res) => {
    try {
        const result = await query('DELETE FROM events WHERE id = $1 RETURNING id', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ message: 'Error deleting event' });
    }
});

// Public endpoints (no auth required)
app.get('/api/public/ambassadors', async (req, res) => {
    try {
        const result = await query('SELECT * FROM ambassadors WHERE status = $1 ORDER BY id DESC', ['active']);
        res.set('Cache-Control', 'no-store');
        res.json({ data: result.rows });
    } catch (error) {
        console.error('Error fetching public ambassadors:', error);
        res.status(500).json({ message: 'Error fetching ambassadors' });
    }
});

app.get('/api/public/events', async (req, res) => {
    try {
        const result = await query(
            `SELECT e.*, 
                    (SELECT COUNT(*) FROM event_registrations WHERE event_id = e.id) as registered_count
             FROM events e 
             WHERE e.status = $1 
             ORDER BY e.event_date ASC`,
            ['upcoming']
        );
        res.set('Cache-Control', 'no-store');
        res.json({ data: result.rows });
    } catch (error) {
        console.error('Error fetching public events:', error);
        res.status(500).json({ message: 'Error fetching events' });
    }
});

// Event registration endpoint
app.post('/api/public/register', async (req, res) => {
    try {
        const { event_id, student_name, student_email, student_phone, major, year } = req.body;
        
        // Check if already registered
        const existing = await query(
            'SELECT id FROM event_registrations WHERE event_id = $1 AND student_email = $2',
            [event_id, student_email]
        );
        
        if (existing.rows.length > 0) {
            return res.status(400).json({ 
                success: false,
                message: 'You are already registered for this event' 
            });
        }
        
        // Register for event
        const result = await query(
            `INSERT INTO event_registrations (event_id, student_name, student_email, student_phone, major, year) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [event_id, student_name, student_email, student_phone, major, year]
        );
        
        res.json({ 
            success: true,
            message: 'Registration successful!',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error registering for event:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error registering for event' 
        });
    }
});

// Admin stats endpoint
app.get('/api/admin/stats', authenticateToken, async (req, res) => {
    try {
        const stats = {};
        
        // Get active ambassadors count
        const ambassadorsResult = await query('SELECT COUNT(*) FROM ambassadors WHERE status = $1', ['active']);
        stats.active_ambassadors = parseInt(ambassadorsResult.rows[0].count);
        
        // Get upcoming events count
        const eventsResult = await query('SELECT COUNT(*) FROM events WHERE status = $1', ['upcoming']);
        stats.upcoming_events = parseInt(eventsResult.rows[0].count);
        
        // Get total registrations
        const registrationsResult = await query('SELECT COUNT(*) FROM event_registrations');
        stats.total_registrations = parseInt(registrationsResult.rows[0].count);
        
        // Get unread messages count
        const messagesResult = await query('SELECT COUNT(*) FROM messages WHERE status = $1', ['unread']);
        stats.unread_messages = parseInt(messagesResult.rows[0].count);
        
        res.json({ data: stats });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ message: 'Error fetching statistics' });
    }
});

// Cohort endpoints (simplified for now)
app.get('/api/public/cohorts/active', (req, res) => {
    // Return a default cohort for now
    res.json({
        data: {
            year: '2024',
            active: true,
            startDate: '2024-09-01',
            endDate: '2025-06-30',
            maxAmbassadors: 20,
            applicationDeadline: '2024-08-15',
            perks: ['Leadership training', 'Networking events', 'Certificate of achievement', 'Priority access to career events'],
            trainings: [
                { id: 1, title: 'Leadership Fundamentals', description: 'Learn the basics of effective leadership and team management' },
                { id: 2, title: 'Public Speaking', description: 'Master the art of presenting and communicating with confidence' },
                { id: 3, title: 'Event Management', description: 'Organize successful events from planning to execution' }
            ]
        }
    });
});

// Application submission endpoint (stores in messages table for now)
app.post('/api/public/applications', async (req, res) => {
    try {
        const { name, email, major, year, linkedin, motivation, experience } = req.body;
        
        // Validate required fields
        if (!name || !email || !major || !year || !motivation) {
            return res.status(400).json({ 
                success: false,
                message: 'Please fill in all required fields' 
            });
        }
        
        // Store application as a message
        const messageContent = `
            Ambassador Application
            Name: ${name}
            Email: ${email}
            Major: ${major}
            Year: ${year}
            LinkedIn: ${linkedin || 'Not provided'}
            Motivation: ${motivation}
            Experience: ${experience || 'Not provided'}
        `;
        
        const result = await query(
            'INSERT INTO messages (sender_name, sender_email, subject, message) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, email, 'Ambassador Application - ' + name, messageContent]
        );
        
        res.json({ 
            success: true,
            message: 'Application submitted successfully!',
            applicationId: result.rows[0].id
        });
    } catch (error) {
        console.error('Error submitting application:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error submitting application' 
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: 'Supabase'
    });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({ message: 'API endpoint not found' });
});

// Serve HTML files from root directory
app.use(express.static(__dirname, {
    extensions: ['html'],
    index: false  // We handle index routing ourselves
}));

// Catch-all for 404s
app.use((req, res) => {
    res.status(404).send('Page not found');
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ message: 'Internal server error' });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        console.log('Supabase connection closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        console.log('Supabase connection closed');
        process.exit(0);
    });
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Database: Supabase connected`);
});

// Handle server errors
server.on('error', (err) => {
    if (!isProduction) {
        console.error('Server error:', err);
    }
});

module.exports = app;