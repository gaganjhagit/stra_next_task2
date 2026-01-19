import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth.js';
import pool from '@/lib/db.js';
import { jsPDF } from 'jspdf';

/**
 * GET /api/student/report-card
 * Generate and download a student's report card as PDF
 */
export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = parseInt(searchParams.get('studentId') || '0');

    if (studentId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get student information
    const [users] = await pool.execute(
      'SELECT name, email FROM users WHERE id = ?',
      [studentId]
    );

    if (users.length === 0) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const student = users[0];

    // Get all grades
    const [grades] = await pool.execute(
      `SELECT 
        g.grade,
        g.max_grade,
        g.grade_type,
        s.name as subject_name,
        c.name as class_name
      FROM grades g
      JOIN subjects s ON g.subject_id = s.id
      JOIN classes c ON g.class_id = c.id
      WHERE g.student_id = ?
      ORDER BY s.name, g.created_at DESC`,
      [studentId]
    );

    // Get attendance
    const [attendance] = await pool.execute(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present
      FROM attendance WHERE student_id = ?`,
      [studentId]
    );

    // Generate PDF
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text('Report Card', 105, 20, { align: 'center' });
    
    // Student Info
    doc.setFontSize(12);
    doc.text(`Student: ${student.name}`, 20, 40);
    doc.text(`Email: ${student.email}`, 20, 50);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 60);

    // Grades Section
    let yPos = 80;
    doc.setFontSize(16);
    doc.text('Grades', 20, yPos);
    yPos += 10;

    if (grades.length > 0) {
      // Group by subject
      const gradesBySubject = grades.reduce((acc, grade) => {
        if (!acc[grade.subject_name]) {
          acc[grade.subject_name] = [];
        }
        acc[grade.subject_name].push(grade);
        return acc;
      }, {});

      doc.setFontSize(12);
      Object.entries(gradesBySubject).forEach(([subject, subjectGrades]) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(14);
        doc.text(subject, 20, yPos);
        yPos += 8;

        doc.setFontSize(10);
        subjectGrades.forEach((grade) => {
          if (yPos > 280) {
            doc.addPage();
            yPos = 20;
          }
          const percentage = ((grade.grade / grade.max_grade) * 100).toFixed(1);
          doc.text(
            `  ${grade.grade_type}: ${grade.grade}/${grade.max_grade} (${percentage}%)`,
            25,
            yPos
          );
          yPos += 6;
        });
        yPos += 3;
      });

      // Calculate average
      const avgGrade = grades.reduce(
        (sum, g) => sum + (g.grade / g.max_grade * 100),
        0
      ) / grades.length;

      yPos += 5;
      doc.setFontSize(12);
      doc.text(`Overall Average: ${avgGrade.toFixed(1)}%`, 20, yPos);
    } else {
      doc.setFontSize(10);
      doc.text('No grades available', 20, yPos);
    }

    // Attendance Section
    yPos += 20;
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFontSize(16);
    doc.text('Attendance', 20, yPos);
    yPos += 10;
    doc.setFontSize(12);
    if (attendance[0]?.total > 0) {
      const attendanceRate = ((attendance[0].present / attendance[0].total) * 100).toFixed(1);
      doc.text(`Total Days: ${attendance[0].total}`, 20, yPos);
      yPos += 7;
      doc.text(`Present: ${attendance[0].present}`, 20, yPos);
      yPos += 7;
      doc.text(`Attendance Rate: ${attendanceRate}%`, 20, yPos);
    } else {
      doc.text('No attendance records', 20, yPos);
    }

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="report-card-${studentId}.pdf"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
