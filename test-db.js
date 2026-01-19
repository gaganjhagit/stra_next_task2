import pool from './lib/db.js';

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    const connection = await pool.getConnection();
    console.log('Database connected successfully!');
    
    // Test query
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM users');
    console.log('Users count:', rows[0].count);
    
    connection.release();
    console.log('Database test completed successfully!');
  } catch (error) {
    console.error('Database connection failed:', error);
  }
}

testDatabase();
