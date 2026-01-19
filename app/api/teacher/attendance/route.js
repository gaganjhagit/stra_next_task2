import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import pool from '@/lib/db';

// GET - Get classes for teacher
export async function GET() {
  try {
    console.log('GET /api/teacher/attendance - Starting...');
    
    const user = await getCurrentUser();
    console.log('Current user:', user);
    
    if (!user || user.role !== 'teacher') {
      console.log('Unauthorized access');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Fetching classes for teacher ID:', user.id);

    const [classes] = await pool.execute(
      `SELECT DISTINCT c.id, c.name FROM classes c
      JOIN timetable t ON t.class_id = c.id
      WHERE t.teacher_id = ?`,
      [user.id]
    );

    console.log('Classes found:', classes);

    return NextResponse.json(classes);
  } catch (error) {
    console.error('Error in GET /api/teacher/attendance:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
