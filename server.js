// server.js - Express server with authentication
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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

// Middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
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

app.get('/admin-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-dashboard.html'));
});

app.get('/admin-dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-dashboard.html'));
});

// In a real app, you'd store users in a database
// For demo purposes, we'll use a simple array with a hashed password
const users = [
    {
        id: 1,
        username: 'admin',
        // This would be a hashed password in a real application
        // The plain text is 'admin123'
        password: '$2b$10$i8J5.1rFUG.C/n.0UJJEj.RPOTKu1BcUAFHwz/IC9xNQ9hJlJI3t6'
    }
];

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
        // Find user
        const user = users.find(u => u.username === username);
        if (!user) {
            // Record failed attempt
            const attempts = loginAttempts.get(clientIp) || { count: 0, lastAttempt: 0 };
            attempts.count++;
            attempts.lastAttempt = Date.now();
            loginAttempts.set(clientIp, attempts);
            
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
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
            console.error('Token verification error:', error);
            return res.status(500).json({ message: 'Token verification failed' });
        }
    }
};

// Protected route example
app.get('/api/admin/dashboard', authenticateToken, (req, res) => {
    // In a real app, you'd fetch data from a database
    res.json({
        activeJobs: 24,
        newApplications: 156,
        upcomingEvents: 8,
        unreadMessages: 17
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({ message: 'API endpoint not found' });
});

// Catch-all route for 404 pages
app.get('*', (req, res) => {
    console.log(`404 - Page not found: ${req.path}`);
    res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(500).json({ message: 'Internal server error' });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle server errors
server.on('error', (err) => {
    console.error('Server error:', err);
});

module.exports = app;