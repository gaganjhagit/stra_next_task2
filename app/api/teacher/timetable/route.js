import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import pool from '@/lib/db';

// GET - Get teacher's timetable
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [timetable] = await pool.execute(
      `SELECT t.id, t.day_of_week, t.start_time, t.end_time, t.room, 
              s.name as subject_name, s.id as subject_id,
              c.name as class_name, c.id as class_id
      FROM timetable t
      JOIN subjects s ON t.subject_id = s.id
      JOIN classes c ON t.class_id = c.id
      WHERE t.teacher_id = ?
      ORDER BY 
        FIELD(t.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
        t.start_time`,
      [user.id]
    );

    return NextResponse.json(timetable);
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Add new timetable entry
export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { classId, subjectId, dayOfWeek, startTime, endTime, room } = await request.json();

    if (!classId || !subjectId || !dayOfWeek || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate time
    if (startTime >= endTime) {
      return NextResponse.json(
        { error: 'End time must be after start time' },
        { status: 400 }
      );
    }

    // Check for conflicts
    const [conflicts] = await pool.execute(
      `SELECT COUNT(*) as count FROM timetable
      WHERE teacher_id = ? AND day_of_week = ? AND 
            ((start_time <= ? AND end_time > ?) OR 
             (start_time < ? AND end_time >= ?))`,
      [user.id, dayOfWeek, startTime, startTime, endTime, endTime]
    );

    if (conflicts[0].count > 0) {
      return NextResponse.json(
        { error: 'Time slot conflicts with existing schedule. Please choose a different time.' },
        { status: 409 }
      );
    }

    // Insert new timetable entry
    const [result] = await pool.execute(
      `INSERT INTO timetable (class_id, subject_id, teacher_id, day_of_week, start_time, end_time, room)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [classId, subjectId, user.id, dayOfWeek, startTime, endTime, room || '']
    );

    return NextResponse.json({ 
      message: 'Timetable entry added successfully',
      id: result.insertId 
    });

  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
