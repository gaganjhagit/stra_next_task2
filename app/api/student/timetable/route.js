import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import pool from '@/lib/db';

// GET - Get student's timetable
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get student's classes first
    const [classes] = await pool.execute(
      `SELECT c.id FROM classes c
      JOIN enrollments e ON e.class_id = c.id
      WHERE e.student_id = ?`,
      [user.id]
    );

    let timetable = [];
    if (classes.length > 0) {
      const classIds = classes.map(c => c.id);
      const placeholders = classIds.map(() => '?').join(',');
      
      const [tt] = await pool.execute(
        `SELECT t.day_of_week, t.start_time, t.end_time, t.room, 
                s.name as subject, u.name as teacher
        FROM timetable t
        JOIN subjects s ON t.subject_id = s.id
        JOIN users u ON t.teacher_id = u.id
        WHERE t.class_id IN (${placeholders})
        ORDER BY 
          FIELD(t.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
          t.start_time`,
        classIds
      );
      timetable = tt;
    }

    return NextResponse.json(timetable);
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
