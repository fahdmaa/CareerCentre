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
        
        // Calculate insights based on real data
        const insights = {};
        
        // Events insight - compare this month vs last month
        try {
            const thisMonthEvents = await query(
                "SELECT COUNT(*) FROM events WHERE DATE_TRUNC('month', event_date) = DATE_TRUNC('month', CURRENT_DATE)"
            );
            const lastMonthEvents = await query(
                "SELECT COUNT(*) FROM events WHERE DATE_TRUNC('month', event_date) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')"
            );
            
            const thisMonth = parseInt(thisMonthEvents.rows[0].count);
            const lastMonth = parseInt(lastMonthEvents.rows[0].count);
            
            if (lastMonth > 0) {
                insights.eventsChange = Math.round(((thisMonth - lastMonth) / lastMonth) * 100);
            } else {
                insights.eventsChange = thisMonth > 0 ? 100 : 0;
            }
        } catch (error) {
            insights.eventsChange = 0;
        }
        
        // Registration insights
        try {
            const thisMonthRegs = await query(
                "SELECT COUNT(*) FROM event_registrations WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)"
            );
            const lastMonthRegs = await query(
                "SELECT COUNT(*) FROM event_registrations WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')"
            );
            
            const thisMonth = parseInt(thisMonthRegs.rows[0].count);
            const lastMonth = parseInt(lastMonthRegs.rows[0].count);
            
            if (lastMonth > 0) {
                insights.registrationsChange = Math.round(((thisMonth - lastMonth) / lastMonth) * 100);
            } else {
                insights.registrationsChange = thisMonth > 0 ? 100 : 0;
            }
        } catch (error) {
            insights.registrationsChange = 0;
        }
        
        // Ambassador insights
        try {
            const thisMonthAmb = await query(
                "SELECT COUNT(*) FROM ambassadors WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)"
            );
            const lastMonthAmb = await query(
                "SELECT COUNT(*) FROM ambassadors WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')"
            );
            
            const thisMonth = parseInt(thisMonthAmb.rows[0].count);
            const lastMonth = parseInt(lastMonthAmb.rows[0].count);
            
            if (lastMonth > 0) {
                insights.ambassadorsChange = Math.round(((thisMonth - lastMonth) / lastMonth) * 100);
            } else {
                insights.ambassadorsChange = thisMonth > 0 ? 100 : 0;
            }
        } catch (error) {
            insights.ambassadorsChange = 0;
        }
        
        // Messages insight
        try {
            const thisMonthMsgs = await query(
                "SELECT COUNT(*) FROM messages WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)"
            );
            const lastMonthMsgs = await query(
                "SELECT COUNT(*) FROM messages WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')"
            );
            
            const thisMonth = parseInt(thisMonthMsgs.rows[0].count);
            const lastMonth = parseInt(lastMonthMsgs.rows[0].count);
            
            if (lastMonth > 0) {
                insights.messagesChange = Math.round(((thisMonth - lastMonth) / lastMonth) * 100);
            } else {
                insights.messagesChange = thisMonth > 0 ? 100 : 0;
            }
        } catch (error) {
            insights.messagesChange = 0;
        }
        
        res.json({
            ...stats,
            insights
        });
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
        res.json({ message: 'Ambassador deleted successfully', data: { id: req.params.id } });
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
        
        // Process capacity to ensure it's a valid positive integer or null
        const processedCapacity = (() => {
            if (capacity === null || capacity === undefined || capacity === '') {
                return null;
            }
            const numCapacity = Number(capacity);
            if (isNaN(numCapacity) || numCapacity < 0) {
                return null;
            }
            return Math.floor(numCapacity);
        })();
        
        const result = await query(
            `INSERT INTO events (title, description, event_date, event_time, location, capacity, status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [title, description, event_date, event_time, location, processedCapacity, status || 'upcoming']
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
        
        // Process capacity to ensure it's a valid positive integer or null
        const processedCapacity = (() => {
            if (capacity === null || capacity === undefined || capacity === '') {
                return null;
            }
            const numCapacity = Number(capacity);
            if (isNaN(numCapacity) || numCapacity < 0) {
                return null;
            }
            return Math.floor(numCapacity);
        })();
        
        const result = await query(
            `UPDATE events 
             SET title = $1, description = $2, event_date = $3, event_time = $4, 
                 location = $5, capacity = $6, status = $7, updated_at = CURRENT_TIMESTAMP
             WHERE id = $8 RETURNING *`,
            [title, description, event_date, event_time, location, processedCapacity, status, req.params.id]
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
        res.json({ message: 'Event deleted successfully', data: { id: req.params.id } });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ message: 'Error deleting event' });
    }
});

app.get('/api/events/:id/stats', authenticateToken, async (req, res) => {
    try {
        const eventId = req.params.id;
        
        // Get event details and registration count
        const eventResult = await query(
            `SELECT e.*,
                    (SELECT COUNT(*) FROM event_registrations WHERE event_id = e.id) as registrations
             FROM events e 
             WHERE e.id = $1`,
            [eventId]
        );
        
        if (eventResult.rows.length === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }
        
        const event = eventResult.rows[0];
        const stats = {
            event_id: event.id,
            event_title: event.title,
            registrations: parseInt(event.registrations) || 0,
            capacity: event.capacity,
            status: event.status,
            event_date: event.event_date,
            location: event.location
        };
        
        res.json({ data: stats });
    } catch (error) {
        console.error('Error fetching event stats:', error);
        res.status(500).json({ message: 'Error fetching event stats' });
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
        
        // Validate required fields
        if (!event_id || !student_name || !student_email) {
            return res.status(400).json({ 
                success: false,
                message: 'Missing required fields: event_id, student_name, and student_email are required' 
            });
        }
        
        // Normalize email to lowercase for consistent comparison
        const normalizedEmail = student_email.toLowerCase().trim();
        
        console.log(`Registration attempt for event ${event_id} by ${normalizedEmail}`);
        
        // Check if already registered
        const existing = await query(
            'SELECT id FROM event_registrations WHERE event_id = $1 AND student_email = $2',
            [event_id, normalizedEmail]
        );
        
        console.log(`Duplicate check result: ${existing.rows.length} existing registrations found`);
        
        if (existing.rows.length > 0) {
            console.log(`Registration blocked: ${normalizedEmail} already registered for event ${event_id}`);
            return res.status(400).json({ 
                success: false,
                message: 'You are already registered for this event' 
            });
        }
        
        // Register for event
        const result = await query(
            `INSERT INTO event_registrations (event_id, student_name, student_email, student_phone, major, year) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [event_id, student_name, normalizedEmail, student_phone, major, year]
        );
        
        console.log(`Registration successful: ${normalizedEmail} registered for event ${event_id}`);
        
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

