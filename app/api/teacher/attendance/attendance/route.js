import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import pool from '@/lib/db';

// GET - Get existing attendance for a class and date
export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const subjectId = searchParams.get('subjectId');
    const date = searchParams.get('date');

    if (!classId || !date) {
      return NextResponse.json(
        { error: 'Class ID and date are required' },
        { status: 400 }
      );
    }

    // Get existing attendance records with students enrolled in class
    // If subjectId is provided, filter by it; otherwise get all attendance for the class
    let attendance;
    if (subjectId) {
      [attendance] = await pool.execute(
        `SELECT u.id, u.name, u.email, a.status, a.notes
        FROM users u
        JOIN enrollments e ON e.student_id = u.id
        LEFT JOIN attendance a ON a.student_id = u.id AND a.class_id = ? AND a.subject_id = ? AND a.date = ?
        WHERE e.class_id = ?
        ORDER BY u.name`,
        [classId, subjectId, date, classId]
      );
    } else {
      [attendance] = await pool.execute(
        `SELECT u.id, u.name, u.email, a.status, a.notes
        FROM users u
        JOIN enrollments e ON e.student_id = u.id
        LEFT JOIN attendance a ON a.student_id = u.id AND a.class_id = ? AND a.date = ?
        WHERE e.class_id = ?
        ORDER BY u.name`,
        [classId, date, classId]
      );
    }

    console.log('Attendance records found:', attendance.length);

    // Format the response - set default status to 'present' if no attendance record exists
    const students = attendance.map(student => ({
      id: student.id,
      name: student.name,
      email: student.email,
      status: student.status || 'present',
      notes: student.notes || ''
    }));

    return NextResponse.json(students);
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
