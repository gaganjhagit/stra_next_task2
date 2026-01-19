import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import pool from '@/lib/db';

// GET - Get students in a class for attendance
export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');

    if (!classId) {
      return NextResponse.json(
        { error: 'Class ID is required' },
        { status: 400 }
      );
    }

    // Get students enrolled in the class
    const [students] = await pool.execute(
      `SELECT u.id, u.name, u.email
      FROM users u
      JOIN enrollments e ON e.student_id = u.id
      WHERE e.class_id = ?
      ORDER BY u.name`,
      [classId]
    );

    return NextResponse.json(students);
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
