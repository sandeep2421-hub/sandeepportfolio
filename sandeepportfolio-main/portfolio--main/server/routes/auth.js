const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const router = express.Router();

// Admin login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        // Demo mode: if database is not available, allow demo login
        // Only enable demo mode if DEMO_MODE is set or DB_HOST is explicitly set to 'demo'
        if (process.env.DEMO_MODE === 'true' || process.env.DB_HOST === 'demo') {
            // Demo credentials
            if (username === 'admin' && password === 'admin123') {
                const token = jwt.sign(
                    { id: 1, username: 'admin' },
                    process.env.JWT_SECRET || 'demo-secret',
                    { expiresIn: '24h' }
                );

                return res.json({
                    success: true,
                    message: 'Login successful (Demo Mode - Set up database for full functionality)',
                    token,
                    admin: {
                        id: 1,
                        username: 'admin',
                        email: 'demo@example.com'
                    }
                });
            } else {
                return res.status(401).json({
                    success: false,
                    message: 'Demo mode: Use username "admin" and password "admin123"'
                });
            }
        }

        // Get admin from database
        const [admins] = await db.query(
            'SELECT * FROM admin WHERE username = ?',
            [username]
        );

        if (admins.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const admin = admins[0];

        // Verify password
        const isValidPassword = await bcrypt.compare(password, admin.password_hash);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: admin.id, username: admin.username },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
            admin: {
                id: admin.id,
                username: admin.username,
                email: admin.email
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

// Verify token (check if still valid)
router.get('/verify', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ success: true, admin: { id: decoded.id, username: decoded.username } });
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
});

module.exports = router;
