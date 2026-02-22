const express = require('express');
const db = require('../config/database');

const router = express.Router();

// Get profile
router.get('/', async (req, res) => {
    try {
        const [profiles] = await db.query('SELECT * FROM profile LIMIT 1');
        
        if (profiles.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }

        res.json({
            success: true,
            profile: profiles[0]
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get all projects
router.get('/projects', async (req, res) => {
    try {
        const [projects] = await db.query(
            'SELECT * FROM projects ORDER BY display_order ASC, created_at DESC'
        );

        // Get tech stack for each project
        for (let project of projects) {
            const [techStack] = await db.query(
                'SELECT technology FROM tech_stack WHERE project_id = ?',
                [project.id]
            );
            project.tech_stack = techStack.map(t => t.technology);
        }

        res.json({
            success: true,
            projects
        });
    } catch (error) {
        console.error('Get projects error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get single project
router.get('/projects/:id', async (req, res) => {
    try {
        const [projects] = await db.query(
            'SELECT * FROM projects WHERE id = ?',
            [req.params.id]
        );

        if (projects.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        const project = projects[0];

        // Get tech stack
        const [techStack] = await db.query(
            'SELECT technology FROM tech_stack WHERE project_id = ?',
            [project.id]
        );
        project.tech_stack = techStack.map(t => t.technology);

        res.json({
            success: true,
            project
        });
    } catch (error) {
        console.error('Get project error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get all skills
router.get('/skills', async (req, res) => {
    try {
        const [skills] = await db.query(
            'SELECT * FROM skills ORDER BY display_order ASC, created_at DESC'
        );

        res.json({
            success: true,
            skills
        });
    } catch (error) {
        console.error('Get skills error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;
