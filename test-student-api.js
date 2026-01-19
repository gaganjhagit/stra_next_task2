import pool from './lib/db.js';

async function testStudentAPI() {
  try {
    console.log('Testing student attendance API...');
    
    // Test if we can connect to database
    const [users] = await pool.execute('SELECT * FROM users WHERE role = ?', ['student']);
    console.log('Students in database:', users);
    
    // Test if we have attendance records
    if (users.length > 0) {
      const [attendance] = await pool.execute(
        `SELECT a.date, a.status, a.notes, c.name as class_name, s.name as subject_name
        FROM attendance a
        JOIN classes c ON c.id = a.class_id
        JOIN subjects s ON s.id = a.subject_id
        WHERE a.student_id = ? 
        ORDER BY a.date DESC 
        LIMIT 100`,
        [users[0].id]
      );
      console.log('Attendance records for student:', attendance);
    }
    
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testStudentAPI();
