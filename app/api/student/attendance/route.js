import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import pool from '@/lib/db';

// GET - Get attendance records for a student
export async function GET() {
  try {
    console.log('GET /api/student/attendance - Starting...');
    
    const user = await getCurrentUser();
    console.log('Current user:', user);
    
    if (!user || user.role !== 'student') {
      console.log('Unauthorized access');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Fetching attendance for student ID:', user.id);

    const [records] = await pool.execute(
      `SELECT a.date, a.status, a.notes, c.name as class_name, s.name as subject_name
      FROM attendance a
      JOIN classes c ON c.id = a.class_id
      JOIN subjects s ON s.id = a.subject_id
      WHERE a.student_id = ? 
      ORDER BY a.date DESC 
      LIMIT 100`,
      [user.id]
    );

    console.log('Attendance records found:', records);

    return NextResponse.json(records);
  } catch (error) {
    console.error('Error in GET /api/student/attendance:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
