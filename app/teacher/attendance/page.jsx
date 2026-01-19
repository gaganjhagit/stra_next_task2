'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function TeacherAttendance() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingLoading, setMarkingLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
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
      fetchStudents(selectedClass);
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedClass && selectedDate) {
      fetchAttendance(selectedClass, selectedDate);
    }
  }, [selectedClass, selectedDate]);

  const fetchClasses = async () => {
    try {
      console.log('Fetching classes...');
      const response = await fetch('/api/teacher/attendance');
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Classes data:', data);
        
        if (data && data.length > 0) {
          setClasses(data);
        } else {
          // Add sample classes for testing
          console.log('No classes found, adding sample classes...');
          const sampleClasses = [
            { id: '1', name: 'Grade 10A' },
            { id: '2', name: 'Grade 10B' },
            { id: '3', name: 'Grade 11A' }
          ];
          setClasses(sampleClasses);
        }
      } else {
        const error = await response.json();
        console.error('Failed to fetch classes:', error);
        alert('Failed to fetch classes: ' + error.error);
        
        // Add sample classes for testing
        const sampleClasses = [
          { id: '1', name: 'Grade 10A' },
          { id: '2', name: 'Grade 10B' },
          { id: '3', name: 'Grade 11A' }
        ];
        setClasses(sampleClasses);
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      alert('Error fetching classes: ' + error.message);
      
      // Add sample classes for testing
      const sampleClasses = [
        { id: '1', name: 'Grade 10A' },
        { id: '2', name: 'Grade 10B' },
        { id: '3', name: 'Grade 11A' }
      ];
      setClasses(sampleClasses);
    } finally {
      setLoading(false);
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
          setStudents(data);
        } else {
          // Add sample students for testing
          console.log('No students found, adding sample students...');
          const sampleStudents = [
            { id: '1', name: 'Alice Student', email: 'alice@school.com', status: 'present', notes: '' },
            { id: '2', name: 'Bob Student', email: 'bob@school.com', status: 'present', notes: '' },
            { id: '3', name: 'Charlie Student', email: 'charlie@school.com', status: 'present', notes: '' }
          ];
          setStudents(sampleStudents);
        }
      } else {
        const error = await response.json();
        console.error('Error fetching students:', error);
        
        // Add sample students for testing
        const sampleStudents = [
          { id: '1', name: 'Alice Student', email: 'alice@school.com', status: 'present', notes: '' },
          { id: '2', name: 'Bob Student', email: 'bob@school.com', status: 'present', notes: '' },
          { id: '3', name: 'Charlie Student', email: 'charlie@school.com', status: 'present', notes: '' }
        ];
        setStudents(sampleStudents);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
      
      // Add sample students for testing
      const sampleStudents = [
        { id: '1', name: 'Alice Student', email: 'alice@school.com', status: 'present', notes: '' },
        { id: '2', name: 'Bob Student', email: 'bob@school.com', status: 'present', notes: '' },
        { id: '3', name: 'Charlie Student', email: 'charlie@school.com', status: 'present', notes: '' }
      ];
      setStudents(sampleStudents);
    }
  };

  const fetchAttendance = async (classId, date) => {
    try {
      const response = await fetch(`/api/teacher/attendance/attendance?classId=${classId}&date=${date}`);
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
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
    if (!selectedClass || students.length === 0) return;

    setMarkingLoading(true);
    try {
      const attendanceData = students.map(student => ({
        studentId: student.id,
        status: student.status,
        notes: student.notes,
        subjectId: selectedSubject || 1, // Default subject
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
        alert('Attendance marked successfully! / उपस्थिति सफलतापूर्वक अपलोड हो गई!');
        // Refresh attendance data
        fetchAttendance(selectedClass, selectedDate);
      } else {
        const error = await response.json();
        alert('Failed to mark attendance: ' + error.error);
      }
    } catch (error) {
      alert('Error marking attendance: ' + error.message);
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

      <main className="max-w-7xl mx-auto px-4 py-8">
        {!selectedClass ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h3 className="text-xl font-semibold mb-4">Select a Class First / पहले एक कक्षा चुनें</h3>
            <p className="text-gray-600">Choose a class to mark attendance</p>
            <div className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Class / कक्षा चुनें</label>
                  <select
                    value={selectedClass || ''}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select a class / कक्षा चुनें</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Subject / विषय चुनें</label>
                  <select
                    value={selectedSubject || ''}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select a subject / विषय चुनें</option>
                    <option value="1">Mathematics / गणित</option>
                    <option value="2">English / अंग्रज़ज़</option>
                    <option value="3">Science / विज्ञान</option>
                    <option value="4">History / इतिहास</option>
                  </select>
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
                    {classes.find(c => c.id === selectedClass)?.name || 'Mark Attendance'}
                  </h2>
                  <div className="text-gray-600">
                    {selectedDate ? `for ${new Date(selectedDate).toLocaleDateString('hi-IN')}` : 'Select a date'}
                  </div>
                </div>
                <div className="flex space-x-4">
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
                  {selectedClass ? `${classes.find(c => c.id === selectedClass)?.name} - ${new Date(selectedDate).toLocaleDateString('hi-IN')}` : 'Select a class and date'}
                </p>
                
                {/* Debug Info */}
                <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
                  <p className="font-semibold">Debug Information:</p>
                  <p>Classes found: {classes.length}</p>
                  <p>Students found: {students.length}</p>
                  <p>Selected Class: {selectedClass}</p>
                  <p>Selected Date: {selectedDate}</p>
                  <p>Loading: {loading ? 'Yes' : 'No'}</p>
                </div>
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
    </div>
  );
}
