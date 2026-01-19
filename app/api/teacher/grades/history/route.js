import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import pool from '@/lib/db';

// GET - Get grade history for a class and subject
export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const subjectId = searchParams.get('subjectId');

    if (!classId || !subjectId) {
      return NextResponse.json(
        { error: 'Class ID and Subject ID are required' },
        { status: 400 }
      );
    }

    // Verify teacher teaches this class and subject
    const [authCheck] = await pool.execute(
      `SELECT COUNT(*) as count FROM timetable t
      WHERE t.class_id = ? AND t.subject_id = ? AND t.teacher_id = ?`,
      [classId, subjectId, user.id]
    );

    if (authCheck[0].count === 0) {
      return NextResponse.json(
        { error: 'You are not authorized to view grades for this class/subject' },
        { status: 403 }
      );
    }

    // Get grade history
    const [grades] = await pool.execute(
      `SELECT g.id, g.grade, g.max_grade, g.grade_type, g.description, g.created_at,
              u.name as student_name
      FROM grades g
      JOIN users u ON g.student_id = u.id
      WHERE g.class_id = ? AND g.subject_id = ? AND g.teacher_id = ?
      ORDER BY g.created_at DESC`,
      [classId, subjectId, user.id]
    );

    return NextResponse.json(grades);

  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
