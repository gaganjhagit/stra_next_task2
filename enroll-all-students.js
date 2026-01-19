import mysql from 'mysql2/promise';

async function enrollAllStudents() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management',
  });

  try {
    const [students] = await conn.query('SELECT id, name, email FROM users WHERE role = "student"');
    const [classes] = await conn.query('SELECT * FROM classes');
    
    console.log(`Found ${students.length} students and ${classes.length} classes`);
    
    // Enroll all students in the first class (or distribute them)
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const classIndex = i % classes.length; // Distribute students across classes
      const selectedClass = classes[classIndex];
      
      // Check if already enrolled
      const [existing] = await conn.execute(
        'SELECT * FROM enrollments WHERE student_id = ? AND class_id = ?',
        [student.id, selectedClass.id]
      );
      
      if (existing.length === 0) {
        await conn.execute(
          'INSERT INTO enrollments (student_id, class_id) VALUES (?, ?)',
          [student.id, selectedClass.id]
        );
        console.log(`✓ Enrolled ${student.name} in ${selectedClass.name}`);
      } else {
        console.log(`- ${student.name} already enrolled in ${selectedClass.name}`);
      }
    }
    
    console.log('\n✅ Enrollment complete!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await conn.end();
  }
}

enrollAllStudents();

