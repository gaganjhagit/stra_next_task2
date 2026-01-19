import { getCurrentUser } from '@/lib/auth.js';
import { redirect } from 'next/navigation';
import pool from '@/lib/db.js';

export async function getTeacherStats(teacherId) {
  const [classes] = await pool.execute(
    'SELECT COUNT(DISTINCT class_id) as count FROM timetable WHERE teacher_id = ?',
    [teacherId]
  );
  const [students] = await pool.execute(
    `SELECT COUNT(DISTINCT e.student_id) as count 
    FROM enrollments e
    JOIN classes c ON e.class_id = c.id
    WHERE c.teacher_id = ?`,
    [teacherId]
  );
  return { classes: classes[0].count, students: students[0].count };
}

export default async function TeacherDashboard() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'teacher') {
    redirect('/login');
  }

  const stats = await getTeacherStats(user.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
            <div className="text-gray-600">Welcome, {user.name}</div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm font-medium">Classes Teaching</div>
            <div className="text-5xl font-bold text-green-600 mt-2">{stats.classes}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm font-medium">Students</div>
            <div className="text-5xl font-bold text-blue-600 mt-2">{stats.students}</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <a href="/teacher/attendance" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <h3 className="text-lg font-semibold mb-2">📋 Mark Attendance</h3>
            <p className="text-gray-600">Record student attendance</p>
          </a>
          <a href="/teacher/grades" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <h3 className="text-lg font-semibold mb-2">📊 Upload Grades</h3>
            <p className="text-gray-600">Enter student grades</p>
          </a>
          <a href="/teacher/analytics" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <h3 className="text-lg font-semibold mb-2">📈 Analytics</h3>
            <p className="text-gray-600">View class performance</p>
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
