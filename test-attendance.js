import pool from './lib/db.js';

async function testAttendanceData() {
  try {
    console.log('Testing attendance data...');
    
    // Test 1: Check if users table has teacher
    const [teachers] = await pool.execute(
      'SELECT id, email, name, role FROM users WHERE role = ?',
      ['teacher']
    );
    console.log('Teachers found:', teachers);
    
    // Test 2: Check if classes table has data
    const [classes] = await pool.execute('SELECT * FROM classes');
    console.log('Classes found:', classes);
    
    // Test 3: Check if timetable table has data
    const [timetable] = await pool.execute('SELECT * FROM timetable');
    console.log('Timetable entries found:', timetable);
    
    // Test 4: Test the actual query
    if (teachers.length > 0) {
      const [teacherClasses] = await pool.execute(
        `SELECT DISTINCT c.id, c.name FROM classes c
        JOIN timetable t ON t.class_id = c.id
        WHERE t.teacher_id = ?`,
        [teachers[0].id]
      );
      console.log('Classes for teacher 1:', teacherClasses);
    }
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testAttendanceData();
