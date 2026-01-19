import mysql from 'mysql2/promise';

// Create database connection
const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  multipleStatements: true
});

async function setupDatabase() {
  try {
    console.log('Setting up database...');
    
    // Create database if not exists
    await connection.execute('CREATE DATABASE IF NOT EXISTS school_management');
    console.log('Database created or already exists');
    
    // Use the database
    await connection.execute('USE school_management');
    
    // Read and execute schema
    const fs = await import('fs');
    const path = await import('path');
    const schema = fs.readFileSync(path.join(process.cwd(), 'database', 'schema.sql'), 'utf8');
    
    await connection.execute(schema);
    console.log('Database schema executed successfully');
    
    await connection.end();
    console.log('Database setup completed!');
    
  } catch (error) {
    console.error('Database setup failed:', error);
    await connection.end();
  }
}

setupDatabase();
