const db = require('../server/config/database');

async function updateAdmin() {
    const bcrypt = require('bcryptjs');
    
    const username = 'SANDEEPKUMAR';
    const password = 'sandeep@2004';
    const saltRounds = 10;
    
    const hash = await bcrypt.hash(password, saltRounds);
    
    try {
        // Check if admin exists
        const [admins] = await db.query('SELECT * FROM admin LIMIT 1');
        
        if (admins.length > 0) {
            // Update existing admin
            await db.query(
                'UPDATE admin SET username = ?, password_hash = ? WHERE id = 1',
                [username, hash]
            );
            console.log('Admin updated successfully!');
        } else {
            // Insert new admin
            await db.query(
                'INSERT INTO admin (username, password_hash, email) VALUES (?, ?, ?)',
                [username, hash, 'sandeep@portfolio.com']
            );
            console.log('Admin created successfully!');
        }
        
        // Verify
        const [updatedAdmin] = await db.query('SELECT * FROM admin LIMIT 1');
        console.log('Admin details:', updatedAdmin);
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

updateAdmin();
