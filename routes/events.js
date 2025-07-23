const express = require('express');
const router = express.Router();
const { query } = require('../database/db');

// Get all events
router.get('/', async (req, res) => {
    try {
        const { status, upcoming } = req.query;
        let queryText = 'SELECT * FROM events';
        const params = [];
        
        if (status) {
            queryText += ' WHERE status = $1';
            params.push(status);
        } else if (upcoming === 'true') {
            queryText += ' WHERE event_date >= CURRENT_DATE';
        }
        
        queryText += ' ORDER BY event_date ASC, event_time ASC';
        
        const result = await query(queryText, params);
        res.json({
            success: true,
            data: result.rows,
            count: result.rowCount
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching events',
            error: error.message
        });
    }
});

// Get single event
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query(
            `SELECT e.*, 
                    COUNT(er.id) as registered_count
             FROM events e
             LEFT JOIN event_registrations er ON e.id = er.event_id
             WHERE e.id = $1
             GROUP BY e.id`,
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }
        
        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching event:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching event',
            error: error.message
        });
    }
});

// Create new event
router.post('/', async (req, res) => {
    try {
        const { 
            title, 
            description, 
            event_date, 
            event_time, 
            location, 
            capacity, 
            status,
            image_url 
        } = req.body;
        
        // Validate required fields
        if (!title || !event_date || !event_time || !location) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        
        const result = await query(
            `INSERT INTO events 
             (title, description, event_date, event_time, location, capacity, status, image_url) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
             RETURNING *`,
            [title, description, event_date, event_time, location, capacity || 0, status || 'upcoming', image_url]
        );
        
        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating event',
            error: error.message
        });
    }
});

// Update event
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            title, 
            description, 
            event_date, 
            event_time, 
            location, 
            capacity, 
            status,
            image_url 
        } = req.body;
        
        const result = await query(
            `UPDATE events 
             SET title = $1, description = $2, event_date = $3, event_time = $4, 
                 location = $5, capacity = $6, status = $7, image_url = $8
             WHERE id = $9
             RETURNING *`,
            [title, description, event_date, event_time, location, capacity, status, image_url, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Event updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating event',
            error: error.message
        });
    }
});

// Delete event
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await query(
            'DELETE FROM events WHERE id = $1 RETURNING *',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Event deleted successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting event',
            error: error.message
        });
    }
});

// Get event statistics
router.get('/:id/stats', async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await query(
            `SELECT 
                COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_count,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
                COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_count,
                COUNT(*) as total_registrations
             FROM event_registrations
             WHERE event_id = $1`,
            [id]
        );
        
        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching event stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching event statistics',
            error: error.message
        });
    }
});

module.exports = router;