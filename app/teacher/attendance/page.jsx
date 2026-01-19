'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Notification from '@/components/Notification';
import ConfirmModal from '@/components/ConfirmModal';
import TeacherNav from '@/components/TeacherNav';

function TeacherAttendanceContent() {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingLoading, setMarkingLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [notification, setNotification] = useState({ type: '', message: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchClasses();
    
    // Check if classId is in URL params
    const classId = searchParams.get('classId');
    if (classId) {
      setSelectedClass(classId);
    }
    
    const subjectId = searchParams.get('subjectId');
    if (subjectId) {
      setSelectedSubject(subjectId);
    }
    
    const dateParam = searchParams.get('date');
    if (dateParam) {
      setSelectedDate(dateParam);
    }
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchSubjectsForClass(selectedClass);
      if (selectedSubject) {
        fetchStudents(selectedClass);
      }
    } else {
      setSubjects([]);
      setSelectedSubject(null);
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedClass && selectedSubject) {
      fetchStudents(selectedClass);
    }
  }, [selectedClass, selectedSubject]);

  useEffect(() => {
    if (selectedClass && selectedSubject && selectedDate) {
      fetchAttendance(selectedClass, selectedSubject, selectedDate);
    }
  }, [selectedClass, selectedSubject, selectedDate]);

  const fetchClasses = async () => {
    try {
      console.log('Fetching classes...');
      const response = await fetch('/api/teacher/attendance');
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Classes and subjects data:', data);
        // Handle both old format (array) and new format (object with classes and subjects)
        if (Array.isArray(data)) {
          setClasses(data);
          setSubjects([]);
        } else if (data && data.classes) {
          setClasses(Array.isArray(data.classes) ? data.classes : []);
          setSubjects(Array.isArray(data.subjects) ? data.subjects : []);
        } else {
          setClasses([]);
          setSubjects([]);
        }
      } else {
        const error = await response.json();
        console.error('Failed to fetch classes:', error);
        setNotification({ type: 'error', message: 'Failed to fetch classes: ' + error.error });
        setClasses([]);
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      setNotification({ type: 'error', message: 'Error fetching classes: ' + error.message });
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjectsForClass = async (classId) => {
    try {
      const response = await fetch(`/api/teacher/attendance/subjects?classId=${classId}`);
      if (response.ok) {
        const data = await response.json();
        setSubjects(Array.isArray(data) ? data : []);
        // If only one subject, auto-select it
        if (data && data.length === 1) {
          setSelectedSubject(String(data[0].id));
        } else if (data && data.length > 0 && !selectedSubject) {
          // Don't auto-select if multiple subjects
          setSelectedSubject(null);
        }
      } else {
        // Fallback to all subjects if class-specific fetch fails
        console.error('Failed to fetch subjects for class');
      }
    } catch (error) {
      console.error('Error fetching subjects for class:', error);
    }
  };

  const fetchStudents = async (classId) => {
    try {
      console.log('Fetching students for class:', classId);
      const response = await fetch(`/api/teacher/attendance/students?classId=${classId}`);
      console.log('Students response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Students data:', data);
        
        if (data && data.length > 0) {
          // Set students with default status if not present
          const studentsWithStatus = data.map(student => ({
            ...student,
            status: student.status || 'present',
            notes: student.notes || ''
          }));
          setStudents(studentsWithStatus);
        } else {
          console.log('No students found for this class');
          setStudents([]);
        }
      } else {
        const error = await response.json();
        console.error('Error fetching students:', error);
        setStudents([]);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
      setStudents([]);
    }
  };

  const fetchAttendance = async (classId, subjectId, date) => {
    try {
      if (!classId || !date) return;
      
      const url = `/api/teacher/attendance/attendance?classId=${classId}&date=${date}${subjectId ? `&subjectId=${subjectId}` : ''}`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        // Always use real data from API
        if (data && Array.isArray(data) && data.length > 0) {
          // Ensure all students have status and notes
          const studentsWithDefaults = data.map(student => ({
            ...student,
            status: student.status || 'present',
            notes: student.notes || ''
          }));
          setStudents(studentsWithDefaults);
        } else {
          // If no attendance records exist, fetch students from enrollments
          fetchStudents(classId);
        }
      } else {
        // If error, fetch students from enrollments
        fetchStudents(classId);
      }
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
      // On error, fetch students from enrollments
      fetchStudents(classId);
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setStudents(students.map(student => 
      student.id === studentId ? { ...student, status } : student
    ));
  };

  const handleNotesChange = (studentId, notes) => {
    setStudents(students.map(student => 
      student.id === studentId ? { ...student, notes } : student
    ));
  };

  const markAttendance = async () => {
    if (!selectedClass || !selectedSubject || students.length === 0) {
      setNotification({ type: 'error', message: 'Please select class, subject, and ensure students are loaded' });
      return;
    }

    setMarkingLoading(true);
    try {
      const attendanceData = students.map(student => ({
        studentId: student.id,
        status: student.status,
        notes: student.notes,
        subjectId: selectedSubject,
        classId: selectedClass,
        date: selectedDate
      }));

      const response = await fetch('/api/teacher/attendance/mark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classId: selectedClass,
          date: selectedDate,
          attendance: attendanceData
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setNotification({ 
          type: 'success', 
          message: `Attendance marked successfully for ${result.results.filter(r => r.success).length} students!` 
        });
        // Refresh attendance data
        fetchAttendance(selectedClass, selectedSubject, selectedDate);
      } else {
        const error = await response.json();
        setNotification({ type: 'error', message: error.error || 'Failed to mark attendance' });
      }
    } catch (error) {
      setNotification({ type: 'error', message: error.message || 'Error marking attendance' });
    } finally {
      setMarkingLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      case 'excused': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present': return '✅';
      case 'absent': return '❌';
      case 'late': return '⏰';
      case 'excused': return '📝';
      default: return '❓';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Mark Attendance / उपस्थिति अंकन</h1>
        </div>
      </nav>
      <TeacherNav />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {!selectedClass || !selectedSubject ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h3 className="text-xl font-semibold mb-4">
              {!selectedClass ? 'Select a Class First / पहले एक कक्षा चुनें' : 'Select a Subject / विषय चुनें'}
            </h3>
            <p className="text-gray-600">
              {!selectedClass ? 'Choose a class to mark attendance' : 'Choose a subject to mark attendance'}
            </p>
            <div className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Class / कक्षा चुनें</label>
                  <select
                    value={selectedClass || ''}
                    onChange={(e) => {
                      setSelectedClass(e.target.value);
                      setSelectedSubject(null); // Reset subject when class changes
                      setStudents([]); // Clear students when class changes
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select a class / कक्षा चुनें</option>
                    {classes.length > 0 ? (
                      classes.map(cls => (
                        <option key={cls.id} value={String(cls.id)}>{cls.name}</option>
                      ))
                    ) : (
                      <option value="" disabled>No classes assigned / कोई कक्षा असाइन नहीं की गई</option>
                    )}
                  </select>
                  {classes.length === 0 && (
                    <p className="text-xs text-red-600 mt-1">
                      No classes found. Please contact admin to assign classes to you.
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Subject / विषय चुनें</label>
                  <select
                    value={selectedSubject || ''}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={!selectedClass}
                  >
                    <option value="">Select a subject / विषय चुनें</option>
                    {subjects.length > 0 ? (
                      subjects.map(subject => (
                        <option key={subject.id} value={String(subject.id)}>
                          {subject.name} {subject.code ? `(${subject.code})` : ''}
                        </option>
                      ))
                    ) : selectedClass ? (
                      <option value="" disabled>No subjects found for this class / इस कक्षा के लिए कोई विषय नहीं मिला</option>
                    ) : (
                      <option value="" disabled>Select a class first / पहले कक्षा चुनें</option>
                    )}
                  </select>
                  {selectedClass && subjects.length === 0 && (
                    <p className="text-xs text-yellow-600 mt-1">
                      No subjects found for this class. Please check your timetable assignments.
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Date / दिनांक चुनें</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                    max={new Date().toISOString().split('T')[0]}
                    min={new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]}
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <button
                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
              >
                Today / आज
              </button>
              <button
                onClick={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  setSelectedDate(tomorrow.toISOString().split('T')[0]);
                }}
                className="px-3 py-1 bg-gray-500 text-gray-700 rounded-md hover:bg-gray-600 text-sm"
              >
                Tomorrow / कल
              </button>
              <button
                onClick={() => {
                  const nextWeek = new Date();
                  nextWeek.setDate(nextWeek.getDate() + 7);
                  setSelectedDate(nextWeek.toISOString().split('T')[0]);
                }}
                className="px-3 py-1 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 text-sm"
              >
                Next Week / अगले
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header with class info and controls */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-semibold">
                    {classes.find(c => String(c.id) === String(selectedClass))?.name || 'Mark Attendance'}
                  </h2>
                  <div className="text-gray-600">
                    {selectedSubject && (
                      <span className="mr-2">
                        Subject: {
                          subjects.find(s => String(s.id) === String(selectedSubject))?.name || 
                          (selectedSubject === '1' ? 'Mathematics / गणित' :
                          selectedSubject === '2' ? 'English / अंग्रज़ज़' :
                          selectedSubject === '3' ? 'Science / विज्ञान' :
                          selectedSubject === '4' ? 'History / इतिहास' : 'Unknown')
                        }
                      </span>
                    )}
                    {selectedDate ? `- ${new Date(selectedDate).toLocaleDateString('hi-IN')}` : 'Select a date'}
                  </div>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      setSelectedClass(null);
                      setSelectedSubject(null);
                      setStudents([]);
                    }}
                    className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
                  >
                    Change Class/Subject / कक्षा/विषय बदलें
                  </button>
                  <button
                    onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                    className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                  >
                    Today / आज
                  </button>
                  <button
                    onClick={() => {
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      setSelectedDate(tomorrow.toISOString().split('T')[0]);
                    }}
                    className="px-3 py-1 bg-gray-500 text-gray-700 rounded-md hover:bg-gray-600 text-sm"
                  >
                    Tomorrow / कल
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions / त्वरित कार्य</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setStudents(students.map(student => ({ ...student, status: 'present' })));
                  }}
                  className="px-4 py-2 bg-green-100 text-green-800 rounded-md hover:bg-green-200 text-sm"
                >
                  Mark All Present / सभी को उपस्थित
                </button>
                <button
                  onClick={() => {
                    setStudents(students.map(student => ({ ...student, status: 'absent' })));
                  }}
                  className="px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200 text-sm"
                >
                  Mark All Absent / सभी को अनुपस्थित
                </button>
                <button
                  onClick={() => {
                    setStudents(students.map(student => ({ ...student, status: 'late' })));
                  }}
                  className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 text-sm"
                >
                  Mark All Late / देर से
                </button>
                <button
                  onClick={() => {
                    setStudents(students.map(student => ({ ...student, status: 'present' })));
                  }}
                  className="px-4 py-2 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 text-sm"
                >
                  Reset to Present / रीसेट करें
                </button>
              </div>
            </div>

            {/* Students List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b">
                <h3 className="text-lg font-semibold mb-4">
                  Students / छात्र ({students.length})
                </h3>
                     <p className="text-sm text-gray-600">
                       {selectedClass ? `${classes.find(c => String(c.id) === String(selectedClass))?.name || 'Unknown Class'} - ${selectedDate ? new Date(selectedDate).toLocaleDateString('hi-IN') : 'No date'}` : 'Select a class and date'}
                     </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Student Name / छात्र का नाम</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Email / ईमेल</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status / स्थिति</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Notes / टिप्पणी</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {students.length > 0 ? (
                      students.map((student, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-6 py-3 font-medium">{student.name}</td>
                          <td className="px-6 py-3 text-gray-600">{student.email}</td>
                          <td className="px-6 py-3">
                            <div className="flex items-center">
                              <select
                                value={student.status}
                                onChange={(e) => handleAttendanceChange(student.id, e.target.value)}
                                className={`px-3 py-1 rounded-full text-sm font-medium border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${getStatusColor(student.status)}`}
                              >
                                <option value="present">Present / उपस्थित</option>
                                <option value="absent">Absent / अनुपस्थित</option>
                                <option value="late">Late / देर से</option>
                                <option value="excused">Excused / क्षमा किया गया</option>
                              </select>
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            <input
                              type="text"
                              value={student.notes || ''}
                              onChange={(e) => handleNotesChange(student.id, e.target.value)}
                              placeholder="Add notes..."
                              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                          <div className="text-center">
                            <p className="text-lg font-medium">No students found</p>
                            <p className="text-sm mt-2">Please select a class and date to see students</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Submit Button */}
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <button
                onClick={markAttendance}
                disabled={markingLoading || students.length === 0}
                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {markingLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0h2.938c.702 0 1.34.277 1.813.619l.877 4.023c.098.112.176.176h2.854c.586 0-1.043-.098 1.426-.277l-.877 4.023c.098.112-.176.176H4.938c.702 0 1.34.277 1.813.619L2.248 7.677z"></path>
                    </svg>
                    <span className="ml-2">Marking Attendance... / उपस्थिति अंकन...</span>
                  </div>
                ) : (
                  <span className="flex items-center">
                    Mark Attendance / उपस्थिति अंकन
                  </span>
                )}
              </button>
            </div>
          </div>
        )}
      </main>
      
      {/* Notification */}
      <Notification
        type={notification.type}
        message={notification.message}
        onClose={() => setNotification({ type: '', message: '' })}
      />
    </div>
  );
}

export default function TeacherAttendance() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      <TeacherAttendanceContent />
    </Suspense>
  );
}
