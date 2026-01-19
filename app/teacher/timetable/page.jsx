'use client';

import { useState, useEffect } from 'react';
import Notification from '@/components/Notification';
import ConfirmModal from '@/components/ConfirmModal';
import TeacherNav from '@/components/TeacherNav';

export default function TeacherTimetable() {
  const [timetable, setTimetable] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [formData, setFormData] = useState({
    classId: '',
    subjectId: '',
    dayOfWeek: 'Monday',
    startTime: '',
    endTime: '',
    room: ''
  });
  const [notification, setNotification] = useState({ type: '', message: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    fetchTimetable();
    fetchClassesAndSubjects();
  }, []);

  const fetchTimetable = async () => {
    try {
      const response = await fetch('/api/teacher/timetable');
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

  const fetchClassesAndSubjects = async () => {
    try {
      // Get classes from grades API (reusing existing endpoint)
      const gradesResponse = await fetch('/api/teacher/grades');
      if (gradesResponse.ok) {
        const gradesData = await gradesResponse.json();
        setClasses(gradesData.classes);
        setSubjects(gradesData.subjects);
      }
    } catch (error) {
      console.error('Failed to fetch classes and subjects:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate time
    if (formData.startTime >= formData.endTime) {
      setNotification({ type: 'error', message: 'End time must be after start time' });
      return;
    }
    
    const url = editingEntry ? `/api/teacher/timetable/${editingEntry.id}` : '/api/teacher/timetable';
    const method = editingEntry ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setNotification({ 
          type: 'success', 
          message: editingEntry ? 'Timetable updated successfully!' : 'Timetable entry added successfully!' 
        });
        setShowAddForm(false);
        setEditingEntry(null);
        setFormData({
          classId: '',
          subjectId: '',
          dayOfWeek: 'Monday',
          startTime: '',
          endTime: '',
          room: ''
        });
        fetchTimetable();
      } else {
        const error = await response.json();
        setNotification({ type: 'error', message: error.error || 'Failed to save timetable' });
      }
    } catch (error) {
      setNotification({ type: 'error', message: error.message || 'Error saving timetable' });
    }
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setFormData({
      classId: entry.class_id.toString(),
      subjectId: entry.subject_id.toString(),
      dayOfWeek: entry.day_of_week,
      startTime: entry.start_time,
      endTime: entry.end_time,
      room: entry.room || ''
    });
    setShowAddForm(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteConfirm(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    const id = deleteConfirm;
    setDeleteConfirm(null);

    try {
      const response = await fetch(`/api/teacher/timetable/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotification({ type: 'success', message: 'Timetable entry deleted successfully!' });
        fetchTimetable();
      } else {
        const error = await response.json();
        setNotification({ type: 'error', message: error.error || 'Failed to delete timetable' });
      }
    } catch (error) {
      setNotification({ type: 'error', message: error.message || 'Error deleting timetable' });
    }
  };

  const groupedByDay = days.reduce((acc, day) => {
    acc[day] = timetable.filter(t => t.day_of_week === day);
    return acc;
  }, {});

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">My Timetable / मेरा समय सारणी</h1>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Add Entry / प्रविष्टि जोड़ें
            </button>
          </div>
        </div>
      </nav>
      <TeacherNav />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Add/Edit Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {editingEntry ? 'Edit Timetable Entry' : 'Add Timetable Entry'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                    <select
                      value={formData.classId}
                      onChange={(e) => setFormData({...formData, classId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Select a class</option>
                      {classes.map(cls => (
                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <select
                      value={formData.subjectId}
                      onChange={(e) => setFormData({...formData, subjectId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Select a subject</option>
                      {subjects.map(subject => (
                        <option key={subject.id} value={subject.id}>{subject.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                    <select
                      value={formData.dayOfWeek}
                      onChange={(e) => setFormData({...formData, dayOfWeek: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      {days.map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                      <input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                      <input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Room (Optional)</label>
                    <input
                      type="text"
                      value={formData.room}
                      onChange={(e) => setFormData({...formData, room: e.target.value})}
                      placeholder="Room number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingEntry(null);
                      setFormData({
                        classId: '',
                        subjectId: '',
                        dayOfWeek: 'Monday',
                        startTime: '',
                        endTime: '',
                        room: ''
                      });
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    {editingEntry ? 'Update' : 'Add'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Timetable Display */}
        <div className="grid gap-6">
          {days.map(day => (
            <div key={day} className="bg-white rounded-lg shadow">
              <div className="bg-indigo-600 text-white px-6 py-3 font-semibold flex justify-between items-center">
                <span>{day}</span>
                <span className="text-sm bg-white bg-opacity-20 px-2 py-1 rounded">
                  {groupedByDay[day].length} classes
                </span>
              </div>
              {groupedByDay[day].length > 0 ? (
                <div className="divide-y">
                  {groupedByDay[day].map((entry) => (
                    <div key={entry.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">{entry.subject_name}</div>
                        <div className="text-sm text-gray-600">Class: {entry.class_name}</div>
                        {entry.room && <div className="text-sm text-gray-600">Room: {entry.room}</div>}
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-800">{entry.start_time} - {entry.end_time}</div>
                        <div className="flex space-x-2 mt-1">
                          <button
                            onClick={() => handleEdit(entry)}
                            className="text-indigo-600 hover:text-indigo-900 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(entry.id)}
                            className="text-red-600 hover:text-red-900 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-4 text-gray-600">No classes scheduled</div>
              )}
            </div>
          ))}
        </div>
      </main>
      
      {/* Notification */}
      <Notification
        type={notification.type}
        message={notification.message}
        onClose={() => setNotification({ type: '', message: '' })}
      />
      
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm !== null}
        title="Delete Timetable Entry"
        message="Are you sure you want to delete this timetable entry? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm(null)}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="bg-red-600"
      />
    </div>
  );
}
