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

// Logging middleware (disabled in production)

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

// Static file request handling (logging disabled in production)

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
            trainings: [
                { id: 1, title: 'Leadership Fundamentals', description: 'Learn the basics of effective leadership and team management' },
                { id: 2, title: 'Public Speaking', description: 'Master the art of presenting and communicating with confidence' },
                { id: 3, title: 'Event Management', description: 'Organize successful events from planning to execution' }
            ],
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
let nextApplicationId = 1;

// Ambassador applications storage
let applications = [];

// Application status pipeline
const APPLICATION_STATUSES = {
    PENDING_REVIEW: 'pending_review',
    INVITE_TO_INTERVIEW: 'invite_to_interview', 
    INVITED: 'invited',
    INTERVIEWED: 'interviewed',
    SHORTLISTED: 'shortlisted',
    VALIDATED: 'validated',
    REJECTED: 'rejected'
};

// Email templates
const EMAIL_TEMPLATES = {
    REJECTION: {
        subject: 'EMSI Student Ambassador Application Update',
        body: 'Thank you for your interest in the EMSI Student Ambassador program. After careful consideration, we regret to inform you that we will not be moving forward with your application at this time. We encourage you to apply again in the future.'
    },
    INVITATION: {
        subject: 'Interview Invitation - EMSI Student Ambassador Program',
        body: 'Congratulations! We are impressed with your application and would like to invite you for an interview for the EMSI Student Ambassador program.'
    },
    WELCOME: {
        subject: 'Welcome to the EMSI Student Ambassador Program!',
        body: 'Congratulations! We are delighted to welcome you to the EMSI Student Ambassador program. You have been selected to join our prestigious community of student leaders.'
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

app.get('/api/public/cohorts/active', (req, res) => {
    const activeCohort = cohortConfig.cohorts.find(c => c.active);
    if (!activeCohort) {
        return res.status(404).json({ message: 'No active cohort found' });
    }
    res.set('Cache-Control', 'no-store');
    res.json({ data: activeCohort });
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

// Public endpoint for ambassador applications
app.post('/api/public/applications', (req, res) => {
    const { name, email, major, year, linkedin, motivation, experience } = req.body;
    
    // Validate required fields
    if (!name || !email || !major || !year || !motivation) {
        return res.status(400).json({ 
            success: false,
            message: 'Please fill in all required fields' 
        });
    }
    
    // Check if email already applied for this cohort
    const activeCohort = cohortConfig.cohorts.find(c => c.active);
    if (!activeCohort) {
        return res.status(400).json({ 
            success: false,
            message: 'Applications are currently closed' 
        });
    }
    
    const existingApplication = applications.find(
        app => app.email === email && app.cohort === activeCohort.year
    );
    
    if (existingApplication) {
        return res.status(400).json({ 
            success: false,
            message: 'You have already submitted an application for this cohort' 
        });
    }
    
    // Create new application
    const newApplication = {
        id: nextApplicationId++,
        name,
        email,
        major,
        year,
        linkedin: linkedin || '',
        motivation,
        experience: experience || '',
        cohort: activeCohort.year,
        status: APPLICATION_STATUSES.PENDING_REVIEW,
        submittedAt: new Date().toISOString(),
        // Interview fields
        interviewNotes: '',
        rating: null, // 1-5 star rating
        interviewDate: null,
        // Tracking fields
        lastStatusUpdate: new Date().toISOString(),
        statusHistory: [{
            status: APPLICATION_STATUSES.PENDING_REVIEW,
            date: new Date().toISOString(),
            updatedBy: 'system'
        }]
    };
    
    applications.push(newApplication);
    
    res.json({ 
        success: true,
        message: 'Application submitted successfully!',
        applicationId: newApplication.id 
    });
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
        trainings: req.body.trainings || [],
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

// Training management endpoints for cohorts
app.post('/api/cohorts/:year/trainings', authenticateToken, (req, res) => {
    const cohort = cohortConfig.cohorts.find(c => c.year === req.params.year);
    if (!cohort) {
        return res.status(404).json({ message: 'Cohort not found' });
    }
    
    const newTraining = {
        id: cohort.trainings ? Math.max(...cohort.trainings.map(t => t.id), 0) + 1 : 1,
        title: req.body.title,
        description: req.body.description,
        date: req.body.date,
        duration: req.body.duration,
        mandatory: req.body.mandatory || false
    };
    
    if (!cohort.trainings) cohort.trainings = [];
    cohort.trainings.push(newTraining);
    
    res.status(201).json({ data: newTraining });
});

app.put('/api/cohorts/:year/trainings/:trainingId', authenticateToken, (req, res) => {
    const cohort = cohortConfig.cohorts.find(c => c.year === req.params.year);
    if (!cohort) {
        return res.status(404).json({ message: 'Cohort not found' });
    }
    
    const trainingIndex = cohort.trainings?.findIndex(t => t.id == req.params.trainingId);
    if (trainingIndex === -1 || trainingIndex === undefined) {
        return res.status(404).json({ message: 'Training not found' });
    }
    
    cohort.trainings[trainingIndex] = { ...cohort.trainings[trainingIndex], ...req.body };
    res.json({ data: cohort.trainings[trainingIndex] });
});

app.delete('/api/cohorts/:year/trainings/:trainingId', authenticateToken, (req, res) => {
    const cohort = cohortConfig.cohorts.find(c => c.year === req.params.year);
    if (!cohort) {
        return res.status(404).json({ message: 'Cohort not found' });
    }
    
    const trainingIndex = cohort.trainings?.findIndex(t => t.id == req.params.trainingId);
    if (trainingIndex === -1 || trainingIndex === undefined) {
        return res.status(404).json({ message: 'Training not found' });
    }
    
    cohort.trainings.splice(trainingIndex, 1);
    res.json({ message: 'Training deleted successfully' });
});

// Application management endpoints (admin)
app.get('/api/applications', authenticateToken, (req, res) => {
    const { cohort, status } = req.query;
    let filteredApplications = [...applications];
    
    if (cohort) {
        filteredApplications = filteredApplications.filter(app => app.cohort === cohort);
    }
    
    if (status) {
        filteredApplications = filteredApplications.filter(app => app.status === status);
    }
    
    res.json({ data: filteredApplications });
});

app.get('/api/applications/:id', authenticateToken, (req, res) => {
    const application = applications.find(app => app.id == req.params.id);
    if (!application) {
        return res.status(404).json({ message: 'Application not found' });
    }
    res.json({ data: application });
});

app.put('/api/applications/:id', authenticateToken, (req, res) => {
    const index = applications.findIndex(app => app.id == req.params.id);
    if (index === -1) {
        return res.status(404).json({ message: 'Application not found' });
    }
    
    const { status, interviewNotes, rating } = req.body;
    const application = applications[index];
    
    // Handle status update
    if (status && Object.values(APPLICATION_STATUSES).includes(status)) {
        const oldStatus = application.status;
        application.status = status;
        application.lastStatusUpdate = new Date().toISOString();
        
        // Add to status history
        application.statusHistory.push({
            status,
            date: new Date().toISOString(),
            updatedBy: req.user.username,
            previousStatus: oldStatus
        });
        
        // Handle special status transitions
        if (status === APPLICATION_STATUSES.INTERVIEWED) {
            application.interviewDate = new Date().toISOString();
        }
        
        // Auto-create ambassador when validated
        if (status === APPLICATION_STATUSES.VALIDATED) {
            const newAmbassador = {
                id: ambassadors.length + 1,
                name: application.name,
                email: application.email,
                major: application.major,
                year: application.year,
                linkedin: application.linkedin,
                role: 'Ambassador',
                bio: application.motivation,
                status: 'active',
                cohort: application.cohort,
                image: null,
                perks: [],
                trainings: [],
                joinedDate: new Date().toISOString()
            };
            ambassadors.push(newAmbassador);
        }
    }
    
    // Handle interview notes
    if (interviewNotes !== undefined) {
        application.interviewNotes = interviewNotes;
    }
    
    // Handle rating (1-5)
    if (rating !== undefined && rating >= 1 && rating <= 5) {
        application.rating = rating;
    }
    
    res.json({ data: applications[index] });
});

// Stats endpoint update to include applications
app.get('/api/admin/stats', authenticateToken, (req, res) => {
    const activeCohort = cohortConfig.cohorts.find(c => c.active);
    const cohortApplications = activeCohort ? 
        applications.filter(app => app.cohort === activeCohort.year) : [];
    
    res.json({
        data: {
            active_ambassadors: ambassadors.filter(a => a.status === 'active').length,
            upcoming_events: events.filter(e => e.status === 'upcoming').length,
            total_registrations: events.reduce((sum, e) => sum + (e.registered_count || 0), 0),
            unread_messages: 17,
            active_jobs: jobs.filter(j => j.status === 'active').length,
            pending_applications: cohortApplications.filter(app => app.status === APPLICATION_STATUSES.PENDING_REVIEW).length,
            total_applications: cohortApplications.length
        }
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
    res.status(500).json({ message: 'Internal server error' });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    process.exit(0);
});

process.on('SIGINT', () => {
    process.exit(0);
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle server errors
server.on('error', (err) => {
    if (!isProduction) {
        console.error('Server error:', err);
    }
});

module.exports = app;