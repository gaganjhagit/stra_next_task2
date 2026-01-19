import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import pool from '@/lib/db';

// GET - Get enrollments (all or filtered by class/student)
export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const studentId = searchParams.get('studentId');

    let enrollments;
    
    if (classId) {
      // Get enrollments for a specific class
      [enrollments] = await pool.execute(
        `SELECT e.id, e.student_id, e.class_id, e.enrolled_at,
                u.name as student_name, u.email as student_email,
                c.name as class_name
         FROM enrollments e
         JOIN users u ON e.student_id = u.id
         JOIN classes c ON e.class_id = c.id
         WHERE e.class_id = ?
         ORDER BY u.name`,
        [classId]
      );
    } else if (studentId) {
      // Get enrollments for a specific student
      [enrollments] = await pool.execute(
        `SELECT e.id, e.student_id, e.class_id, e.enrolled_at,
                u.name as student_name, u.email as student_email,
                c.name as class_name
         FROM enrollments e
         JOIN users u ON e.student_id = u.id
         JOIN classes c ON e.class_id = c.id
         WHERE e.student_id = ?
         ORDER BY c.name`,
        [studentId]
      );
    } else {
      // Get all enrollments
      [enrollments] = await pool.execute(
        `SELECT e.id, e.student_id, e.class_id, e.enrolled_at,
                u.name as student_name, u.email as student_email,
                c.name as class_name
         FROM enrollments e
         JOIN users u ON e.student_id = u.id
         JOIN classes c ON e.class_id = c.id
         ORDER BY c.name, u.name`
      );
    }

    return NextResponse.json(enrollments);
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Enroll a student in a class
export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { studentId, classId } = await request.json();

    if (!studentId || !classId) {
      return NextResponse.json(
        { error: 'Student ID and Class ID are required' },
        { status: 400 }
      );
    }

    // Verify student exists and is a student
    const [student] = await pool.execute(
      'SELECT id, role FROM users WHERE id = ? AND role = ?',
      [studentId, 'student']
    );

    if (student.length === 0) {
      return NextResponse.json(
        { error: 'Invalid student ID or user is not a student' },
        { status: 400 }
      );
    }

    // Verify class exists
    const [classCheck] = await pool.execute(
      'SELECT id FROM classes WHERE id = ?',
      [classId]
    );

    if (classCheck.length === 0) {
      return NextResponse.json(
        { error: 'Invalid class ID' },
        { status: 400 }
      );
    }

    // Check if already enrolled
    const [existing] = await pool.execute(
      'SELECT id FROM enrollments WHERE student_id = ? AND class_id = ?',
      [studentId, classId]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Student is already enrolled in this class' },
        { status: 400 }
      );
    }

    // Create enrollment
    const [result] = await pool.execute(
      'INSERT INTO enrollments (student_id, class_id) VALUES (?, ?)',
      [studentId, classId]
    );

    return NextResponse.json({ 
      message: 'Student enrolled successfully',
      id: result.insertId 
    });

  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

