const express = require('express');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Configure multer for memory storage (Cloudinary will handle the actual storage)
const storage = multer.memoryStorage();

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(file.originalname.split('.').pop().toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// Configure multer for resume uploads (PDF only)
const resumeUpload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for PDFs
    fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf/;
        const extname = allowedTypes.test(file.originalname.split('.').pop().toLowerCase());
        const mimetype = file.mimetype === 'application/pdf';
        
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed!'));
        }
    }
});

// All routes require authentication
router.use(authMiddleware);

// Upload image to Cloudinary
router.post('/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        // Upload to Cloudinary using upload_stream
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'portfolio/images' },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    return res.status(500).json({ success: false, message: 'Error uploading to Cloudinary' });
                }
                
                res.json({ 
                    success: true, 
                    url: result.secure_url,
                    message: 'File uploaded successfully' 
                });
            }
        );

        // Pipe the file buffer to Cloudinary
        const streamifier = require('streamifier');
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ success: false, message: 'Error uploading file' });
    }
});

// Upload resume to Cloudinary
router.post('/upload-resume', resumeUpload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        // Upload PDF to Cloudinary
        const uploadStream = cloudinary.uploader.upload_stream(
            { 
                folder: 'portfolio/resumes',
                resource_type: 'raw' // Important for PDFs
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary resume upload error:', error);
                    return res.status(500).json({ success: false, message: 'Error uploading resume to Cloudinary' });
                }
                
                res.json({ 
                    success: true, 
                    url: result.secure_url,
                    message: 'Resume uploaded successfully' 
                });
            }
        );

        // Pipe the file buffer to Cloudinary
        const streamifier = require('streamifier');
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);

    } catch (error) {
        console.error('Resume upload error:', error);
        res.status(500).json({ success: false, message: 'Error uploading resume' });
    }
});

// ==================== PROFILE ROUTES ====================

