const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local or .env
const dotenv = require('dotenv');
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config(); // Try .env as fallback
}

async function setupDatabase() {
  let connection;

  try {
    // Get database configuration from environment variables
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true, // Allow multiple SQL statements
    };

    console.log('Connecting to MySQL...');
    console.log(`Host: ${dbConfig.host}`);
    console.log(`User: ${dbConfig.user}`);
    if (!dbConfig.password) {
      console.log('⚠️  Warning: No password set. If MySQL requires a password, please set DB_PASSWORD in .env.local');
    }

    // Connect to MySQL (without specifying database)
    connection = await mysql.createConnection(dbConfig);

    console.log('✓ Connected to MySQL server');

    // Read the schema file
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

    console.log('✓ Read schema file');

    // Execute the schema
    console.log('Executing schema...');
    await connection.query(schemaSQL);

    console.log('✓ Database schema executed successfully!');
    console.log('\nDatabase setup complete!');
    console.log('\nDefault login credentials:');
    console.log('  Admin:   admin@school.com / password123');
    console.log('  Teacher: teacher1@school.com / password123');
    console.log('  Student: student1@school.com / password123');

  } catch (error) {
    console.error('✗ Error setting up database:');
    console.error(error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n❌ Access denied. Possible issues:');
      console.error('   1. MySQL password is required - set DB_PASSWORD in .env.local');
      console.error('   2. User does not have permission');
      console.error('   3. Wrong username or password');
      console.error('\n   To fix: Edit .env.local and add your MySQL password:');
      console.error('   DB_PASSWORD=your_mysql_password');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n❌ Could not connect to MySQL.');
      console.error('   Make sure MySQL is running and accessible at ' + dbConfig.host);
    } else {
      console.error('\n❌ Error details:', error.code || 'Unknown error');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✓ Connection closed');
    }
  }
}

// Run the setup
setupDatabase();

