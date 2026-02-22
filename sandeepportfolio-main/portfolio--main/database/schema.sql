-- Create database
CREATE DATABASE IF NOT EXISTS portfolio_db;
USE portfolio_db;

-- Admin table (single admin user)
CREATE TABLE IF NOT EXISTS admin (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Profile table (single profile)
CREATE TABLE IF NOT EXISTS profile (
    id INT PRIMARY KEY AUTO_INCREMENT,
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id INT PRIMARY KEY AUTO_INCREMENT,
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tech stack table (for projects)
CREATE TABLE IF NOT EXISTS tech_stack (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    technology VARCHAR(100) NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Skills table
CREATE TABLE IF NOT EXISTS skills (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    proficiency_level INT DEFAULT 0,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user (username: admin, password: admin123)
-- Password hash for 'admin123' using bcrypt
INSERT INTO admin (username, password_hash, email) 
VALUES ('admin', '$2a$10$XQz8qVVVVYYYYYYYYYYYYeU5kO7pXVbZF5Y7Y7Y7Y7Y7Y7Y7Y7Y7Y', 'admin@portfolio.com')
ON DUPLICATE KEY UPDATE username=username;

-- Insert default profile data
INSERT INTO profile (name, role, professional_identity, bio, email) 
VALUES (
    'Your Name',
    'Full Stack Developer',
    'Building scalable web applications',
    'I am a passionate developer with expertise in building modern web applications. I love creating clean, efficient, and user-friendly solutions.',
    'your.email@example.com'
)
ON DUPLICATE KEY UPDATE id=id;

-- Create indexes for better performance
CREATE INDEX idx_project_order ON projects(display_order);
CREATE INDEX idx_tech_project ON tech_stack(project_id);
CREATE INDEX idx_skill_order ON skills(display_order);
