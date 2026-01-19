'use client';

import { useState, useEffect } from 'react';

export default function Timetable() {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      const response = await fetch('/api/student/timetable');
      if (response.ok) {
        const data = await response.json();
        setTimetable(data);
      }
    } catch (error) {
      console.error('Failed to fetch timetable:', error);
    } finally {
      setLoading(false);
    }
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const groupedByDay = days.reduce((acc, day) => {
    acc[day] = timetable.filter(t => t.day_of_week === day);
    return acc;
  }, {});

  const getTimeSlotColor = (startTime) => {
    const hour = parseInt(startTime.split(':')[0]);
    if (hour < 10) return 'bg-blue-50 border-blue-200';
    if (hour < 12) return 'bg-green-50 border-green-200';
    if (hour < 14) return 'bg-yellow-50 border-yellow-200';
    if (hour < 16) return 'bg-orange-50 border-orange-200';
    return 'bg-purple-50 border-purple-200';
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">My Timetable</h1>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm font-medium">Total Classes</div>
            <div className="text-3xl font-bold text-indigo-600 mt-2">{timetable.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm font-medium">Classes This Week</div>
            <div className="text-3xl font-bold text-green-600 mt-2">{timetable.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-500 text-sm font-medium">Subjects</div>
            <div className="text-3xl font-bold text-purple-600 mt-2">
              {[...new Set(timetable.map(t => t.subject))].length}
            </div>
          </div>
        </div>

        {/* Timetable Grid */}
        <div className="grid gap-6">
          {days.map(day => (
            <div key={day} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 font-semibold flex justify-between items-center">
                <span>{day}</span>
                <span className="text-sm bg-white bg-opacity-20 px-2 py-1 rounded">
                  {groupedByDay[day].length} classes
                </span>
              </div>
              {groupedByDay[day].length > 0 ? (
                <div className="p-4 space-y-3">
                  {groupedByDay[day]
                    .sort((a, b) => a.start_time.localeCompare(b.start_time))
                    .map((slot, idx) => (
                    <div 
                      key={idx} 
                      className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${getTimeSlotColor(slot.start_time)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <div className="w-3 h-3 bg-indigo-600 rounded-full mr-3"></div>
                            <h3 className="font-semibold text-gray-800 text-lg">{slot.subject}</h3>
                          </div>
                          <div className="ml-6 space-y-1">
                            <div className="flex items-center text-gray-600">
                              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              {slot.teacher}
                            </div>
                            <div className="flex items-center text-gray-600">
                              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              {slot.room || 'No room assigned'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-2xl font-bold text-gray-800">{slot.start_time}</div>
                          <div className="text-sm text-gray-600">to {slot.end_time}</div>
                          <div className="mt-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              parseInt(slot.start_time.split(':')[0]) < 12 ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                            }`}>
                              {parseInt(slot.start_time.split(':')[0]) < 12 ? 'Morning' : 'Afternoon'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-8 text-center">
                  <div className="text-gray-400 mb-2">
                    <svg className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-600">No classes scheduled</p>
                  <p className="text-sm text-gray-500 mt-1">Enjoy your free time!</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-left">
              <div className="text-indigo-600 mb-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="font-medium">Export Schedule</div>
              <div className="text-sm text-gray-600">Download your timetable</div>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-left">
              <div className="text-green-600 mb-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div className="font-medium">Set Reminders</div>
              <div className="text-sm text-gray-600">Get class notifications</div>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-left">
              <div className="text-purple-600 mb-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="font-medium">Study Materials</div>
              <div className="text-sm text-gray-600">Access subject resources</div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
