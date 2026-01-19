import pool from './lib/db.js';

async function checkStudentUsers() {
  try {
    console.log('Checking for student users in database...');
    
    // Check if we have any student users
    const [students] = await pool.execute('SELECT * FROM users WHERE role = ?', ['student']);
    console.log('Student users found:', students.length);
    
    if (students.length > 0) {
      students.forEach(student => {
        console.log(`- ID: ${student.id}, Email: ${student.email}, Name: ${student.name}`);
      });
    } else {
      console.log('No student users found. Creating sample student...');
      
      // Create a sample student user
      const hashedPassword = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // password123
      const [result] = await pool.execute(
        'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
        ['student1@school.com', hashedPassword, 'Student One', 'student']
      );
      console.log('Sample student created with ID:', result.insertId);
    }
    
    // Check attendance records
    const [attendance] = await pool.execute('SELECT * FROM attendance LIMIT 5');
    console.log('Attendance records found:', attendance.length);
    
    // Check grades records
    const [grades] = await pool.execute('SELECT * FROM grades LIMIT 5');
    console.log('Grades records found:', grades.length);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkStudentUsers();
