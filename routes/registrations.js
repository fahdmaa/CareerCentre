const express = require('express');
const router = express.Router();
const { query } = require('../database/db');

// Get all registrations
router.get('/', async (req, res) => {
    try {
        const { event_id, status } = req.query;
        let queryText = `
            SELECT r.*, e.title as event_title, e.event_date, e.location
            FROM event_registrations r
            JOIN events e ON r.event_id = e.id
        `;
        const params = [];
        const conditions = [];
        
        if (event_id) {
            conditions.push(`r.event_id = $${params.length + 1}`);
            params.push(event_id);
        }
        
        if (status) {
            conditions.push(`r.status = $${params.length + 1}`);
            params.push(status);
        }
        
        if (conditions.length > 0) {
            queryText += ' WHERE ' + conditions.join(' AND ');
        }
        
        queryText += ' ORDER BY r.registration_date DESC';
        
        const result = await query(queryText, params);
        res.json({
            success: true,
            data: result.rows,
            count: result.rowCount
        });
    } catch (error) {
        console.error('Error fetching registrations:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching registrations',
            error: error.message
        });
    }
});

// Get single registration
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query(
            `SELECT r.*, e.title as event_title, e.event_date, e.location
             FROM event_registrations r
             JOIN events e ON r.event_id = e.id
             WHERE r.id = $1`,
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Registration not found'
            });
        }
        
        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching registration:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching registration',
            error: error.message
        });
    }
});

// Create new registration
router.post('/', async (req, res) => {
    try {
        const { 
            event_id,
            student_name,
            student_email,
            student_phone,
            major,
            year,
            notes
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
             WHERE id = $1`,
            [event_id]
        );
        
        if (eventCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
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
             (event_id, student_name, student_email, student_phone, major, year, notes, status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
             RETURNING *`,
            [event_id, student_name, student_email, student_phone, major, year, notes, 'pending']
        );
        
        res.status(201).json({
            success: true,
            message: 'Registration created successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating registration:', error);
        
        // Handle duplicate registration
        if (error.code === '23505') {
            return res.status(400).json({
                success: false,
                message: 'You are already registered for this event'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error creating registration',
            error: error.message
        });
    }
});

// Update registration
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;
        
        const result = await query(
            `UPDATE event_registrations 
             SET status = COALESCE($1, status), 
                 notes = COALESCE($2, notes)
             WHERE id = $3
             RETURNING *`,
            [status, notes, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Registration not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Registration updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating registration:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating registration',
            error: error.message
        });
    }
});

// Delete registration
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await query(
            'DELETE FROM event_registrations WHERE id = $1 RETURNING *',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Registration not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Registration deleted successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error deleting registration:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting registration',
            error: error.message
        });
    }
});

// Bulk update registration status
router.post('/bulk-update', async (req, res) => {
    try {
        const { registration_ids, status } = req.body;
        
        if (!registration_ids || !Array.isArray(registration_ids) || registration_ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid registration IDs'
            });
        }
        
        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }
        
        const placeholders = registration_ids.map((_, index) => `$${index + 2}`).join(',');
        const result = await query(
            `UPDATE event_registrations 
             SET status = $1
             WHERE id IN (${placeholders})
             RETURNING *`,
            [status, ...registration_ids]
        );
        
        res.json({
            success: true,
            message: `${result.rowCount} registrations updated successfully`,
            data: result.rows
        });
    } catch (error) {
        console.error('Error bulk updating registrations:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating registrations',
            error: error.message
        });
    }
});

module.exports = router;