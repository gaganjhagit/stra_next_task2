import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import pool from '@/lib/db';

// GET - Get all classes
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [classes] = await pool.execute(
      `SELECT c.id, c.name, c.grade_level, c.teacher_id, 
              u.name as teacher_name, u.email as teacher_email,
              COUNT(DISTINCT e.student_id) as student_count
       FROM classes c
       LEFT JOIN users u ON c.teacher_id = u.id
       LEFT JOIN enrollments e ON c.id = e.class_id
       GROUP BY c.id, c.name, c.grade_level, c.teacher_id, u.name, u.email
       ORDER BY c.grade_level, c.name`
    );

    return NextResponse.json(classes);
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new class
export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, grade_level, teacher_id } = await request.json();

    if (!name || !grade_level) {
      return NextResponse.json(
        { error: 'Name and grade level are required' },
        { status: 400 }
      );
    }

    // Validate grade level
    const gradeLevel = parseInt(grade_level);
    if (isNaN(gradeLevel) || gradeLevel < 1 || gradeLevel > 12) {
      return NextResponse.json(
        { error: 'Grade level must be between 1 and 12' },
        { status: 400 }
      );
    }

    // Check if class name already exists
    const [existing] = await pool.execute(
      'SELECT id FROM classes WHERE name = ?',
      [name]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Class name already exists' },
        { status: 400 }
      );
    }

    // Validate teacher_id if provided
    if (teacher_id) {
      const [teacher] = await pool.execute(
        'SELECT id, role FROM users WHERE id = ? AND role = ?',
        [teacher_id, 'teacher']
      );

      if (teacher.length === 0) {
        return NextResponse.json(
          { error: 'Invalid teacher ID' },
          { status: 400 }
        );
      }
    }

    // Insert new class
    const [result] = await pool.execute(
      'INSERT INTO classes (name, grade_level, teacher_id) VALUES (?, ?, ?)',
      [name, gradeLevel, teacher_id || null]
    );

    return NextResponse.json({ 
      message: 'Class created successfully',
      id: result.insertId 
    });

  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

