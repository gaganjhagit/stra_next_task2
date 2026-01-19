import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

async function testPasswords() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management',
  });

  try {
    const [users] = await connection.query('SELECT email, password, name FROM users');
    
    console.log('Testing password hashes in database:\n');
    
    for (const user of users) {
      const testPassword = 'password123';
      const isValid = await bcrypt.compare(testPassword, user.password);
      
      console.log(`User: ${user.email} (${user.name})`);
      console.log(`  Hash: ${user.password.substring(0, 30)}...`);
      console.log(`  Test "${testPassword}": ${isValid ? '✓ MATCH' : '✗ NO MATCH'}`);
      console.log('');
    }
    
    // Also test generating a new hash
    console.log('Generating new hash for "password123":');
    const newHash = await bcrypt.hash('password123', 10);
    console.log(`  New hash: ${newHash}`);
    const testNew = await bcrypt.compare('password123', newHash);
    console.log(`  Test new hash: ${testNew ? '✓ MATCH' : '✗ NO MATCH'}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

testPasswords();

