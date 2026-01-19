import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import pool from '@/lib/db';

// GET - Get students for a class
export async function GET(request) {
  try {
    console.log('GET /api/teacher/grades/students - Starting...');
    
    const user = await getCurrentUser();
    console.log('Current user:', user);
    
    if (!user || user.role !== 'teacher') {
      console.log('Unauthorized access');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    
    console.log('Class ID:', classId);

    if (!classId) {
      console.log('Class ID is required');
      return NextResponse.json(
        { error: 'Class ID is required' },
        { status: 400 }
      );
    }

    // Verify teacher teaches this class
    const [authCheck] = await pool.execute(
      `SELECT COUNT(*) as count FROM timetable t
      WHERE t.class_id = ? AND t.teacher_id = ?`,
      [classId, user.id]
    );

    console.log('Auth check result:', authCheck[0]);

    if (authCheck[0].count === 0) {
      console.log('Teacher not authorized for this class');
      return NextResponse.json(
        { error: 'You are not authorized to view students for this class' },
        { status: 403 }
      );
    }

    // Get enrolled students
    const [students] = await pool.execute(
      `SELECT u.id, u.name, u.email 
      FROM users u
      JOIN enrollments e ON e.student_id = u.id
      WHERE e.class_id = ?
      ORDER BY u.name`,
      [classId]
    );

    console.log('Students found:', students);

    return NextResponse.json(students);

  } catch (error) {
    console.error('Error in GET /api/teacher/grades/students:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
