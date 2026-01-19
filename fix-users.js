const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function fixUsers() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management',
  });

  // Generate proper bcrypt hash for 'password123'
  const hashedPassword = await bcrypt.hash('password123', 10);
  console.log(`Generated hash: ${hashedPassword}`);

  // Delete old test user if exists
  await connection.execute('DELETE FROM users WHERE email = ?', ['test@school.com']);

  // Delete old users and re-add with proper hashes
  await connection.execute('DELETE FROM users');

  const users = [
    { email: 'admin@school.com', name: 'Admin User', role: 'admin' },
    { email: 'teacher1@school.com', name: 'John Teacher', role: 'teacher' },
    { email: 'student1@school.com', name: 'Alice Student', role: 'student' },
    { email: 'test@school.com', name: 'Test User', role: 'student' },
  ];

  for (const user of users) {
    await connection.execute(
      'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
      [user.email, hashedPassword, user.name, user.role]
    );
    console.log(`✓ Added user: ${user.email}`);
  }

  // Verify users were added with correct passwords
  const [rows] = await connection.execute('SELECT email, name, role FROM users');
  console.log('\n✅ Users in database:');
  rows.forEach(u => {
    console.log(`  - ${u.email} (${u.name}) [${u.role}]`);
  });

  await connection.end();
}

fixUsers().catch(console.error);
