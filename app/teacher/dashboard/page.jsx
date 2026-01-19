import { getCurrentUser } from '@/lib/auth.js';
import { redirect } from 'next/navigation';
import pool from '@/lib/db.js';
import Link from 'next/link';
import TeacherNav from '@/components/TeacherNav';

export async function getTeacherStats(teacherId) {
  // Get classes count
  const [classes] = await pool.execute(
    'SELECT COUNT(DISTINCT class_id) as count FROM timetable WHERE teacher_id = ?',
    [teacherId]
  );
  
  // Get students count
  const [students] = await pool.execute(
    `SELECT COUNT(DISTINCT e.student_id) as count 
    FROM enrollments e
    JOIN timetable t ON t.class_id = e.class_id
    WHERE t.teacher_id = ?`,
    [teacherId]
  );
  
  // Get subjects count
  const [subjects] = await pool.execute(
    'SELECT COUNT(DISTINCT subject_id) as count FROM timetable WHERE teacher_id = ?',
    [teacherId]
  );
  
  // Get today's attendance count
  const today = new Date().toISOString().split('T')[0];
  const [attendanceToday] = await pool.execute(
    `SELECT COUNT(*) as count FROM attendance 
    WHERE teacher_id = ? AND date = ?`,
    [teacherId, today]
  );
  
  // Get pending grades (students without recent grades)
  const [pendingGrades] = await pool.execute(
    `SELECT COUNT(DISTINCT e.student_id) as count
    FROM enrollments e
    JOIN timetable t ON t.class_id = e.class_id
    LEFT JOIN grades g ON g.student_id = e.student_id AND g.teacher_id = ? AND g.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    WHERE t.teacher_id = ? AND g.id IS NULL`,
    [teacherId, teacherId]
  );
  
  return { 
    classes: classes[0].count, 
    students: students[0].count,
    subjects: subjects[0].count,
    attendanceToday: attendanceToday[0].count,
    pendingGrades: pendingGrades[0].count
  };
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
      <TeacherNav />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition">
            <div className="text-gray-500 text-sm font-medium mb-1">Classes Teaching</div>
            <div className="text-4xl font-bold text-green-600">{stats.classes}</div>
            <div className="text-xs text-gray-400 mt-1">Active classes</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition">
            <div className="text-gray-500 text-sm font-medium mb-1">Total Students</div>
            <div className="text-4xl font-bold text-blue-600">{stats.students}</div>
            <div className="text-xs text-gray-400 mt-1">Enrolled students</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition">
            <div className="text-gray-500 text-sm font-medium mb-1">Subjects</div>
            <div className="text-4xl font-bold text-purple-600">{stats.subjects}</div>
            <div className="text-xs text-gray-400 mt-1">Teaching subjects</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition">
            <div className="text-gray-500 text-sm font-medium mb-1">Today's Attendance</div>
            <div className="text-4xl font-bold text-indigo-600">{stats.attendanceToday}</div>
            <div className="text-xs text-gray-400 mt-1">Marked today</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition">
            <div className="text-gray-500 text-sm font-medium mb-1">Pending Grades</div>
            <div className="text-4xl font-bold text-orange-600">{stats.pendingGrades}</div>
            <div className="text-xs text-gray-400 mt-1">Need grading</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/teacher/attendance" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition transform hover:scale-105">
            <div className="text-3xl mb-3">📋</div>
            <h3 className="text-lg font-semibold mb-2">Mark Attendance</h3>
            <p className="text-gray-600 text-sm">Record student attendance for your classes</p>
          </Link>
          <Link href="/teacher/grades" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition transform hover:scale-105">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="text-lg font-semibold mb-2">Manage Grades</h3>
            <p className="text-gray-600 text-sm">Enter and manage student grades</p>
          </Link>
          <Link href="/teacher/timetable" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition transform hover:scale-105">
            <div className="text-3xl mb-3">📅</div>
            <h3 className="text-lg font-semibold mb-2">Timetable</h3>
            <p className="text-gray-600 text-sm">View and manage your class schedule</p>
          </Link>
          <Link href="/teacher/analytics" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition transform hover:scale-105">
            <div className="text-3xl mb-3">📈</div>
            <h3 className="text-lg font-semibold mb-2">Analytics</h3>
            <p className="text-gray-600 text-sm">View class performance and insights</p>
          </Link>
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/teacher/attendance" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm">
              Mark Today's Attendance
            </Link>
            <Link href="/teacher/grades" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">
              Upload New Grades
            </Link>
            <Link href="/teacher/timetable" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
              View Timetable
            </Link>
            <form action="/api/auth/logout" method="POST" className="inline">
              <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm">
                Logout
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
