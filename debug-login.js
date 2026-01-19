const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function testLogin() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management',
  });

  const testEmail = 'test@school.com';
  const testPassword = 'password123';

  console.log(`\n🔍 Testing login for: ${testEmail}`);
  console.log(`Password to test: ${testPassword}\n`);

  // Step 1: Get user from database
  const [rows] = await connection.execute(
    'SELECT id, email, password, name, role FROM users WHERE email = ?',
    [testEmail]
  );

  if (rows.length === 0) {
    console.log('❌ User not found in database');
    await connection.end();
    return;
  }

  const user = rows[0];
  console.log(`✓ User found: ${user.name}`);
  console.log(`  Email: ${user.email}`);
  console.log(`  Role: ${user.role}`);
  console.log(`  Stored hash: ${user.password.substring(0, 30)}...`);

  // Step 2: Compare password
  console.log(`\n🔐 Comparing password...`);
  const isValid = await bcrypt.compare(testPassword, user.password);
  console.log(`Password match: ${isValid ? '✓ YES' : '❌ NO'}`);

  if (isValid) {
    console.log('\n✅ Login would be successful!');
  } else {
    console.log('\n❌ Password mismatch!');
  }

  await connection.end();
}

testLogin().catch(console.error);
