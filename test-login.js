const mysql = require('mysql2/promise');

async function testLogin() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management',
  });

  const [rows] = await connection.execute(
    'SELECT id, email, name, role, password FROM users'
  );

  console.log('Users in database:');
  rows.forEach(user => {
    console.log(`  Email: ${user.email}, Name: ${user.name}, Role: ${user.role}`);
  });

  await connection.end();
}

testLogin().catch(console.error);
