const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
    console.error('❌ No DATABASE_URL or POSTGRES_URL found in .env');
    process.exit(1);
}

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function setupDatabase() {
    console.log('🚀 Setting up Neon Postgres database...\n');

    try {
        // Read the Postgres schema file
        const schemaPath = path.join(__dirname, '../database/schema-postgres.sql');
        let schema = fs.readFileSync(schemaPath, 'utf8');

        // Generate proper password hash for admin123
        const passwordHash = await bcrypt.hash('admin123', 10);
        
        // Replace the placeholder hash with real one
        schema = schema.replace(/\$2a\$10\$[^\s']+/, passwordHash);

        // Execute schema
        console.log('📝 Creating tables...');
        await pool.query(schema);
        
        console.log('✅ Database setup completed!\n');
        console.log('📋 Default admin credentials:');
        console.log('   Username: admin');
        console.log('   Password: admin123');
        console.log('\n🎉 Your portfolio is ready!');
        console.log('   - Local: http://localhost:3000');
        console.log('   - Production: https://portfolio-rmnh.vercel.app\n');

    } catch (error) {
        console.error('❌ Error setting up database:', error.message);
        console.error(error);
    } finally {
        await pool.end();
    }
}

setupDatabase();
