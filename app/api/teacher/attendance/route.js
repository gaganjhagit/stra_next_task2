import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import pool from '@/lib/db';

// GET - Get classes for teacher
export async function GET() {
  try {
    console.log('GET /api/teacher/attendance - Starting...');
    
    const user = await getCurrentUser();
    console.log('Current user:', user);
    
    if (!user || user.role !== 'teacher') {
      console.log('Unauthorized access');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Fetching classes for teacher ID:', user.id);

    // Get classes from timetable (where teacher is assigned via timetable)
    const [timetableClasses] = await pool.execute(
      `SELECT DISTINCT c.id, c.name, c.grade_level
       FROM classes c
       JOIN timetable t ON t.class_id = c.id
       WHERE t.teacher_id = ?
       ORDER BY c.grade_level, c.name`,
      [user.id]
    );

    // Also get classes where teacher is assigned as class teacher
    const [classTeacherClasses] = await pool.execute(
      `SELECT DISTINCT c.id, c.name, c.grade_level
       FROM classes c
       WHERE c.teacher_id = ?
       ORDER BY c.grade_level, c.name`,
      [user.id]
    );

    // Combine and deduplicate classes
    const allClasses = [...timetableClasses, ...classTeacherClasses];
    const uniqueClasses = [];
    const seenIds = new Set();
    
    for (const cls of allClasses) {
      if (!seenIds.has(cls.id)) {
        seenIds.add(cls.id);
        uniqueClasses.push({
          id: cls.id,
          name: cls.name,
          grade_level: cls.grade_level
        });
      }
    }

    // Sort by grade level and name
    uniqueClasses.sort((a, b) => {
      if (a.grade_level !== b.grade_level) {
        return a.grade_level - b.grade_level;
      }
      return a.name.localeCompare(b.name);
    });

    console.log(`Found ${uniqueClasses.length} classes for teacher ${user.id}`);

    // Get subjects that the teacher teaches (for all classes)
    const [subjects] = await pool.execute(
      `SELECT DISTINCT s.id, s.name, s.code
       FROM subjects s
       JOIN timetable t ON t.subject_id = s.id
       WHERE t.teacher_id = ?
       ORDER BY s.name`,
      [user.id]
    );

    return NextResponse.json({ 
      classes: uniqueClasses,
      subjects: subjects 
    });
  } catch (error) {
    console.error('Error in GET /api/teacher/attendance:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
