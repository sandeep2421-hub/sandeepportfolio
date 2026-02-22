const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

require('dotenv').config();

// Use SQLite for local development (no setup required)
const dbPath = path.join(__dirname, '..', '..', 'database', 'portfolio.db');

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Create SQLite database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ SQLite connection error:', err.message);
    } else {
        console.log('✅ SQLite database connected successfully');
        initializeTables();
    }
});

// Initialize tables
function initializeTables() {
    db.serialize(() => {
        // Admin table
        db.run(`
            CREATE TABLE IF NOT EXISTS admin (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Profile table
        db.run(`
            CREATE TABLE IF NOT EXISTS profile (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                role TEXT NOT NULL,
                professional_identity TEXT,
                bio TEXT,
                profile_image_url TEXT,
                resume_url TEXT,
                email TEXT,
                github_url TEXT,
                linkedin_url TEXT,
                twitter_url TEXT,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Projects table
        db.run(`
            CREATE TABLE IF NOT EXISTS projects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                short_description TEXT,
                detailed_description TEXT,
                category TEXT,
                image_url TEXT,
                github_link TEXT,
                live_link TEXT,
                video_url TEXT,
                display_order INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Tech stack table
        db.run(`
            CREATE TABLE IF NOT EXISTS tech_stack (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id INTEGER NOT NULL,
                technology TEXT NOT NULL,
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
            )
        `);

        // Skills table
        db.run(`
            CREATE TABLE IF NOT EXISTS skills (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                category TEXT,
                proficiency_level INTEGER DEFAULT 0,
                display_order INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Insert default admin if not exists
        db.get("SELECT id FROM admin LIMIT 1", (err, row) => {
            if (!row) {
                const bcrypt = require('bcryptjs');
                const hash = bcrypt.hashSync('admin123', 10);
                db.run("INSERT INTO admin (username, password_hash, email) VALUES (?, ?, ?)", 
                    ['admin', hash, 'admin@portfolio.com']);
                console.log('✅ Default admin user created (username: admin, password: admin123)');
            }
        });

        // Insert default profile if not exists
        db.get("SELECT id FROM profile LIMIT 1", (err, row) => {
            if (!row) {
                db.run(`INSERT INTO profile (name, role, professional_identity, bio, email) 
                    VALUES (?, ?, ?, ?, ?)`,
                    ['Your Name', 'Full Stack Developer', 'Building scalable web applications', 
                    'I am a passionate developer with expertise in building modern web applications.', 'your.email@example.com']);
                console.log('✅ Default profile created');
            }
        });

        console.log('✅ Database tables initialized');
    });
}

// Wrap SQLite to work like MySQL promise API
const database = {
    query: async (sql, params = []) => {
        return new Promise((resolve, reject) => {
            // Convert SQLite syntax if needed (mostly compatible with MySQL)
            let normalizedSql = sql.replace(/ AUTO_INCREMENT/gi, ' AUTOINCREMENT');
            
            if (normalizedSql.match(/INSERT|UPDATE|DELETE/i)) {
                db.run(normalizedSql, params, function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        // Get the last inserted row for INSERT
                        if (normalizedSql.trim().toUpperCase().startsWith('INSERT')) {
                            db.get("SELECT last_insert_rowid() as id", [], (err, row) => {
                                resolve([{ id: row?.id || this.lastID }, { 
                                    insertId: row?.id || this.lastID,
                                    affectedRows: this.changes 
                                }]);
                            });
                        } else {
                            resolve([{}, { affectedRows: this.changes }]);
                        }
                    }
                });
            } else {
                // SELECT query
                db.all(normalizedSql, params, (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve([rows, { 
                            length: rows.length 
                        }]);
                    }
                });
            }
        });
    },
    isPostgres: false
};

module.exports = database;
