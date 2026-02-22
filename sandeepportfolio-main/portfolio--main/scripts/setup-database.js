const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function setupDatabase() {
  console.log('🔧 Starting database setup...\n');

  try {
    // Create connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
      multipleStatements: true
    });

    console.log('✅ Connected to MySQL');

    // Create database
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log(`✅ Database '${process.env.DB_NAME}' created/verified`);

    // Use database
    await connection.query(`USE ${process.env.DB_NAME}`);

    // Create tables
    console.log('\n📋 Creating tables...');

    // Admin table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admin (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Admin table created');

    // Profile table
    await connection.query(`
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
      )
    `);
    console.log('✅ Profile table created');

    // Projects table
    await connection.query(`
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
      )
    `);
    console.log('✅ Projects table created');

    // Tech stack table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tech_stack (
        id INT PRIMARY KEY AUTO_INCREMENT,
        project_id INT NOT NULL,
        technology VARCHAR(100) NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Tech stack table created');

    // Skills table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS skills (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(50),
        proficiency_level INT DEFAULT 0,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Skills table created');

    // Create indexes
    try {
      await connection.query(`CREATE INDEX idx_project_order ON projects(display_order)`);
    } catch (e) { /* index might already exist */ }
    try {
      await connection.query(`CREATE INDEX idx_tech_project ON tech_stack(project_id)`);
    } catch (e) { /* index might already exist */ }
    try {
      await connection.query(`CREATE INDEX idx_skill_order ON skills(display_order)`);
    } catch (e) { /* index might already exist */ }
    console.log('✅ Indexes created');

    // Insert default data
    console.log('\n📝 Inserting default data...');

    // Hash password for admin
    const passwordHash = await bcrypt.hash('admin123', 10);

    // Check if admin exists
    const [admins] = await connection.query('SELECT * FROM admin WHERE username = ?', ['admin']);
    
    if (admins.length === 0) {
      await connection.query(
        'INSERT INTO admin (username, password_hash, email) VALUES (?, ?, ?)',
        ['admin', passwordHash, 'admin@portfolio.com']
      );
      console.log('✅ Admin user created');
      console.log('   Username: admin');
      console.log('   Password: admin123');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Check if profile exists
    const [profiles] = await connection.query('SELECT * FROM profile');
    
    if (profiles.length === 0) {
      await connection.query(`
        INSERT INTO profile (name, role, professional_identity, bio, email) 
        VALUES (?, ?, ?, ?, ?)
      `, [
        'Your Name',
        'Full Stack Developer',
        'Building scalable web applications',
        'I am a passionate developer with expertise in building modern web applications. I love creating clean, efficient, and user-friendly solutions.',
        'your.email@example.com'
      ]);
      console.log('✅ Default profile created');
    } else {
      console.log('ℹ️  Profile already exists');
    }

    await connection.end();

    console.log('\n🎉 Database setup completed successfully!\n');
    console.log('📌 Next steps:');
    console.log('   1. Start backend: npm run dev');
    console.log('   2. Start frontend: cd client && npm start');
    console.log('   3. Login at: http://localhost:3000/admin/login');
    console.log('   4. Username: admin');
    console.log('   5. Password: admin123\n');

  } catch (error) {
    console.error('\n❌ Error setting up database:', error.message);
    process.exit(1);
  }
}

setupDatabase();
