import { getCurrentUser } from '@/lib/auth.js';
import { redirect } from 'next/navigation';
import pool from '@/lib/db.js';

export async function getAdminStats() {
  const [users] = await pool.execute('SELECT role, COUNT(*) as count FROM users GROUP BY role');
  const [classes] = await pool.execute('SELECT COUNT(*) as count FROM classes');
  const stats = { students: 0, teachers: 0, admins: 0 };
  users.forEach(u => stats[u.role + 's'] = u.count);
  return { ...stats, classes: classes[0].count };
}

export default async function AdminDashboard() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    redirect('/login');
  }

  const stats = await getAdminStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <div className="text-gray-600">Welcome, {user.name}</div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm font-medium">Students</div>
            <div className="text-5xl font-bold text-blue-600 mt-2">{stats.students}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm font-medium">Teachers</div>
            <div className="text-5xl font-bold text-green-600 mt-2">{stats.teachers}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm font-medium">Classes</div>
            <div className="text-5xl font-bold text-orange-600 mt-2">{stats.classes}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm font-medium">Admins</div>
            <div className="text-5xl font-bold text-red-600 mt-2">{stats.admins}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <a href="/admin/users" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <h3 className="text-lg font-semibold mb-2">👥 Manage Users</h3>
            <p className="text-gray-600">Add, edit, delete users</p>
          </a>
          <a href="/admin/upload" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <h3 className="text-lg font-semibold mb-2">📤 Bulk Upload</h3>
            <p className="text-gray-600">Import users from CSV</p>
          </a>
          <form action="/api/auth/logout" method="POST" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <button type="submit" className="text-lg font-semibold text-red-600">🚪 Logout</button>
            <p className="text-gray-600">Sign out</p>
          </form>
        </div>
      </main>
    </div>
  );
}
