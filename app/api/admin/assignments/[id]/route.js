import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import pool from '@/lib/db';

// DELETE - Remove class assignment from teacher
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
    const assignmentId = parseInt(id);

    if (isNaN(assignmentId)) {
      return NextResponse.json(
        { error: 'Invalid assignment ID' },
        { status: 400 }
      );
    }

    // Delete timetable entry (this removes the class assignment)
    const [result] = await pool.execute(
      'DELETE FROM timetable WHERE id = ?',
      [assignmentId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Assignment removed successfully' });

  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

