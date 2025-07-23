// server.js - Express server with authentication
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
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

// Logging middleware for debugging
app.use((req, res, next) => {
    if (!isProduction) {
        console.log(`${req.method} ${req.path}`);
    }
    next();
});

// Serve static files from public directory for assets
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));
app.use('/videos', express.static(path.join(__dirname, 'public', 'videos')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Special handling for CSS and JS files
app.get('/style.css', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'style.css');
    if (!isProduction) console.log('Serving style.css from:', filePath);
    res.type('text/css');
    res.sendFile(filePath, (err) => {
        if (err) {
            if (!isProduction) console.error('Error serving style.css:', err);
            res.status(404).send('style.css not found');
        }
    });
});

app.get('/main.js', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'main.js');
    if (!isProduction) console.log('Serving main.js from:', filePath);
    res.type('application/javascript');
    res.sendFile(filePath, (err) => {
        if (err) {
            if (!isProduction) console.error('Error serving main.js:', err);
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

// Debug: Log all static file requests
app.use((req, res, next) => {
    if (req.path.endsWith('.css') || req.path.endsWith('.js') || req.path.includes('/images/') || req.path.includes('/videos/')) {
        console.log(`Static file request: ${req.path}`);
    }
    next();
});

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
        password: '$2b$10$SDJO0pmbtfTabKgB1iV1q.UCN6XndLbG1BwptBDj8hO0PtDr7klWu'
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

// In-memory storage (replace with database in production)
let ambassadors = [
    { 
        id: 1, 
        name: 'Mohamed Alami', 
        role: 'Lead Ambassador', 
        major: 'Computer Science', 
        year: '4th Year', 
        email: 'm.alami@emsi.ma', 
        linkedin: 'mohamed-alami', 
        bio: 'Passionate about connecting students with career opportunities.', 
        status: 'active',
        cohort: '2024',
        image: null,
        perks: ['Leadership training', 'Networking events', 'Certificate of achievement'],
        trainings: ['Public speaking', 'Event management', 'Social media marketing']
    },
    { 
        id: 2, 
        name: 'Sophia Berrada', 
        role: 'Event Coordinator', 
        major: 'Business Administration', 
        year: '3rd Year', 
        email: 's.berrada@emsi.ma', 
        linkedin: 'sophia-berrada', 
        bio: 'Organizing impactful career events for EMSI students.', 
        status: 'active',
        cohort: '2024',
        image: null,
        perks: ['Event planning resources', 'Professional development', 'Recognition awards'],
        trainings: ['Event coordination', 'Budget management', 'Team leadership']
    },
    { 
        id: 3, 
        name: 'Youssef Benali', 
        role: 'Social Media Manager', 
        major: 'Digital Marketing', 
        year: '3rd Year', 
        email: 'y.benali@emsi.ma', 
        linkedin: 'youssef-benali', 
        bio: 'Building EMSI\'s career center online presence.', 
        status: 'active',
        cohort: '2024',
        image: null,
        perks: ['Content creation tools', 'Social media training', 'Marketing certification'],
        trainings: ['Content strategy', 'Analytics and insights', 'Brand management']
    }
];

// Cohort configuration
let cohortConfig = {
    currentCohort: '2024',
    cohorts: [
        {
            year: '2024',
            active: true,
            startDate: '2024-09-01',
            endDate: '2025-06-30',
            maxAmbassadors: 20,
            applicationDeadline: '2024-08-15',
            perks: ['Leadership training', 'Networking events', 'Certificate of achievement', 'Priority access to career events'],
            requiredTrainings: ['Orientation', 'Leadership basics', 'EMSI values and culture']
        }
    ]
};

let events = [
    { id: 1, title: 'Annual EMSI Marrakech Career Fair', event_date: '2025-07-05', event_time: '09:00', location: 'EMSI Campus - Main Hall', description: 'Connect with top employers and explore career opportunities.', capacity: 200, status: 'upcoming', registered_count: 45 },
    { id: 2, title: 'Workshop: Advanced CV & Cover Letter Strategies', event_date: '2025-06-10', event_time: '14:00', location: 'Online (Zoom)', description: 'Learn how to create compelling CVs and cover letters.', capacity: 50, status: 'upcoming', registered_count: 28 },
    { id: 3, title: 'Company Presentation: Tech Innovators Inc.', event_date: '2025-06-15', event_time: '10:00', location: 'EMSI Campus - Amphitheater B', description: 'Learn about career opportunities at Tech Innovators.', capacity: 100, status: 'upcoming', registered_count: 32 }
];

let jobs = [
    { id: 1, title: 'Software Developer Intern', company: 'Tech Solutions Morocco', location: 'Marrakech', type: 'Internship', description: 'Join our development team for a 6-month internship.', requirements: 'Computer Science students, JavaScript knowledge', posted_date: '2025-01-20', status: 'active' },
    { id: 2, title: 'Marketing Assistant', company: 'Digital Agency Maroc', location: 'Casablanca', type: 'Full-time', description: 'We are looking for a creative marketing assistant.', requirements: 'Marketing degree, Social media skills', posted_date: '2025-01-18', status: 'active' },
    { id: 3, title: 'Data Analyst', company: 'Finance Corp', location: 'Rabat', type: 'Full-time', description: 'Analyze financial data and create reports.', requirements: 'Statistics background, Excel proficiency', posted_date: '2025-01-15', status: 'active' }
];

// ID generators
let nextAmbassadorId = 4;
let nextEventId = 4;
let nextJobId = 4;

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

// Stats endpoint
app.get('/api/admin/stats', authenticateToken, (req, res) => {
    res.json({
        data: {
            active_ambassadors: ambassadors.filter(a => a.status === 'active').length,
            upcoming_events: events.filter(e => e.status === 'upcoming').length,
            total_registrations: events.reduce((sum, e) => sum + (e.registered_count || 0), 0),
            unread_messages: 17,
            active_jobs: jobs.filter(j => j.status === 'active').length
        }
    });
});

// Ambassador endpoints
app.get('/api/ambassadors', authenticateToken, (req, res) => {
    res.json({ data: ambassadors });
});

app.get('/api/ambassadors/:id', authenticateToken, (req, res) => {
    const ambassador = ambassadors.find(a => a.id == req.params.id);
    if (!ambassador) {
        return res.status(404).json({ message: 'Ambassador not found' });
    }
    res.json({ data: ambassador });
});

app.post('/api/ambassadors', authenticateToken, upload.single('image'), (req, res) => {
    const newAmbassador = {
        id: nextAmbassadorId++,
        ...req.body,
        image: req.file ? `/uploads/ambassadors/${req.file.filename}` : null,
        perks: req.body.perks ? (typeof req.body.perks === 'string' ? JSON.parse(req.body.perks) : req.body.perks) : [],
        trainings: req.body.trainings ? (typeof req.body.trainings === 'string' ? JSON.parse(req.body.trainings) : req.body.trainings) : [],
        cohort: req.body.cohort || cohortConfig.currentCohort,
        created_at: new Date().toISOString()
    };
    ambassadors.push(newAmbassador);
    res.status(201).json({ data: newAmbassador });
});

app.put('/api/ambassadors/:id', authenticateToken, upload.single('image'), (req, res) => {
    const index = ambassadors.findIndex(a => a.id == req.params.id);
    if (index === -1) {
        return res.status(404).json({ message: 'Ambassador not found' });
    }
    
    // Handle image update
    let updateData = { ...req.body };
    if (req.file) {
        updateData.image = `/uploads/ambassadors/${req.file.filename}`;
    }
    
    // Parse arrays if they come as strings
    if (updateData.perks && typeof updateData.perks === 'string') {
        updateData.perks = JSON.parse(updateData.perks);
    }
    if (updateData.trainings && typeof updateData.trainings === 'string') {
        updateData.trainings = JSON.parse(updateData.trainings);
    }
    
    ambassadors[index] = { ...ambassadors[index], ...updateData };
    res.json({ data: ambassadors[index] });
});

app.delete('/api/ambassadors/:id', authenticateToken, (req, res) => {
    const index = ambassadors.findIndex(a => a.id == req.params.id);
    if (index === -1) {
        return res.status(404).json({ message: 'Ambassador not found' });
    }
    ambassadors.splice(index, 1);
    res.status(204).send();
});

// Event endpoints
app.get('/api/events', authenticateToken, (req, res) => {
    res.json({ data: events });
});

app.get('/api/events/:id', authenticateToken, (req, res) => {
    const event = events.find(e => e.id == req.params.id);
    if (!event) {
        return res.status(404).json({ message: 'Event not found' });
    }
    res.json({ data: event });
});

app.post('/api/events', authenticateToken, (req, res) => {
    const newEvent = {
        id: nextEventId++,
        ...req.body,
        registered_count: 0,
        created_at: new Date().toISOString()
    };
    events.push(newEvent);
    res.status(201).json({ data: newEvent });
});

app.put('/api/events/:id', authenticateToken, (req, res) => {
    const index = events.findIndex(e => e.id == req.params.id);
    if (index === -1) {
        return res.status(404).json({ message: 'Event not found' });
    }
    events[index] = { ...events[index], ...req.body };
    res.json({ data: events[index] });
});

app.delete('/api/events/:id', authenticateToken, (req, res) => {
    const index = events.findIndex(e => e.id == req.params.id);
    if (index === -1) {
        return res.status(404).json({ message: 'Event not found' });
    }
    events.splice(index, 1);
    res.status(204).send();
});

// Job endpoints
app.get('/api/jobs', authenticateToken, (req, res) => {
    res.json({ data: jobs });
});

app.post('/api/jobs', authenticateToken, (req, res) => {
    const newJob = {
        id: nextJobId++,
        ...req.body,
        posted_date: new Date().toISOString(),
        status: 'active'
    };
    jobs.push(newJob);
    res.status(201).json({ data: newJob });
});

app.put('/api/jobs/:id', authenticateToken, (req, res) => {
    const index = jobs.findIndex(j => j.id == req.params.id);
    if (index === -1) {
        return res.status(404).json({ message: 'Job not found' });
    }
    jobs[index] = { ...jobs[index], ...req.body };
    res.json({ data: jobs[index] });
});

app.delete('/api/jobs/:id', authenticateToken, (req, res) => {
    const index = jobs.findIndex(j => j.id == req.params.id);
    if (index === -1) {
        return res.status(404).json({ message: 'Job not found' });
    }
    jobs.splice(index, 1);
    res.status(204).send();
});

// Public endpoints (no auth required)
app.get('/api/public/ambassadors', (req, res) => {
    const activeAmbassadors = ambassadors.filter(a => a.status === 'active');
    res.set('Cache-Control', 'no-store');
    res.json({ data: activeAmbassadors });
});

app.get('/api/public/events', (req, res) => {
    const upcomingEvents = events.filter(e => e.status === 'upcoming');
    res.set('Cache-Control', 'no-store');
    res.json({ data: upcomingEvents });
});

app.get('/api/public/jobs', (req, res) => {
    const activeJobs = jobs.filter(j => j.status === 'active');
    res.set('Cache-Control', 'no-store');
    res.json({ data: activeJobs });
});

// Cohort management endpoints
app.get('/api/cohorts', authenticateToken, (req, res) => {
    res.json({ data: cohortConfig });
});

app.get('/api/cohorts/:year', authenticateToken, (req, res) => {
    const cohort = cohortConfig.cohorts.find(c => c.year === req.params.year);
    if (!cohort) {
        return res.status(404).json({ message: 'Cohort not found' });
    }
    res.json({ data: cohort });
});

app.post('/api/cohorts', authenticateToken, (req, res) => {
    const newCohort = {
        year: req.body.year,
        active: req.body.active || false,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        maxAmbassadors: req.body.maxAmbassadors || 20,
        applicationDeadline: req.body.applicationDeadline,
        perks: req.body.perks || [],
        requiredTrainings: req.body.requiredTrainings || []
    };
    
    cohortConfig.cohorts.push(newCohort);
    if (newCohort.active) {
        cohortConfig.currentCohort = newCohort.year;
    }
    
    res.status(201).json({ data: newCohort });
});

app.put('/api/cohorts/:year', authenticateToken, (req, res) => {
    const index = cohortConfig.cohorts.findIndex(c => c.year === req.params.year);
    if (index === -1) {
        return res.status(404).json({ message: 'Cohort not found' });
    }
    
    cohortConfig.cohorts[index] = { ...cohortConfig.cohorts[index], ...req.body };
    
    // Update current cohort if this one is set to active
    if (req.body.active) {
        cohortConfig.currentCohort = req.params.year;
        // Deactivate other cohorts
        cohortConfig.cohorts.forEach((c, i) => {
            if (i !== index) c.active = false;
        });
    }
    
    res.json({ data: cohortConfig.cohorts[index] });
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

// Serve HTML files from root directory
app.use(express.static(__dirname, {
    extensions: ['html'],
    index: false  // We handle index routing ourselves
}));

// Catch-all for 404s
app.use((req, res) => {
    console.log(`404 - Not found: ${req.path}`);
    res.status(404).send('Page not found');
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