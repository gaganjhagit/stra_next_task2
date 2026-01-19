import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import pool from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(params.id);
    const { name, email, password, role } = await request.json();

    if (!name || !email || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if email already exists for another user
    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, userId]
    ) as any[];

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Update user
    if (password) {
      const hashedPassword = await hashPassword(password);
      await pool.execute(
        'UPDATE users SET name = ?, email = ?, password = ?, role = ? WHERE id = ?',
        [name, email, hashedPassword, role, userId]
      );
    } else {
      await pool.execute(
        'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
        [name, email, role, userId]
      );
    }

    return NextResponse.json({ message: 'User updated successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(params.id);

    // Prevent deleting yourself
    if (userId === user.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Delete user (cascade will handle related records)
    await pool.execute('DELETE FROM users WHERE id = ?', [userId]);

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

