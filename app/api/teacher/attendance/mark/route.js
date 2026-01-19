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

    if (!classId || !date || !attendance || !Array.isArray(attendance) || attendance.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: classId, date, and attendance array' },
        { status: 400 }
      );
    }

    // Get subjectId from first attendance record (all should have same subject)
    const subjectId = attendance[0]?.subjectId;
    if (!subjectId) {
      return NextResponse.json(
        { error: 'Subject ID is required in attendance data' },
        { status: 400 }
      );
    }

    // Verify teacher teaches this class and subject
    const [classCheck] = await pool.execute(
      `SELECT c.id FROM classes c
      JOIN timetable t ON t.class_id = c.id
      WHERE c.id = ? AND t.subject_id = ? AND t.teacher_id = ?`,
      [classId, subjectId, user.id]
    );

    if (classCheck.length === 0) {
      return NextResponse.json(
        { error: 'You are not authorized to mark attendance for this class/subject combination' },
        { status: 403 }
      );
    }

    // Process each student's attendance
    const results = [];
    for (const record of attendance) {
      try {
        // Validate record
        if (!record.studentId || !record.status) {
          results.push({ studentId: record.studentId, success: false, error: 'Missing studentId or status' });
          continue;
        }

        // Use subjectId from record, fallback to the one from first record
        const recordSubjectId = record.subjectId || subjectId;

        await pool.execute(
          `INSERT INTO attendance (student_id, class_id, subject_id, teacher_id, date, status, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE status = VALUES(status), notes = VALUES(notes), updated_at = CURRENT_TIMESTAMP`,
          [
            record.studentId,
            classId,
            recordSubjectId,
            user.id,
            date,
            record.status,
            record.notes || ''
          ]
        );
        results.push({ studentId: record.studentId, success: true });
      } catch (error) {
        console.error('Error processing attendance for student:', record.studentId, error);
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
