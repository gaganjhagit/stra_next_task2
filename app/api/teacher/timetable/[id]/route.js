import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import pool from '@/lib/db';

// PUT - Update timetable entry
export async function PUT(
  request, 
  { params } 
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { classId, subjectId, dayOfWeek, startTime, endTime, room } = await request.json();

    if (!classId || !subjectId || !dayOfWeek || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify ownership
    const [ownership] = await pool.execute(
      'SELECT teacher_id FROM timetable WHERE id = ?',
      [id]
    );

    if (ownership.length === 0 || ownership[0].teacher_id !== user.id) {
      return NextResponse.json(
        { error: 'Timetable entry not found or unauthorized' },
        { status: 404 }
      );
    }

    // Check for conflicts (excluding current entry)
    const [conflicts] = await pool.execute(
      `SELECT COUNT(*) as count FROM timetable
      WHERE teacher_id = ? AND day_of_week = ? AND id != ? AND
            ((start_time <= ? AND end_time > ?) OR 
             (start_time < ? AND end_time >= ?))`,
      [user.id, dayOfWeek, id, startTime, startTime, endTime, endTime]
    );

    if (conflicts[0].count > 0) {
      return NextResponse.json(
        { error: 'Time slot conflicts with existing schedule' },
        { status: 409 }
      );
    }

    // Update timetable entry
    await pool.execute(
      `UPDATE timetable 
      SET class_id = ?, subject_id = ?, day_of_week = ?, start_time = ?, end_time = ?, room = ?
      WHERE id = ? AND teacher_id = ?`,
      [classId, subjectId, dayOfWeek, startTime, endTime, room || '', id, user.id]
    );

    return NextResponse.json({ message: 'Timetable entry updated successfully' });

  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete timetable entry
export async function DELETE(
  request, 
  { params } 
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Verify ownership and delete
    const [result] = await pool.execute(
      'DELETE FROM timetable WHERE id = ? AND teacher_id = ?',
      [id, user.id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Timetable entry not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Timetable entry deleted successfully' });

  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
