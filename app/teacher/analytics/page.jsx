'use client';

import { useState, useEffect } from 'react';

export default function TeacherAnalytics() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchAnalytics(selectedClass);
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/teacher/grades');
      if (response.ok) {
        const data = await response.json();
        setClasses(data.classes);
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async (classId) => {
    try {
      const response = await fetch(`/api/teacher/analytics?classId=${classId}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Class Analytics / कक्षा विश्लेषण</h1>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Class Selection */}
          <div className="bg-white rounded-lg shadow p-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Class / कक्षा चुनें</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select a class / कक्षा चुनें</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>

          {analytics && (
            <>
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="text-gray-500 text-sm font-medium">Total Students / कुल छात्र</div>
                  <div className="text-3xl font-bold text-indigo-600 mt-2">{analytics.totalStudents}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="text-gray-500 text-sm font-medium">Average Grade / औसत ग्रेड</div>
                  <div className="text-3xl font-bold text-green-600 mt-2">{analytics.averageGrade}%</div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="text-gray-500 text-sm font-medium">Pass Rate / पास दर</div>
                  <div className="text-3xl font-bold text-blue-600 mt-2">{analytics.passRate}%</div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="text-gray-500 text-sm font-medium">Attendance Rate / उपस्थिति दर</div>
                  <div className="text-3xl font-bold text-purple-600 mt-2">{analytics.attendanceRate}%</div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Grade Distribution Chart */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Grade Distribution / ग्रेड वितरण</h3>
                  <div className="space-y-3">
                    {analytics.gradeDistribution.map((grade, index) => (
                      <div key={grade.grade} className="flex items-center">
                        <div className="w-24 text-sm font-medium">{grade.grade}:</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-6 ml-3">
                          <div 
                            className={`h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                              grade.grade === 'A' ? 'bg-green-500 text-white' :
                              grade.grade === 'B' ? 'bg-blue-500 text-white' :
                              grade.grade === 'C' ? 'bg-yellow-500 text-white' :
                              grade.grade === 'D' ? 'bg-orange-500 text-white' :
                              'bg-red-500 text-white'
                            }`}
                            style={{ width: `${grade.percentage}%` }}
                          >
                            {grade.percentage}%
                          </div>
                        </div>
                        <div className="w-12 text-sm text-gray-600 text-right">{grade.count}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subject Performance Chart */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Subject Performance / विषय प्रदर्शन</h3>
                  <div className="space-y-3">
                    {analytics.subjectPerformance.map((subject, index) => (
                      <div key={subject.name} className="border-b pb-3 last:border-0">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{subject.name}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            subject.average >= 90 ? 'bg-green-100 text-green-800' :
                            subject.average >= 80 ? 'bg-blue-100 text-blue-800' :
                            subject.average >= 70 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {subject.average.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              subject.average >= 90 ? 'bg-green-500' :
                              subject.average >= 80 ? 'bg-blue-500' :
                              subject.average >= 70 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${subject.average}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Attendance Overview */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Attendance Overview / उपस्थिति अवलोक</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{analytics.attendanceBreakdown.present}</div>
                    <div className="text-sm text-green-800">Present / उपस्थित</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{analytics.attendanceBreakdown.absent}</div>
                    <div className="text-sm text-red-800">Absent / अनुपस्थित</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{analytics.attendanceBreakdown.late}</div>
                    <div className="text-sm text-yellow-800">Late / देर से</div>
                  </div>
                </div>
              </div>

              {/* Top Performers */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Top Performers / उच्च छात्र</h3>
                <div className="space-y-3">
                  {analytics.topPerformers.map((student, index) => (
                    <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                          {index + 1}
                        </div>
                        <div className="ml-3">
                          <div className="font-medium">{student.name}</div>
                          <div className="text-sm text-gray-600">{student.email}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">{student.average}%</div>
                        <div className="text-sm text-gray-600">Average</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
