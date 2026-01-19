'use client';

import { useState, useEffect } from 'react';
import Notification from '@/components/Notification';
import ConfirmModal from '@/components/ConfirmModal';

export default function ManageClasses() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({ name: '', grade_level: '', teacher_id: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [notification, setNotification] = useState({ type: '', message: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [classesRes, teachersRes] = await Promise.all([
        fetch('/api/admin/classes'),
        fetch('/api/admin/users')
      ]);

      if (classesRes.ok) {
        const classesData = await classesRes.json();
        setClasses(classesData);
      }

      if (teachersRes.ok) {
        const teachersData = await teachersRes.json();
        setTeachers(teachersData.filter(t => t.role === 'teacher'));
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to load data: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (classItem) => {
    setEditingClass(classItem);
    setFormData({
      name: classItem.name,
      grade_level: classItem.grade_level.toString(),
      teacher_id: classItem.teacher_id ? classItem.teacher_id.toString() : ''
    });
    setShowAddForm(true);
  };

  const handleDeleteClick = (classItem) => {
    setDeleteConfirm(classItem);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    const classId = deleteConfirm.id;
    setDeleteConfirm(null);

    try {
      const response = await fetch(`/api/admin/classes/${classId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotification({ type: 'success', message: 'Class deleted successfully!' });
        fetchData();
      } else {
        const error = await response.json();
        setNotification({ type: 'error', message: error.error || 'Failed to delete class' });
      }
    } catch (error) {
      setNotification({ type: 'error', message: error.message || 'Error deleting class' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.grade_level) {
      setNotification({ type: 'error', message: 'Name and grade level are required' });
      return;
    }

    const gradeLevel = parseInt(formData.grade_level);
    if (isNaN(gradeLevel) || gradeLevel < 1 || gradeLevel > 12) {
      setNotification({ type: 'error', message: 'Grade level must be between 1 and 12' });
      return;
    }

    try {
      const url = editingClass ? `/api/admin/classes/${editingClass.id}` : '/api/admin/classes';
      const method = editingClass ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          grade_level: gradeLevel,
          teacher_id: formData.teacher_id || null
        })
      });

      if (response.ok) {
        setNotification({ 
          type: 'success', 
          message: editingClass ? 'Class updated successfully!' : 'Class created successfully!' 
        });
        setShowAddForm(false);
        setEditingClass(null);
        setFormData({ name: '', grade_level: '', teacher_id: '' });
        fetchData();
      } else {
        const error = await response.json();
        setNotification({ type: 'error', message: error.error || 'Failed to save class' });
      }
    } catch (error) {
      setNotification({ type: 'error', message: error.message || 'Error saving class' });
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Manage Classes</h1>
            <button
              onClick={() => {
                setShowAddForm(true);
                setEditingClass(null);
                setFormData({ name: '', grade_level: '', teacher_id: '' });
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Add New Class
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Add/Edit Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">
                {editingClass ? 'Edit Class' : 'Create New Class'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g., Grade 10A"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Grade Level</label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={formData.grade_level}
                      onChange={(e) => setFormData({...formData, grade_level: e.target.value})}
                      placeholder="1-12"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Class Teacher (Optional)</label>
                    <select
                      value={formData.teacher_id}
                      onChange={(e) => setFormData({...formData, teacher_id: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">No teacher assigned</option>
                      {teachers.map(teacher => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.name} ({teacher.email})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Note: You can also assign classes to teachers via the Assignments page
                    </p>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingClass(null);
                      setFormData({ name: '', grade_level: '', teacher_id: '' });
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    {editingClass ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Classes List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium">Class Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Grade Level</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Class Teacher</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Students</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {classes.length > 0 ? (
                classes.map((classItem) => (
                  <tr key={classItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium">{classItem.name}</td>
                    <td className="px-6 py-3">Grade {classItem.grade_level}</td>
                    <td className="px-6 py-3">
                      {classItem.teacher_name ? (
                        <span className="text-gray-700">{classItem.teacher_name}</span>
                      ) : (
                        <span className="text-gray-400 italic">No teacher assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {classItem.student_count || 0} students
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <button
                        onClick={() => handleEdit(classItem)}
                        className="text-indigo-600 hover:text-indigo-900 font-medium mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(classItem)}
                        className="text-red-600 hover:text-red-900 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No classes found. Create your first class!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
        title="Delete Class"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone. Make sure there are no students enrolled or timetable entries for this class.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm(null)}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="bg-red-600"
      />
    </div>
  );
}

