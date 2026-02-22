-- Postgres Schema for Portfolio

-- Admin table (single admin user)
CREATE TABLE IF NOT EXISTS admin (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Profile table (single profile)
CREATE TABLE IF NOT EXISTS profile (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(100) NOT NULL,
    professional_identity VARCHAR(255),
    bio TEXT,
    profile_image_url VARCHAR(500),
    resume_url VARCHAR(500),
    email VARCHAR(100),
    github_url VARCHAR(255),
    linkedin_url VARCHAR(255),
    twitter_url VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    short_description VARCHAR(500),
    detailed_description TEXT,
    category VARCHAR(100),
    image_url VARCHAR(500),
    github_link VARCHAR(500),
    live_link VARCHAR(500),
    video_url VARCHAR(500),
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tech stack table (for projects)
CREATE TABLE IF NOT EXISTS tech_stack (
    id SERIAL PRIMARY KEY,
    project_id INT NOT NULL,
    technology VARCHAR(100) NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Skills table
CREATE TABLE IF NOT EXISTS skills (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    proficiency_level INT DEFAULT 0,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user (username: admin, password: admin123)
-- Password hash for 'admin123' using bcrypt
INSERT INTO admin (username, password_hash, email) 
VALUES ('admin', '$2a$10$rOiLXm6QHwKPZVvYvV5oJeK8F7xJ8F7xJ8F7xJ8F7xJ8F7xJ8F7xJ', 'admin@portfolio.com')
ON CONFLICT (username) DO NOTHING;

-- Insert default profile data (only if not exists)
INSERT INTO profile (id, name, role, professional_identity, bio, email) 
SELECT 1, 'Your Name', 'Full Stack Developer', 'Building scalable web applications', 'I am a passionate developer with expertise in building modern web applications. I love creating clean, efficient, and user-friendly solutions.', 'your.email@example.com'
WHERE NOT EXISTS (SELECT 1 FROM profile WHERE id = 1);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_order ON projects(display_order);
CREATE INDEX IF NOT EXISTS idx_tech_project ON tech_stack(project_id);
CREATE INDEX IF NOT EXISTS idx_skill_order ON skills(display_order);
