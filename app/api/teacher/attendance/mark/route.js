import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import pool from '@/lib/db';

// POST - Mark attendance for students
export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { classId, date, attendance } = await request.json();

    if (!classId || !date || !attendance) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify teacher teaches this class
    const [classCheck] = await pool.execute(
      `SELECT c.id FROM classes c
      JOIN timetable t ON t.class_id = c.id
      WHERE c.id = ? AND t.teacher_id = ?`,
      [classId, user.id]
    );

    if (classCheck.length === 0) {
      return NextResponse.json(
        { error: 'You are not authorized to mark attendance for this class' },
        { status: 403 }
      );
    }

    // Process each student's attendance
    const results = [];
    for (const record of attendance) {
      try {
        await pool.execute(
          `INSERT INTO attendance (student_id, class_id, subject_id, teacher_id, date, status, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE status = VALUES(status), notes = VALUES(notes)`,
          [
            record.studentId,
            classId,
            record.subjectId || 1, // Default subject if not provided
            user.id,
            date,
            record.status,
            record.notes || ''
          ]
        );
        results.push({ studentId: record.studentId, success: true });
      } catch (error) {
        results.push({ studentId: record.studentId, success: false, error: error.message });
      }
    }

    return NextResponse.json({ 
      message: 'Attendance marked successfully',
      results 
    });

  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
