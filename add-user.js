const mysql = require('mysql2/promise');

async function addUser() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management',
  });

  // Password hash for 'password123'
  const passwordHash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

  try {
    await connection.execute(
      'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
      ['test@school.com', passwordHash, 'Test User', 'student']
    );
    console.log('✓ New user added successfully!');
    console.log('Email: test@school.com');
    console.log('Password: password123');
    console.log('Role: student');
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('User already exists');
    } else {
      console.error('Error:', error.message);
    }
  }

  await connection.end();
}

addUser();
