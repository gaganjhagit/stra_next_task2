import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import pool from '@/lib/db';

// GET - Get class analytics
export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');

    if (!classId) {
      return NextResponse.json(
        { error: 'Class ID is required' },
        { status: 400 }
      );
    }

    // Verify teacher teaches this class
    const [authCheck] = await pool.execute(
      `SELECT COUNT(*) as count FROM timetable t
      WHERE t.class_id = ? AND t.teacher_id = ?`,
      [classId, user.id]
    );

    if (authCheck[0].count === 0) {
      return NextResponse.json(
        { error: 'You are not authorized to view analytics for this class' },
        { status: 403 }
      );
    }

    // Get total students
    const [students] = await pool.execute(
      `SELECT COUNT(*) as total FROM enrollments e
      WHERE e.class_id = ?`,
      [classId]
    );

    // Get grade statistics
    const [gradeStats] = await pool.execute(
      `SELECT 
        AVG(CAST(g.grade AS DECIMAL(5,2)) / CAST(g.max_grade AS DECIMAL(5,2)) * 100) as average_grade,
        COUNT(CASE WHEN CAST(g.grade AS DECIMAL(5,2)) / CAST(g.max_grade AS DECIMAL(5,2)) >= 0.6 THEN 1 END) as pass_count,
        COUNT(*) as total_grades
      FROM grades g
      WHERE g.class_id = ? AND g.teacher_id = ?`,
      [classId, user.id]
    );

    // Get grade distribution
    const [gradeDistribution] = await pool.execute(
      `SELECT 
        CASE 
          WHEN AVG(g.grade / g.max_grade * 100) >= 90 THEN 'A'
          WHEN AVG(g.grade / g.max_grade * 100) >= 80 THEN 'B'
          WHEN AVG(g.grade / g.max_grade * 100) >= 70 THEN 'C'
          WHEN AVG(g.grade / g.max_grade * 100) >= 60 THEN 'D'
          ELSE 'F'
        END as grade,
        COUNT(*) as count
      FROM grades g
      WHERE g.class_id = ? AND g.teacher_id = ?
      GROUP BY u.id
      HAVING AVG(g.grade / g.max_grade * 100) >= 0`,
      [classId, user.id]
    );

    // Get subject performance
    const [subjectPerformance] = await pool.execute(
      `SELECT 
        s.name as subject_name,
        AVG(CAST(g.grade AS DECIMAL(5,2)) / CAST(g.max_grade AS DECIMAL(5,2)) * 100) as average
      FROM grades g
      JOIN subjects s ON g.subject_id = s.id
      WHERE g.class_id = ? AND g.teacher_id = ?
      GROUP BY s.id, s.name
      ORDER BY average DESC`,
      [classId, user.id]
    );

    // Get attendance statistics
    const [attendanceStats] = await pool.execute(
      `SELECT 
        COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present,
        COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent,
        COUNT(CASE WHEN a.status = 'late' THEN 1 END) as late,
        COUNT(*) as total
      FROM attendance a
      WHERE a.class_id = ? AND a.teacher_id = ?`,
      [classId, user.id]
    );

    // Get top performers
    const [topPerformers] = await pool.execute(
      `SELECT 
        u.id,
        u.name,
        u.email,
        AVG(CAST(g.grade AS DECIMAL(5,2)) / CAST(g.max_grade AS DECIMAL(5,2)) * 100) as average
      FROM grades g
      JOIN users u ON g.student_id = u.id
      WHERE g.class_id = ? AND g.teacher_id = ?
      GROUP BY u.id, u.name, u.email
      ORDER BY average DESC
      LIMIT 10`,
      [classId, user.id]
    );

    const stats = gradeStats[0];
    const attendance = attendanceStats[0];

    const analytics = {
      totalStudents: students[0].total,
      averageGrade: stats ? parseFloat(stats.average_grade || 0).toFixed(1) : 0,
      passRate: stats ? ((stats.pass_count / stats.total_grades) * 100).toFixed(1) : 0,
      attendanceRate: attendance ? ((attendance.present / attendance.total) * 100).toFixed(1) : 0,
      gradeDistribution: [
        { grade: 'A', percentage: 0, count: 0 },
        { grade: 'B', percentage: 0, count: 0 },
        { grade: 'C', percentage: 0, count: 0 },
        { grade: 'D', percentage: 0, count: 0 },
        { grade: 'F', percentage: 0, count: 0 }
      ],
      subjectPerformance: subjectPerformance.map(s => ({
        name: s.subject_name,
        average: parseFloat(s.average || 0)
      })),
      attendanceBreakdown: {
        present: attendance ? attendance.present : 0,
        absent: attendance ? attendance.absent : 0,
        late: attendance ? attendance.late : 0
      },
      topPerformers: topPerformers.map(s => ({
        id: s.id,
        name: s.name,
        email: s.email,
        average: parseFloat(s.average || 0).toFixed(1)
      }))
    };

    // Calculate grade distribution percentages
    const totalGrades = analytics.gradeDistribution.reduce((sum, g) => sum + g.count, 0);
    if (totalGrades > 0) {
      analytics.gradeDistribution.forEach(grade => {
        grade.percentage = ((grade.count / totalGrades) * 100).toFixed(1);
      });
    }

    return NextResponse.json(analytics);

  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
