import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import pool from '@/lib/db';

// GET - Get teacher assignments
export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');

    if (teacherId) {
      // Get assignments for specific teacher
      const [assignments] = await pool.execute(
        `SELECT t.id, c.name as class_name, s.name as subject_name, 
                t.day_of_week, t.start_time, t.end_time, t.room
         FROM timetable t
         JOIN classes c ON t.class_id = c.id
         JOIN subjects s ON t.subject_id = s.id
         WHERE t.teacher_id = ?
         ORDER BY t.day_of_week, t.start_time`,
        [teacherId]
      );

      return NextResponse.json({ [teacherId]: assignments });
    } else {
      // Get all assignments grouped by teacher
      const [assignments] = await pool.execute(
        `SELECT t.id, t.teacher_id, c.name as class_name, s.name as subject_name,
                t.day_of_week, t.start_time, t.end_time, t.room
         FROM timetable t
         JOIN classes c ON t.class_id = c.id
         JOIN subjects s ON t.subject_id = s.id
         ORDER BY t.teacher_id, t.day_of_week, t.start_time`
      );

      // Group by teacher_id
      const grouped = {};
      assignments.forEach(assignment => {
        if (!grouped[assignment.teacher_id]) {
          grouped[assignment.teacher_id] = [];
        }
        grouped[assignment.teacher_id].push(assignment);
      });

      return NextResponse.json(grouped);
    }
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Assign class to teacher
export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { teacherId, classId, subjectId, dayOfWeek, startTime, endTime, room } = await request.json();

    if (!teacherId || !classId || !subjectId || !dayOfWeek || !startTime || !endTime) {
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
      [teacherId, dayOfWeek, startTime, startTime, endTime, endTime]
    );

    if (conflicts[0].count > 0) {
      return NextResponse.json(
        { error: 'Time slot conflicts with existing schedule' },
        { status: 409 }
      );
    }

    // Insert timetable entry (this assigns the class to teacher)
    const [result] = await pool.execute(
      `INSERT INTO timetable (class_id, subject_id, teacher_id, day_of_week, start_time, end_time, room)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [classId, subjectId, teacherId, dayOfWeek, startTime, endTime, room || '']
    );

    return NextResponse.json({ 
      message: 'Class assigned successfully',
      id: result.insertId 
    });

  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

