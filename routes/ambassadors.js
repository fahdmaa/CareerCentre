const express = require('express');
const router = express.Router();
const { query } = require('../database/db');

// Get all ambassadors
router.get('/', async (req, res) => {
    try {
        const result = await query(
            'SELECT * FROM ambassadors ORDER BY created_at DESC'
        );
        res.json({
            success: true,
            data: result.rows,
            count: result.rowCount
        });
    } catch (error) {
        console.error('Error fetching ambassadors:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching ambassadors',
            error: error.message
        });
    }
});

// Get single ambassador
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query(
            'SELECT * FROM ambassadors WHERE id = $1',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Ambassador not found'
            });
        }
        
        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching ambassador:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching ambassador',
            error: error.message
        });
    }
});

// Create new ambassador
router.post('/', async (req, res) => {
    try {
        const { name, role, major, year, email, linkedin, bio, image_url, status } = req.body;
        
        // Validate required fields
        if (!name || !role || !major || !year || !email) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        
        const result = await query(
            `INSERT INTO ambassadors (name, role, major, year, email, linkedin, bio, image_url, status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
             RETURNING *`,
            [name, role, major, year, email, linkedin, bio, image_url, status || 'active']
        );
        
        res.status(201).json({
            success: true,
            message: 'Ambassador created successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating ambassador:', error);
        
        // Handle unique constraint violation
        if (error.code === '23505') {
            return res.status(400).json({
                success: false,
                message: 'An ambassador with this email already exists'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error creating ambassador',
            error: error.message
        });
    }
});

// Update ambassador
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, role, major, year, email, linkedin, bio, image_url, status } = req.body;
        
        const result = await query(
            `UPDATE ambassadors 
             SET name = $1, role = $2, major = $3, year = $4, 
                 email = $5, linkedin = $6, bio = $7, image_url = $8, status = $9
             WHERE id = $10
             RETURNING *`,
            [name, role, major, year, email, linkedin, bio, image_url, status, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Ambassador not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Ambassador updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating ambassador:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating ambassador',
            error: error.message
        });
    }
});

// Delete ambassador
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await query(
            'DELETE FROM ambassadors WHERE id = $1 RETURNING *',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Ambassador not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Ambassador deleted successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error deleting ambassador:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting ambassador',
            error: error.message
        });
    }
});

module.exports = router;