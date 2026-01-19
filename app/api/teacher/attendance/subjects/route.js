import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import pool from '@/lib/db';

// GET - Get subjects for a specific class that the teacher teaches
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

    // Get subjects that the teacher teaches for this specific class
    const [subjects] = await pool.execute(
      `SELECT DISTINCT s.id, s.name, s.code
       FROM subjects s
       JOIN timetable t ON t.subject_id = s.id
       WHERE t.teacher_id = ? AND t.class_id = ?
       ORDER BY s.name`,
      [user.id, classId]
    );

    return NextResponse.json(subjects);
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