// Admin profile endpoints
app.get('/api/admin/profile', authenticateToken, async (req, res) => {
    try {
        // Get admin profile from database
        const profileResult = await query('SELECT * FROM admin_profiles WHERE user_id = $1', [req.user.id]);
        
        let profile;
        if (profileResult.rows.length === 0) {
            // Create default profile if doesn't exist
            const insertResult = await query(
                'INSERT INTO admin_profiles (user_id, name, occupation, phone, email) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [req.user.id, 'Admin User', 'Career Center Administrator', '+212 6 12 34 56 78', 'admin@emsi.ma']
            );
            profile = insertResult.rows[0];
        } else {
            profile = profileResult.rows[0];
        }
        
        res.json({
            data: {
                id: profile.user_id,
                username: req.user.username,
                name: profile.name,
                occupation: profile.occupation,
                phone: profile.phone,
                email: profile.email,
                profile_picture: profile.profile_picture
            }
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Error fetching profile' });
    }
});

app.put('/api/admin/profile', authenticateToken, async (req, res) => {
    try {
        const { name, occupation, phone, email, profile_picture } = req.body;
        
        // Validate required fields
        if (!name || !email) {
            return res.status(400).json({ 
                message: 'Name and email are required' 
            });
        }
        
        // Update profile in database
        const updateResult = await query(
            `UPDATE admin_profiles 
             SET name = $1, occupation = $2, phone = $3, email = $4, profile_picture = $5, updated_at = NOW() 
             WHERE user_id = $6 
             RETURNING *`,
            [name, occupation || 'Career Center Administrator', phone || '', email, profile_picture, req.user.id]
        );
        
        if (updateResult.rows.length === 0) {
            // Create profile if doesn't exist
            const insertResult = await query(
                'INSERT INTO admin_profiles (user_id, name, occupation, phone, email, profile_picture) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                [req.user.id, name, occupation || 'Career Center Administrator', phone || '', email, profile_picture]
            );
            const profile = insertResult.rows[0];
            
            return res.json({
                data: {
                    id: profile.user_id,
                    username: req.user.username,
                    name: profile.name,
                    occupation: profile.occupation,
                    phone: profile.phone,
                    email: profile.email,
                    profile_picture: profile.profile_picture
                },
                message: 'Profile created successfully'
            });
        }
        
        const profile = updateResult.rows[0];
        res.json({
            data: {
                id: profile.user_id,
                username: req.user.username,
                name: profile.name,
                occupation: profile.occupation,
                phone: profile.phone,
                email: profile.email,
                profile_picture: profile.profile_picture
            },
            message: 'Profile updated successfully'
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Error updating profile' });
    }
});

// Recent activities endpoint
app.get('/api/admin/activities', authenticateToken, async (req, res) => {
    try {
        const activitiesResult = await query(
            'SELECT * FROM recent_activities ORDER BY created_at DESC LIMIT 10'
        );
        
        res.json({
            data: activitiesResult.rows.map(activity => ({
                id: activity.id,
                type: activity.activity_type,
                description: activity.description,
                user_name: activity.user_name,
                user_email: activity.user_email,
                data: activity.activity_data,
                time: activity.created_at
            }))
        });
    } catch (error) {
        console.error('Error fetching activities:', error);
        res.status(500).json({ message: 'Error fetching activities' });
    }
});

// Cohort endpoints
app.get('/api/cohorts', authenticateToken, async (req, res) => {
    // Return default cohort data for now
    res.json({
        data: [
            {
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
        ]
    });
});

app.get('/api/cohorts/:year', authenticateToken, async (req, res) => {
    const { year } = req.params;
    res.json({
        data: {
            year: year,
            active: year === '2024',
            startDate: `${year}-09-01`,
            endDate: `${parseInt(year) + 1}-06-30`,
            maxAmbassadors: 20,
            applicationDeadline: `${year}-08-15`,
            perks: ['Leadership training', 'Networking events', 'Certificate of achievement', 'Priority access to career events']
        }
    });
});

// Public cohort endpoint
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


// Additional admin endpoints for dashboard
app.get('/api/applications', authenticateToken, async (req, res) => {
    try {
        // Return applications from messages table where subject contains 'Ambassador Application'
        const result = await query(
            "SELECT * FROM messages WHERE subject LIKE '%Ambassador Application%' ORDER BY created_at DESC"
        );
        res.json({ data: result.rows });
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({ message: 'Error fetching applications' });
    }
});

app.get('/api/registrations', authenticateToken, async (req, res) => {
    try {
        console.log('🔍 Fetching registrations with JOIN query');
        // Join with events table to get event title and details
        const joinQuery = `
            SELECT 
                er.*,
                e.title as event_title,
                e.event_date,
                e.location as event_location,
                e.capacity as event_capacity
            FROM event_registrations er
            JOIN events e ON er.event_id = e.id
            ORDER BY er.registration_date DESC
        `;
        console.log('📝 JOIN query:', joinQuery.trim());
        const result = await query(joinQuery);
        console.log('✅ Got registrations with event data:', result.rows.length);
        res.json({ data: result.rows });
    } catch (error) {
        console.error('Error fetching registrations:', error);
        res.status(500).json({ message: 'Error fetching registrations' });
    }
});

app.get('/api/messages', authenticateToken, async (req, res) => {
    try {
        const result = await query('SELECT * FROM messages ORDER BY created_at DESC');
        res.json({ data: result.rows });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Error fetching messages' });
    }
});

app.get('/api/messages/stats/overview', authenticateToken, async (req, res) => {
    try {
        const stats = {};
        
        // Get unread messages count
        const unreadResult = await query('SELECT COUNT(*) FROM messages WHERE status = $1', ['unread']);
        stats.unread = parseInt(unreadResult.rows[0].count);
        
        // Get total messages count
        const totalResult = await query('SELECT COUNT(*) FROM messages');
        stats.total = parseInt(totalResult.rows[0].count);
        
        res.json({ data: stats });
    } catch (error) {
        console.error('Error fetching message stats:', error);
        res.status(500).json({ message: 'Error fetching message statistics' });
    }
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