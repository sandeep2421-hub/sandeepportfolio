const bcrypt = require('bcryptjs');

// Generate password hash for 'sanjaiii-portfolio'
const username = 'SANDEEPKUMAR';
const password = 'sandeep@2004';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error generating hash:', err);
    return;
  }
  
  console.log('\n=== Admin User Setup ===\n');
  console.log('Username:', username);
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('\nRun this SQL command in your MySQL database:\n');
  console.log(`USE portfolio_db;`);
  console.log(`INSERT INTO admin (username, password_hash, email) VALUES ('${username}', '${hash}', 'sandeep@portfolio.com');`);
  console.log('\nOr update existing admin:\n');
  console.log(`UPDATE admin SET username = '${username}', password_hash = '${hash}' WHERE id = 1;`);
  console.log('\n========================\n');
});
