'use client';

import { useState, useEffect } from 'react';
import Notification from '@/components/Notification';
import ConfirmModal from '@/components/ConfirmModal';

export default function ManageEnrollments() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState('');
  const [notification, setNotification] = useState({ type: '', message: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ studentId: '', classId: '' });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchEnrollments(selectedClass);
    } else {
      fetchAllEnrollments();
    }
  }, [selectedClass]);

  const fetchData = async () => {
    try {
      const [studentsRes, classesRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/classes')
      ]);

      if (studentsRes.ok) {
        const usersData = await studentsRes.json();
        setStudents(usersData.filter(u => u.role === 'student'));
      }

      if (classesRes.ok) {
        const classesData = await classesRes.json();
        setClasses(classesData);
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to load data: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollments = async (classId) => {
    try {
      const response = await fetch(`/api/admin/enrollments?classId=${classId}`);
      if (response.ok) {
        const data = await response.json();
        setEnrollments(data);
      }
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
    }
  };

  const fetchAllEnrollments = async () => {
    try {
      const response = await fetch('/api/admin/enrollments');
      if (response.ok) {
        const data = await response.json();
        setEnrollments(data);
      }
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
    }
  };

  const handleEnroll = async () => {
    if (!formData.studentId || !formData.classId) {
      setNotification({ type: 'error', message: 'Please select both student and class' });
      return;
    }

    try {
      const response = await fetch('/api/admin/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setNotification({ type: 'success', message: 'Student enrolled successfully!' });
        setShowAddForm(false);
        setFormData({ studentId: '', classId: '' });
        if (selectedClass) {
          fetchEnrollments(selectedClass);
        } else {
          fetchAllEnrollments();
        }
      } else {
        const error = await response.json();
        setNotification({ type: 'error', message: error.error || 'Failed to enroll student' });
      }
    } catch (error) {
      setNotification({ type: 'error', message: error.message || 'Error enrolling student' });
    }
  };

  const handleDeleteClick = (enrollment) => {
    setDeleteConfirm(enrollment);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    const enrollmentId = deleteConfirm.id;
    setDeleteConfirm(null);

    try {
      const response = await fetch(`/api/admin/enrollments/${enrollmentId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setNotification({ type: 'success', message: 'Student removed from class successfully!' });
        if (selectedClass) {
          fetchEnrollments(selectedClass);
        } else {
          fetchAllEnrollments();
        }
      } else {
        const error = await response.json();
        setNotification({ type: 'error', message: error.error || 'Failed to remove enrollment' });
      }
    } catch (error) {
      setNotification({ type: 'error', message: error.message || 'Error removing enrollment' });
    }
  };

  // Get students not enrolled in selected class
  const getAvailableStudents = () => {
    if (!selectedClass) return students;
    const enrolledStudentIds = enrollments.map(e => e.student_id);
    return students.filter(s => !enrolledStudentIds.includes(s.id));
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Manage Student Enrollments</h1>
            <button
              onClick={() => {
                setShowAddForm(true);
                setFormData({ studentId: '', classId: selectedClass || '' });
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Enroll Student
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Class Filter */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Class (or view all)
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Classes</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>

        {/* Enrollments List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h2 className="text-lg font-semibold">
              {selectedClass 
                ? `Students in ${classes.find(c => c.id === parseInt(selectedClass))?.name || 'Class'}`
                : 'All Enrollments'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {enrollments.length} {enrollments.length === 1 ? 'enrollment' : 'enrollments'}
            </p>
          </div>
          {enrollments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium">Student Name</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Class</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Enrolled Date</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {enrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 font-medium">{enrollment.student_name}</td>
                      <td className="px-6 py-3 text-gray-600">{enrollment.student_email}</td>
                      <td className="px-6 py-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {enrollment.class_name}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-gray-600">
                        {new Date(enrollment.enrolled_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3">
                        <button
                          onClick={() => handleDeleteClick(enrollment)}
                          className="text-red-600 hover:text-red-900 font-medium text-sm"
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
            <div className="px-6 py-8 text-center text-gray-500">
              {selectedClass 
                ? 'No students enrolled in this class yet.'
                : 'No enrollments found. Enroll students to get started!'}
            </div>
          )}
        </div>
      </main>

      {/* Add Enrollment Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Enroll Student in Class</h2>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                <select
                  value={formData.studentId}
                  onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select a student</option>
                  {getAvailableStudents().map(student => (
                    <option key={student.id} value={student.id}>
                      {student.name} ({student.email})
                    </option>
                  ))}
                </select>
                {selectedClass && getAvailableStudents().length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    All students are already enrolled in this class.
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({ studentId: '', classId: selectedClass || '' });
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEnroll}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Enroll
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
        title="Remove Student from Class"
        message={`Are you sure you want to remove ${deleteConfirm?.student_name} from ${deleteConfirm?.class_name}? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm(null)}
        confirmText="Remove"
        cancelText="Cancel"
        confirmColor="bg-red-600"
      />
    </div>
  );
}

