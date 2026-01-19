import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import pool from '@/lib/db';

// PUT - Update a class
export async function PUT(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Handle params - could be Promise in Next.js 15+ or direct object
    let resolvedParams = params;
    if (params instanceof Promise) {
      resolvedParams = await params;
    }
    
    const { id } = resolvedParams;
    const classId = parseInt(id);
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

    // Check if class exists
    const [existing] = await pool.execute(
      'SELECT id FROM classes WHERE id = ?',
      [classId]
    );

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      );
    }

    // Check if class name already exists for another class
    const [nameCheck] = await pool.execute(
      'SELECT id FROM classes WHERE name = ? AND id != ?',
      [name, classId]
    );

    if (nameCheck.length > 0) {
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

    // Update class
    await pool.execute(
      'UPDATE classes SET name = ?, grade_level = ?, teacher_id = ? WHERE id = ?',
      [name, gradeLevel, teacher_id || null, classId]
    );

    return NextResponse.json({ message: 'Class updated successfully' });

  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a class
export async function DELETE(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Handle params - could be Promise in Next.js 15+ or direct object
    let resolvedParams = params;
    if (params instanceof Promise) {
      resolvedParams = await params;
    }
    
    const { id } = resolvedParams;
    const classId = parseInt(id);

    if (isNaN(classId)) {
      return NextResponse.json(
        { error: 'Invalid class ID' },
        { status: 400 }
      );
    }

    // Check if class has enrollments
    const [enrollments] = await pool.execute(
      'SELECT COUNT(*) as count FROM enrollments WHERE class_id = ?',
      [classId]
    );

    if (enrollments[0].count > 0) {
      return NextResponse.json(
        { error: 'Cannot delete class with enrolled students. Please remove all students first.' },
        { status: 400 }
      );
    }

    // Check if class has timetable entries
    const [timetable] = await pool.execute(
      'SELECT COUNT(*) as count FROM timetable WHERE class_id = ?',
      [classId]
    );

    if (timetable[0].count > 0) {
      return NextResponse.json(
        { error: 'Cannot delete class with timetable entries. Please remove all timetable entries first.' },
        { status: 400 }
      );
    }

    // Delete class
    const [result] = await pool.execute(
      'DELETE FROM classes WHERE id = ?',
      [classId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Class deleted successfully' });

  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

