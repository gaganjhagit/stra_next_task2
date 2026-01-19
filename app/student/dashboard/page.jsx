import { getCurrentUser } from '@/lib/auth.js';
import { redirect } from 'next/navigation';
import Link from 'next/link';

async function getStudentStats(studentId) {
  const pool = (await import('@/lib/db.js')).default;
  const [grades] = await pool.execute(
    'SELECT COUNT(*) as count FROM grades WHERE student_id = ?',
    [studentId]
  );
  const [attendance] = await pool.execute(
    'SELECT COUNT(CASE WHEN status = "present" THEN 1 END) as present, COUNT(*) as total FROM attendance WHERE student_id = ?',
    [studentId]
  );
  return { grades: grades[0].count, attendance: attendance[0] };
}

export default async function StudentDashboard() {
  const user = await getCurrentUser();
  // if (!user || user.role !== 'student') {
  //   redirect('/login');
  // }

  const stats = await getStudentStats(user.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Student Dashboard</h1>
            <div className="text-gray-600">Welcome, {user.name}</div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm font-medium">Total Grades</div>
            <div className="mt-2 flex items-baseline">
              <div className="text-5xl font-bold text-indigo-600">{stats.grades}</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm font-medium">Attendance Rate</div>
            <div className="mt-2 flex items-baseline">
              <div className="text-5xl font-bold text-green-600">
                {stats.attendance.total > 0 ? ((stats.attendance.present / stats.attendance.total) * 100).toFixed(1) : 0}%
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm font-medium">Days Present</div>
            <div className="mt-2 flex items-baseline">
              <div className="text-5xl font-bold text-blue-600">{stats.attendance.present}</div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/student/grades" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">📊 View Grades</h3>
            <p className="text-gray-600">Check your grades and performance</p>
          </Link>
          <Link href="/student/attendance" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">📅 Attendance</h3>
            <p className="text-gray-600">View your attendance history</p>
          </Link>
          <Link href="/student/timetable" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">⏰ Timetable</h3>
            <p className="text-gray-600">View class timetable</p>
          </Link>
          <form action="/api/auth/logout" method="POST" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <button type="submit" className="text-lg font-semibold text-red-600">🚪 Logout</button>
            <p className="text-gray-600">Sign out from your account</p>
          </form>
        </div>
      </main>
    </div>
  );
}
