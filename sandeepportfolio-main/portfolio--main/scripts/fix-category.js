const db = require('../server/config/database');

async function fixColumns() {
    // Add category column to projects table if it doesn't exist
    try {
        await db.query('ALTER TABLE projects ADD COLUMN category VARCHAR(100)');
        console.log('✅ Added category column to projects table');
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('ℹ️  Category column already exists');
        } else {
            console.error('Error adding category:', error.message);
        }
    }
    
    // Add image_url column to projects table if it doesn't exist
    try {
        await db.query('ALTER TABLE projects ADD COLUMN image_url VARCHAR(500)');
        console.log('✅ Added image_url column to projects table');
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('ℹ️  image_url column already exists');
        } else {
            console.error('Error adding image_url:', error.message);
        }
    }
    
    process.exit(0);
}

fixColumns();
