-- SQL script to fix missing columns in database
-- Run this script to add missing columns to existing tables

-- Add missing columns to projects table (if they don't exist)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);

-- Add missing columns to skills table (if they don't exist) 
ALTER TABLE skills ADD COLUMN IF NOT EXISTS category VARCHAR(50);

-- If ALTER TABLE ADD COLUMN IF NOT EXISTS doesn't work in MySQL, use this instead:
-- ALTER TABLE projects ADD COLUMN category VARCHAR(100);
-- ALTER TABLE projects ADD COLUMN image_url VARCHAR(500);
-- ALTER TABLE skills ADD COLUMN category VARCHAR(50);
