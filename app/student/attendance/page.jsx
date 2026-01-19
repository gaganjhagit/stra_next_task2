'use client';

import { useState, useEffect } from 'react';

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/student/attendance', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        // Always use real data from API, even if empty
        setRecords(Array.isArray(data) ? data : []);
      } else {
        const error = await response.json().catch(() => ({ error: 'Failed to fetch attendance' }));
        console.error('Error fetching attendance:', error);
        setRecords([]);
      }
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedRecords = records
    .filter(record => {
      if (filter === 'all') return true;
      return record.status === filter;
    })
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'subject') return a.subject_name.localeCompare(b.subject_name);
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      return 0;
    });

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

  const calculateStats = () => {
    const total = records.length;
    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const late = records.filter(r => r.status === 'late').length;
    const excused = records.filter(r => r.status === 'excused').length;
    const attendanceRate = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

    return { total, present, absent, late, excused, attendanceRate };
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Attendance History / उपस्थिति इतिहास</h1>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {records.length > 0 ? (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-gray-500 text-sm font-medium">Total Days / कुल दिन</div>
                <div className="text-3xl font-bold text-indigo-600 mt-2">{stats.total}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-gray-500 text-sm font-medium">Present / उपस्थित</div>
                <div className="text-3xl font-bold text-green-600 mt-2">{stats.present}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-gray-500 text-sm font-medium">Absent / अनुपस्थित</div>
                <div className="text-3xl font-bold text-red-600 mt-2">{stats.absent}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-gray-500 text-sm font-medium">Late / देर से आए</div>
                <div className="text-3xl font-bold text-yellow-600 mt-2">{stats.late}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-gray-500 text-sm font-medium">Attendance Rate / उपस्थिति दर</div>
                <div className="text-3xl font-bold text-purple-600 mt-2">{stats.attendanceRate}%</div>
              </div>
            </div>

            {/* Filters and Controls */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status / स्थिति के फ़िल्टर करें</label>
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Status / सभी स्थितियां</option>
                    <option value="present">Present / उपस्थित</option>
                    <option value="absent">Absent / अनुपस्थित</option>
                    <option value="late">Late / देर से</option>
                    <option value="excused">Excused / क्षमा किया गया</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort by / इसके अनुसार क्रमबद्ध करें</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="date">Latest First / पहले नवीनतम</option>
                    <option value="subject">Subject Name / विषय का नाम</option>
                    <option value="status">Status / स्थिति</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Attendance Records */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b">
                <h3 className="text-lg font-semibold">Attendance Records / उपस्थिति रिकॉर्ड</h3>
                <p className="text-sm text-gray-600">Showing {filteredAndSortedRecords.length} of {records.length} records</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Date / दिनांक</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Class / कक्षा</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Subject / विषय</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status / स्थिति</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Notes / टिप्पणी</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredAndSortedRecords.map((record, idx) => (
                      <tr key={`${record.date}-${record.class_name}-${record.subject_name}-${idx}`} className="hover:bg-gray-50">
                        <td className="px-6 py-3">
                          <div className="flex items-center">
                            <span className="font-medium">{new Date(record.date).toLocaleDateString('hi-IN')}</span>
                            <span className="ml-2 text-sm text-gray-500">
                              {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short' })}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-3">{record.class_name}</td>
                        <td className="px-6 py-3">{record.subject_name}</td>
                        <td className="px-6 py-3">
                          <div className="flex items-center">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(record.status)}`}>
                              {getStatusIcon(record.status)} {record.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <span className="text-gray-600">{record.notes || '-'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Calendar View */}
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h3 className="text-lg font-semibold mb-4">Monthly Overview / मासिक अवलोक</h3>
              <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, dayIndex) => (
                  <div key={day} className="text-center">
                    <div className="text-xs font-medium text-gray-600 mb-2">{day}</div>
                    <div className="space-y-1">
                      {Array.from({ length: 5 }, (_, i) => {
                        const date = new Date();
                        date.setDate(date.getDate() - date.getDay() + dayIndex + i * 7);
                        const dateStr = date.toISOString().split('T')[0];
                        const record = records.find(r => r.date === dateStr);
                        
                        return (
                          <div
                            key={i}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                              record 
                                ? getStatusColor(record.status)
                                : 'bg-gray-100 text-gray-400'
                            }`}
                            title={record ? `${record.subject_name} - ${record.status}` : 'No record'}
                          >
                            {record ? getStatusIcon(record.status) : date.getDate()}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002-2v2a2 2 0 002 2h2a2 2 0 002-2V9a2 2 0 00-2-2h-2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No attendance records found / कोई उपस्थिति रिकॉर्ड नहीं मिला</h3>
            <p className="text-gray-600">Your attendance hasn't been recorded yet. / आपकी उपस्थिति अभी रिकॉर्ड नहीं की गई है।</p>
          </div>
        )}
      </main>
    </div>
  );
}
