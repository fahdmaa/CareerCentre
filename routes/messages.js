const express = require('express');
const router = express.Router();
const { query } = require('../database/db');

// Get all messages
router.get('/', async (req, res) => {
    try {
        const { status } = req.query;
        let queryText = 'SELECT * FROM messages';
        const params = [];
        
        if (status) {
            queryText += ' WHERE status = $1';
            params.push(status);
        }
        
        queryText += ' ORDER BY created_at DESC';
        
        const result = await query(queryText, params);
        res.json({
            success: true,
            data: result.rows,
            count: result.rowCount
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching messages',
            error: error.message
        });
    }
});

// Get single message
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query(
            'SELECT * FROM messages WHERE id = $1',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }
        
        // Mark as read
        await query(
            'UPDATE messages SET status = $1 WHERE id = $2',
            ['read', id]
        );
        
        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching message:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching message',
            error: error.message
        });
    }
});

// Create new message (for contact form)
router.post('/', async (req, res) => {
    try {
        const { sender_name, sender_email, subject, message } = req.body;
        
        // Validate required fields
        if (!sender_name || !sender_email || !message) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        
        const result = await query(
            `INSERT INTO messages (sender_name, sender_email, subject, message) 
             VALUES ($1, $2, $3, $4) 
             RETURNING *`,
            [sender_name, sender_email, subject, message]
        );
        
        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating message:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending message',
            error: error.message
        });
    }
});

// Update message status
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const result = await query(
            'UPDATE messages SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Message updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating message:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating message',
            error: error.message
        });
    }
});

// Delete message
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await query(
            'DELETE FROM messages WHERE id = $1 RETURNING *',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Message deleted successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting message',
            error: error.message
        });
    }
});

// Get message statistics
router.get('/stats/overview', async (req, res) => {
    try {
        const result = await query(
            `SELECT 
                COUNT(CASE WHEN status = 'unread' THEN 1 END) as unread_count,
                COUNT(CASE WHEN status = 'read' THEN 1 END) as read_count,
                COUNT(*) as total_messages
             FROM messages`
        );
        
        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching message stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching message statistics',
            error: error.message
        });
    }
});

module.exports = router;