'use client';

import { useState, useEffect } from 'react';
import Notification from '@/components/Notification';
import ConfirmModal from '@/components/ConfirmModal';

export default function TeacherClassAssignments() {
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [teacherAssignments, setTeacherAssignments] = useState({});
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ type: '', message: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignFormData, setAssignFormData] = useState({
    teacherId: '',
    classId: '',
    subjectId: '',
    dayOfWeek: 'Monday',
    startTime: '09:00',
    endTime: '10:00',
    room: ''
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Fetch all assignments when component loads or when teacher selection changes
    const fetchAllAssignments = async () => {
      try {
        const response = await fetch('/api/admin/assignments');
        if (response.ok) {
          const data = await response.json();
          setTeacherAssignments(data);
        }
      } catch (error) {
        console.error('Failed to fetch assignments:', error);
      }
    };
    fetchAllAssignments();
  }, [selectedTeacher]);

  const fetchData = async () => {
    try {
      const [teachersRes, classesRes, subjectsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/classes'),
        fetch('/api/admin/subjects')
      ]);

      if (teachersRes.ok) {
        const teachersData = await teachersRes.json();
        setTeachers(teachersData.filter(t => t.role === 'teacher'));
      }

      if (classesRes.ok) {
        const classesData = await classesRes.json();
        setClasses(classesData);
      }

      if (subjectsRes.ok) {
        const subjectsData = await subjectsRes.json();
        setSubjects(subjectsData);
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to load data: ' + error.message });
    } finally {
      setLoading(false);
    }
  };


  const handleAssignClass = async () => {
    if (!assignFormData.teacherId || !assignFormData.classId || !assignFormData.subjectId) {
      setNotification({ type: 'error', message: 'Please select teacher, class, and subject' });
      return;
    }

    if (assignFormData.startTime >= assignFormData.endTime) {
      setNotification({ type: 'error', message: 'End time must be after start time' });
      return;
    }

    try {
      const response = await fetch('/api/admin/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignFormData)
      });

      if (response.ok) {
        setNotification({ type: 'success', message: 'Class assigned successfully!' });
        setShowAssignModal(false);
        setAssignFormData({
          teacherId: '',
          classId: '',
          subjectId: '',
          dayOfWeek: 'Monday',
          startTime: '09:00',
          endTime: '10:00',
          room: ''
        });
        // Refresh assignments
        const refreshResponse = await fetch('/api/admin/assignments');
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          setTeacherAssignments(refreshData);
        }
      } else {
        const error = await response.json();
        setNotification({ type: 'error', message: error.error || 'Failed to assign class' });
      }
    } catch (error) {
      setNotification({ type: 'error', message: error.message || 'Error assigning class' });
    }
  };

  const handleDeleteClick = (assignmentId) => {
    setDeleteConfirm(assignmentId);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    const assignmentId = deleteConfirm;
    setDeleteConfirm(null);

    try {
      const response = await fetch(`/api/admin/assignments/${assignmentId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setNotification({ type: 'success', message: 'Assignment removed successfully!' });
        // Refresh assignments
        const refreshResponse = await fetch('/api/admin/assignments');
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          setTeacherAssignments(refreshData);
        }
      } else {
        const error = await response.json();
        setNotification({ type: 'error', message: error.error || 'Failed to remove assignment' });
      }
    } catch (error) {
      setNotification({ type: 'error', message: error.message || 'Error removing assignment' });
    }
  };

  const getTeacherClasses = (teacherId) => {
    return teacherAssignments[teacherId] || [];
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Teacher-Class Assignments</h1>
            <button
              onClick={() => setShowAssignModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Assign Class to Teacher
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Teacher Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Teacher to View Assignments
          </label>
          <select
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Teachers</option>
            {teachers.map(teacher => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name} ({teacher.email})
              </option>
            ))}
          </select>
        </div>

        {/* Assignments Display */}
        {selectedTeacher ? (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              Classes Assigned to {teachers.find(t => t.id === parseInt(selectedTeacher))?.name}
            </h2>
            {getTeacherClasses(selectedTeacher).length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium">Class</th>
                      <th className="px-6 py-3 text-left text-sm font-medium">Subject</th>
                      <th className="px-6 py-3 text-left text-sm font-medium">Day</th>
                      <th className="px-6 py-3 text-left text-sm font-medium">Time</th>
                      <th className="px-6 py-3 text-left text-sm font-medium">Room</th>
                      <th className="px-6 py-3 text-left text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {getTeacherClasses(selectedTeacher).map((assignment) => (
                      <tr key={assignment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3">{assignment.class_name}</td>
                        <td className="px-6 py-3">{assignment.subject_name}</td>
                        <td className="px-6 py-3">{assignment.day_of_week}</td>
                        <td className="px-6 py-3">{assignment.start_time} - {assignment.end_time}</td>
                        <td className="px-6 py-3">{assignment.room || '-'}</td>
                        <td className="px-6 py-3">
                          <button
                            onClick={() => handleDeleteClick(assignment.id)}
                            className="text-red-600 hover:text-red-900 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600">No classes assigned yet.</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teachers.map(teacher => {
              const assignments = getTeacherClasses(teacher.id);
              return (
                <div key={teacher.id} className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-2">{teacher.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{teacher.email}</p>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Classes Assigned:</span>{' '}
                      <span className="text-indigo-600">{assignments.length}</span>
                    </div>
                    <button
                      onClick={() => setSelectedTeacher(teacher.id.toString())}
                      className="text-sm text-indigo-600 hover:text-indigo-900"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Assign Class to Teacher</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
                <select
                  value={assignFormData.teacherId}
                  onChange={(e) => setAssignFormData({...assignFormData, teacherId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select a teacher</option>
                  {teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                <select
                  value={assignFormData.classId}
                  onChange={(e) => setAssignFormData({...assignFormData, classId: e.target.value})}
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
                  value={assignFormData.subjectId}
                  onChange={(e) => setAssignFormData({...assignFormData, subjectId: e.target.value})}
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
                  value={assignFormData.dayOfWeek}
                  onChange={(e) => setAssignFormData({...assignFormData, dayOfWeek: e.target.value})}
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
                    value={assignFormData.startTime}
                    onChange={(e) => setAssignFormData({...assignFormData, startTime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={assignFormData.endTime}
                    onChange={(e) => setAssignFormData({...assignFormData, endTime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room (Optional)</label>
                <input
                  type="text"
                  value={assignFormData.room}
                  onChange={(e) => setAssignFormData({...assignFormData, room: e.target.value})}
                  placeholder="Room number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowAssignModal(false);
                  setAssignFormData({
                    teacherId: '',
                    classId: '',
                    subjectId: '',
                    dayOfWeek: 'Monday',
                    startTime: '09:00',
                    endTime: '10:00',
                    room: ''
                  });
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssignClass}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      <Notification
        type={notification.type}
        message={notification.message}
        onClose={() => setNotification({ type: '', message: '' })}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm !== null}
        title="Remove Assignment"
        message="Are you sure you want to remove this class assignment? This will also remove the timetable entry."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm(null)}
        confirmText="Remove"
        cancelText="Cancel"
        confirmColor="bg-red-600"
      />
    </div>
  );
}

