const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateProfile() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    // Update email and add phone to bio
    await connection.query(
      'UPDATE profile SET email = ?, bio = CONCAT(bio, ?) WHERE id = 1',
      ['kotasandeepkumar2006@gmail.com', ' Phone: +91 6281754652']
    );

    console.log('Profile updated successfully');
    await connection.end();
  } catch (error) {
    console.error('Error updating profile:', error);
  }
}

updateProfile();
