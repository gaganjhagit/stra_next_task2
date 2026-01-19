import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import pool from '@/lib/db';

// DELETE - Delete a grade
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
      'DELETE FROM grades WHERE id = ? AND teacher_id = ?',
      [id, user.id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Grade not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Grade deleted successfully' });

  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
