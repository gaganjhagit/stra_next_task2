import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import pool from '@/lib/db';

// DELETE - Remove student from class (unenroll)
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
    const enrollmentId = parseInt(id);

    if (isNaN(enrollmentId)) {
      return NextResponse.json(
        { error: 'Invalid enrollment ID' },
        { status: 400 }
      );
    }

    // Delete enrollment
    const [result] = await pool.execute(
      'DELETE FROM enrollments WHERE id = ?',
      [enrollmentId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Student removed from class successfully' });

  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

