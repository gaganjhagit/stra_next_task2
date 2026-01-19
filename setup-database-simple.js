import mysql from 'mysql2/promise';

// Create database connection
const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: ''
});

async function setupDatabase() {
  try {
    console.log('Setting up database...');
    
    // Create database if not exists
    await connection.execute('CREATE DATABASE IF NOT EXISTS school_management');
    console.log('Database created or already exists');
    
    // Use database
    await connection.execute('USE school_management');
    
    // Create tables one by one
    console.log('Creating users table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role ENUM('student', 'teacher', 'admin') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Creating classes table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS classes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        grade_level INT NOT NULL,
        teacher_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    
    console.log('Creating subjects table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS subjects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        code VARCHAR(20) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Creating enrollments table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS enrollments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        class_id INT NOT NULL,
        enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
        UNIQUE KEY unique_enrollment (student_id, class_id)
      )
    `);
    
    console.log('Creating timetable table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS timetable (
        id INT AUTO_INCREMENT PRIMARY KEY,
        class_id INT NOT NULL,
        subject_id INT NOT NULL,
        teacher_id INT NOT NULL,
        day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        room VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    console.log('Creating grades table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS grades (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        subject_id INT NOT NULL,
        class_id INT NOT NULL,
        teacher_id INT NOT NULL,
        grade DECIMAL(5,2) NOT NULL,
        max_grade DECIMAL(5,2) DEFAULT 100.00,
        grade_type VARCHAR(50) DEFAULT 'assignment',
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    console.log('Creating attendance table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        class_id INT NOT NULL,
        subject_id INT NOT NULL,
        teacher_id INT NOT NULL,
        date DATE NOT NULL,
        status ENUM('present', 'absent', 'late', 'excused') NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_attendance (student_id, class_id, subject_id, date)
      )
    `);
    
    console.log('Inserting sample data...');
    
    // Insert sample users
    await connection.execute(`
      INSERT IGNORE INTO users (email, password, name, role) VALUES
      ('admin@school.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Admin User', 'admin'),
      ('teacher1@school.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'John Teacher', 'teacher'),
      ('student1@school.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Alice Student', 'student')
    `);
    
    // Insert sample classes
    await connection.execute(`
      INSERT IGNORE INTO classes (name, grade_level, teacher_id) VALUES
      ('Grade 10A', 10, (SELECT id FROM users WHERE email = 'teacher1@school.com' LIMIT 1)),
      ('Grade 10B', 10, (SELECT id FROM users WHERE email = 'teacher1@school.com' LIMIT 1))
    `);
    
    // Insert sample subjects
    await connection.execute(`
      INSERT IGNORE INTO subjects (name, code, description) VALUES
      ('Mathematics', 'MATH101', 'Basic Mathematics'),
      ('English', 'ENG101', 'English Language and Literature'),
      ('Science', 'SCI101', 'General Science'),
      ('History', 'HIS101', 'World History')
    `);
    
    // Insert sample enrollments
    await connection.execute(`
      INSERT IGNORE INTO enrollments (student_id, class_id) VALUES
      ((SELECT id FROM users WHERE email = 'student1@school.com' LIMIT 1), 
       (SELECT id FROM classes WHERE name = 'Grade 10A' LIMIT 1))
    `);
    
    // Insert sample timetable
    await connection.execute(`
      INSERT IGNORE INTO timetable (class_id, subject_id, teacher_id, day_of_week, start_time, end_time, room) VALUES
      ((SELECT id FROM classes WHERE name = 'Grade 10A' LIMIT 1),
       (SELECT id FROM subjects WHERE code = 'MATH101' LIMIT 1),
       (SELECT id FROM users WHERE email = 'teacher1@school.com' LIMIT 1),
       'Monday', '09:00:00', '10:00:00', 'Room 101'),
      ((SELECT id FROM classes WHERE name = 'Grade 10A' LIMIT 1),
       (SELECT id FROM subjects WHERE code = 'ENG101' LIMIT 1),
       (SELECT id FROM users WHERE email = 'teacher1@school.com' LIMIT 1),
       'Monday', '10:00:00', '11:00:00', 'Room 102')
    `);
    
    console.log('Database setup completed successfully!');
    
  } catch (error) {
    console.error('Database setup failed:', error);
  } finally {
    await connection.end();
  }
}

setupDatabase();