// Update profile
router.put('/profile', async (req, res) => {
    try {
        const { name, role, professional_identity, bio, profile_image_url, resume_url, email, github_url, linkedin_url, twitter_url } = req.body;

        // Check if profile exists (works for both MySQL and SQLite)
        const [existing] = await db.query('SELECT id FROM profile WHERE id = 1');
        
        if (existing && existing.length > 0) {
            // Profile exists, update it
            if (db.isPostgres) {
                await db.query(
                    `UPDATE profile SET 
                        name = $1, 
                        role = $2, 
                        professional_identity = $3, 
                        bio = $4, 
                        profile_image_url = $5, 
                        resume_url = $6, 
                        email = $7, 
                        github_url = $8, 
                        linkedin_url = $9, 
                        twitter_url = $10,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = 1`,
                    [name, role, professional_identity, bio, profile_image_url, resume_url, email, github_url, linkedin_url, twitter_url]
                );
            } else {
                // SQLite/MySQL using standard UPDATE
                await db.query(
                    `UPDATE profile SET 
                        name = ?, 
                        role = ?, 
                        professional_identity = ?, 
                        bio = ?, 
                        profile_image_url = ?, 
                        resume_url = ?, 
                        email = ?, 
                        github_url = ?, 
                        linkedin_url = ?, 
                        twitter_url = ?,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = 1`,
                    [name, role, professional_identity, bio, profile_image_url, resume_url, email, github_url, linkedin_url, twitter_url]
                );
            }
        } else {
            // Profile doesn't exist, insert it
            if (db.isPostgres) {
                await db.query(
                    `INSERT INTO profile (id, name, role, professional_identity, bio, profile_image_url, resume_url, email, github_url, linkedin_url, twitter_url)
                    VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                    [name, role, professional_identity, bio, profile_image_url, resume_url, email, github_url, linkedin_url, twitter_url]
                );
            } else {
                await db.query(
                    `INSERT INTO profile (id, name, role, professional_identity, bio, profile_image_url, resume_url, email, github_url, linkedin_url, twitter_url)
                    VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [name, role, professional_identity, bio, profile_image_url, resume_url, email, github_url, linkedin_url, twitter_url]
                );
            }
        }

        res.json({
            success: true,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// ==================== PROJECT ROUTES ====================

// Create project
router.post('/projects', async (req, res) => {
    try {
        const { title, short_description, detailed_description, category, image_url, github_link, live_link, video_url, tech_stack, display_order } = req.body;

        let projectId;

        if (db.isPostgres) {
            // Postgres: Use $1, $2 placeholders directly
            const [rows, metadata] = await db.query(
                `INSERT INTO projects (title, short_description, detailed_description, category, image_url, github_link, live_link, video_url, display_order) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
                [title, short_description, detailed_description, category, image_url, github_link, live_link, video_url, display_order || 0]
            );
            projectId = rows[0]?.id;
        } else {
            // MySQL: Use ? placeholders
            const [rows, metadata] = await db.query(
                `INSERT INTO projects (title, short_description, detailed_description, category, image_url, github_link, live_link, video_url, display_order) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [title, short_description, detailed_description, category, image_url, github_link, live_link, video_url, display_order || 0]
            );
            projectId = metadata?.insertId;
        }

        // Add tech stack
        if (tech_stack && tech_stack.length > 0) {
            for (let tech of tech_stack) {
                if (db.isPostgres) {
                    await db.query(
                        'INSERT INTO tech_stack (project_id, technology) VALUES ($1, $2)',
                        [projectId, tech]
                    );
                } else {
                    await db.query(
                        'INSERT INTO tech_stack (project_id, technology) VALUES (?, ?)',
                        [projectId, tech]
                    );
                }
            }
        }

        res.json({
            success: true,
            message: 'Project created successfully',
            projectId
        });
    } catch (error) {
        console.error('Create project error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error: ' + error.message
        });
    }
});

// Update project
router.put('/projects/:id', async (req, res) => {
    try {
        const { title, short_description, detailed_description, category, image_url, github_link, live_link, video_url, tech_stack, display_order } = req.body;
        const projectId = req.params.id;

        // Update main project details - use $ placeholders for Postgres
        if (db.isPostgres) {
            await db.query(
                `UPDATE projects SET 
                    title = $1, 
                    short_description = $2, 
                    detailed_description = $3, 
                    category = $4,
                    image_url = $5,
                    github_link = $6, 
                    live_link = $7, 
                    video_url = $8,
                    display_order = $9,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $10`,
                [title, short_description, detailed_description, category, image_url, github_link, live_link, video_url, display_order || 0, projectId]
            );
        } else {
            await db.query(
                `UPDATE projects SET 
                    title = ?, 
                    short_description = ?, 
                    detailed_description = ?, 
                    category = ?,
                    image_url = ?,
                    github_link = ?, 
                    live_link = ?, 
                    video_url = ?,
                    display_order = ?
                WHERE id = ?`,
                [title, short_description, detailed_description, category, image_url, github_link, live_link, video_url, display_order || 0, projectId]
            );
        }

        // Update tech stack - delete old and insert new
        try {
            if (db.isPostgres) {
                await db.query('DELETE FROM tech_stack WHERE project_id = $1', [projectId]);
            } else {
                await db.query('DELETE FROM tech_stack WHERE project_id = ?', [projectId]);
            }
            console.log('Tech stack deleted for project:', projectId);
        } catch (delError) {
            console.error('Error deleting tech stack:', delError);
            throw delError;
        }
        
        if (tech_stack && tech_stack.length > 0) {
            for (let tech of tech_stack) {
                try {
                    if (db.isPostgres) {
                        await db.query(
                            'INSERT INTO tech_stack (project_id, technology) VALUES ($1, $2)',
                            [projectId, tech]
                        );
                    } else {
                        await db.query(
                            'INSERT INTO tech_stack (project_id, technology) VALUES (?, ?)',
                            [projectId, tech]
                        );
                    }
                } catch (insertError) {
                    console.error('Error inserting tech:', tech, insertError);
                    throw insertError;
                }
            }
        }

        res.json({
            success: true,
            message: 'Project updated successfully'
        });
    } catch (error) {
        console.error('Update project error:', error.message, error);
        res.status(500).json({
            success: false,
            message: 'Server error: ' + error.message
        });
    }
});

// Delete project
router.delete('/projects/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM projects WHERE id = ?', [req.params.id]);

        res.json({
            success: true,
            message: 'Project deleted successfully'
        });
    } catch (error) {
        console.error('Delete project error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// ==================== SKILL ROUTES ====================

// Create skill
router.post('/skills', async (req, res) => {
    try {
        const { name, proficiency_level, display_order } = req.body;

        if (db.isPostgres) {
            await db.query(
                'INSERT INTO skills (name, proficiency_level, display_order) VALUES ($1, $2, $3)',
                [name, proficiency_level || 0, display_order || 0]
            );
        } else {
            await db.query(
                'INSERT INTO skills (name, proficiency_level, display_order) VALUES (?, ?, ?)',
                [name, proficiency_level || 0, display_order || 0]
            );
        }

        res.json({
            success: true,
            message: 'Skill added successfully'
        });
    } catch (error) {
        console.error('Create skill error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error: ' + error.message
        });
    }
});

// Update skill
router.put('/skills/:id', async (req, res) => {
    try {
        const { name, proficiency_level, display_order } = req.body;
        const skillId = req.params.id;

        if (db.isPostgres) {
            await db.query(
                'UPDATE skills SET name = $1, proficiency_level = $2, display_order = $3 WHERE id = $4',
                [name, proficiency_level || 0, display_order || 0, skillId]
            );
        } else {
            await db.query(
                'UPDATE skills SET name = ?, proficiency_level = ?, display_order = ? WHERE id = ?',
                [name, proficiency_level || 0, display_order || 0, skillId]
            );
        }

        res.json({
            success: true,
            message: 'Skill updated successfully'
        });
    } catch (error) {
        console.error('Update skill error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error: ' + error.message
        });
    }
});

// Delete skill
router.delete('/skills/:id', async (req, res) => {
    try {
        if (db.isPostgres) {
            await db.query('DELETE FROM skills WHERE id = $1', [req.params.id]);
        } else {
            await db.query('DELETE FROM skills WHERE id = ?', [req.params.id]);
        }

        res.json({
            success: true,
            message: 'Skill deleted successfully'
        });
    } catch (error) {
        console.error('Delete skill error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error: ' + error.message
        });
    }
});

module.exports = router;
