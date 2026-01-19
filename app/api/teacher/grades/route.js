import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import pool from '@/lib/db';

// GET - Get classes and subjects for teacher
export async function GET() {
  try {
    console.log('GET /api/teacher/grades - Starting...');
    
    const user = await getCurrentUser();
    console.log('Current user:', user);
    
    if (!user || user.role !== 'teacher') {
      console.log('Unauthorized access');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Fetching classes for teacher ID:', user.id);

    // Get teacher's classes
    const [classes] = await pool.execute(
      `SELECT DISTINCT c.id, c.name FROM classes c
      JOIN timetable t ON t.class_id = c.id
      WHERE t.teacher_id = ?`,
      [user.id]
    );
    
    console.log('Classes found:', classes);

    // Get all subjects
    const [subjects] = await pool.execute(
      'SELECT id, name, code FROM subjects ORDER BY name'
    );
    
    console.log('Subjects found:', subjects);

    return NextResponse.json({ classes, subjects });
  } catch (error) {
    console.error('Error in GET /api/teacher/grades:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Upload grades
export async function POST(request) {
  try {
    console.log('POST /api/teacher/grades - Starting...');
    
    const user = await getCurrentUser();
    console.log('Current user:', user);
    
    if (!user || user.role !== 'teacher') {
      console.log('Unauthorized access');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { classId, subjectId, grades } = await request.json();
    console.log('Request data:', { classId, subjectId, grades });

    if (!classId || !subjectId || !grades) {
      console.log('Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify teacher teaches this class and subject
    const [authCheck] = await pool.execute(
      `SELECT COUNT(*) as count FROM timetable t
      WHERE t.class_id = ? AND t.subject_id = ? AND t.teacher_id = ?`,
      [classId, subjectId, user.id]
    );

    console.log('Auth check result:', authCheck[0]);

    if (authCheck[0].count === 0) {
      console.log('Teacher not authorized for this class/subject');
      return NextResponse.json(
        { error: 'You are not authorized to grade this class/subject' },
        { status: 403 }
      );
    }

    // Validate grades
    for (const grade of grades) {
      if (!grade.studentId || grade.grade === undefined || grade.grade === null || grade.grade === '') {
        return NextResponse.json(
          { error: 'Invalid grade data. All fields are required.' },
          { status: 400 }
        );
      }
      if (grade.grade < 0 || (grade.maxGrade && grade.grade > grade.maxGrade)) {
        return NextResponse.json(
          { error: `Invalid grade value for student. Grade must be between 0 and ${grade.maxGrade || 100}` },
          { status: 400 }
        );
      }
    }

    // Process each grade
    const results = [];
    for (const grade of grades) {
      try {
        console.log('Processing grade for student:', grade.studentId);
        
        // Check if grade already exists
        const [existingGrade] = await pool.execute(
          `SELECT id FROM grades 
          WHERE student_id = ? AND subject_id = ? AND class_id = ? AND teacher_id = ?`,
          [grade.studentId, subjectId, classId, user.id]
        );

        if (existingGrade.length > 0) {
          // Update existing grade
          await pool.execute(
            `UPDATE grades SET 
              grade = ?, 
              max_grade = ?, 
              grade_type = ?, 
              description = ?,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = ?`,
            [
              grade.grade,
              grade.maxGrade || 100,
              grade.gradeType || 'assignment',
              grade.description || '',
              existingGrade[0].id
            ]
          );
          console.log('Updated existing grade for student:', grade.studentId);
        } else {
          // Insert new grade
          await pool.execute(
            `INSERT INTO grades (student_id, subject_id, class_id, teacher_id, grade, max_grade, grade_type, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              grade.studentId,
              subjectId,
              classId,
              user.id,
              grade.grade,
              grade.maxGrade || 100,
              grade.gradeType || 'assignment',
              grade.description || ''
            ]
          );
          console.log('Inserted new grade for student:', grade.studentId);
        }
        results.push({ studentId: grade.studentId, success: true });
      } catch (error) {
        console.error('Error processing grade for student:', grade.studentId, error);
        results.push({ studentId: grade.studentId, success: false, error: error.message });
      }
    }

    console.log('Grades upload completed. Results:', results);

    return NextResponse.json({ 
      message: 'Grades uploaded successfully',
      results 
    });

  } catch (error) {
    console.error('Error in POST /api/teacher/grades:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
