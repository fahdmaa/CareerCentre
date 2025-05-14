// server.js - Basic Express server with authentication
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Serve static HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
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
const JWT_SECRET = 'emsi-career-center-secret-key';

// Login route
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;

    // Find user
    const user = users.find(u => u.username === username);
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare password
    try {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Create JWT token
        const token = jwt.sign(
            { id: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Send token
        res.json({ token });
    } catch (error) {
        console.error(error);
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
        res.status(403).json({ message: 'Invalid token' });
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

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});