import mysql from 'mysql2/promise';

async function checkEnrollments() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management',
  });

  try {
    const [enrollments] = await conn.query('SELECT * FROM enrollments');
    console.log('Enrollments:', enrollments);
    
    const [students] = await conn.query('SELECT id, name, email, role FROM users WHERE role = "student"');
    console.log('\nStudents:', students);
    
    const [classes] = await conn.query('SELECT * FROM classes');
    console.log('\nClasses:', classes);
    
    // Check if students are enrolled
    if (enrollments.length === 0 && students.length > 0 && classes.length > 0) {
      console.log('\n⚠️  No enrollments found! Enrolling students...');
      
      // Enroll first student in first class
      if (students.length > 0 && classes.length > 0) {
        await conn.execute(
          'INSERT INTO enrollments (student_id, class_id) VALUES (?, ?)',
          [students[0].id, classes[0].id]
        );
        console.log(`✓ Enrolled ${students[0].name} in ${classes[0].name}`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await conn.end();
  }
}

checkEnrollments();

