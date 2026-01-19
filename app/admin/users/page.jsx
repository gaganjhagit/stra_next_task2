'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Notification from '@/components/Notification';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [popup, setPopup] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role
    });
    setShowAddForm(true);
  };

  const handleAddNew = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', password: '', role: 'student' });
    setShowAddForm(true);
  };

  const handleDeleteClick = (user) => {
    setDeleteConfirm(user);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    const userId = deleteConfirm.id;
    console.log('Attempting to delete user ID:', userId);
    setDeleteConfirm(null);

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Delete response status:', response.status);
      const data = await response.json();
      console.log('Delete response data:', data);

      if (response.ok) {
        // Refresh immediately
        await fetchUsers();
        setPopup({ type: 'success', message: 'User deleted successfully' });
      } else {
        setPopup({ type: 'error', message: data.error || 'Failed to delete user' });
      }
    } catch (error) {
      console.error('Delete error:', error);
      setPopup({ type: 'error', message: error.message || 'Error deleting user' });
    }
  };

  const handleClosePopup = () => {
    setPopup(null);
    // Refresh data after popup closes to ensure latest data
    fetchUsers();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.role) {
      setNotification({ type: 'error', message: 'Name, email, and role are required' });
      return;
    }

    // If creating new user, password is required
    if (!editingUser && !formData.password) {
      setNotification({ type: 'error', message: 'Password is required for new users' });
      return;
    }

    try {
      if (editingUser) {
        // Update existing user
        const response = await fetch(`/api/admin/users/${editingUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          setEditingUser(null);
          setShowAddForm(false);
          setFormData({ name: '', email: '', password: '', role: 'student' });
          fetchUsers();
          setNotification({ type: 'success', message: 'User updated successfully!' });
        } else {
          const error = await response.json();
          setNotification({ type: 'error', message: error.error || 'Failed to update user' });
        }
      } else {
        // Create new user
        const response = await fetch('/api/admin/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          setShowAddForm(false);
          setFormData({ name: '', email: '', password: '', role: 'student' });
          fetchUsers();
          setNotification({ type: 'success', message: 'User created successfully!' });
        } else {
          const error = await response.json();
          setNotification({ type: 'error', message: error.error || 'Failed to create user' });
        }
      }
    } catch (error) {
      setNotification({ type: 'error', message: error.message || 'Error saving user' });
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
            <h1 className="text-2xl font-bold">Manage Users</h1>
            <button
              onClick={handleAddNew}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Add New User
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium">Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Email</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Role</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3">{u.name}</td>
                  <td className="px-6 py-3">{u.email}</td>
                  <td className="px-6 py-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      u.role === 'student' ? 'bg-blue-100 text-blue-800' :
                      u.role === 'teacher' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <button 
                      onClick={() => handleEdit(u)}
                      className="text-indigo-600 hover:text-indigo-900 font-medium"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(u)}
                      className="ml-4 text-red-600 hover:text-red-900 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4 text-red-600">Confirm Delete</h2>
              <p className="mb-6 text-gray-700">
                Are you sure you want to delete <strong>{deleteConfirm.name}</strong> ({deleteConfirm.email})?
                This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success/Error Popup Modal */}
        {popup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className={`flex items-center mb-4 ${popup.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {popup.type === 'success' ? (
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <h2 className="text-xl font-bold">
                  {popup.type === 'success' ? 'Success' : 'Error'}
                </h2>
              </div>
              <p className="mb-6 text-gray-700">{popup.message}</p>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleClosePopup}
                  className={`px-4 py-2 text-white rounded-md ${
                    popup.type === 'success' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {editingUser ? 'Password (leave empty to keep current)' : 'Password *'}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required={!editingUser}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingUser(null);
                      setFormData({ name: '', email: '', password: '', role: 'student' });
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    {editingUser ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Notification */}
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification({ type: '', message: '' })}
        />
      </main>
    </div>
  );
}
