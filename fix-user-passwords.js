import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

async function fixUserPasswords() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management',
  });

  try {
    console.log('Generating new password hash for "password123"...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    console.log(`New hash: ${hashedPassword}\n`);

    // Update all users with the correct password hash
    const [result] = await connection.execute(
      'UPDATE users SET password = ?',
      [hashedPassword]
    );

    console.log(`✓ Updated ${result.affectedRows} user(s) with new password hash\n`);

    // Verify the update
    const [users] = await connection.query('SELECT email, name, role FROM users');
    console.log('Verifying passwords...\n');
    
    for (const user of users) {
      const [userData] = await connection.execute(
        'SELECT password FROM users WHERE email = ?',
        [user.email]
      );
      
      const isValid = await bcrypt.compare('password123', userData[0].password);
      console.log(`${user.email} (${user.name}): ${isValid ? '✓ Password works!' : '✗ Still broken'}`);
    }

    console.log('\n✅ All user passwords have been fixed!');
    console.log('You can now login with:');
    console.log('  - admin@school.com / password123');
    console.log('  - teacher1@school.com / password123');
    console.log('  - student1@school.com / password123');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

fixUserPasswords();

