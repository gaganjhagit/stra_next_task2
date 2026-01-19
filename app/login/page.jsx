'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role }),
        credentials: 'include',
      });

      const contentType = response.headers.get('content-type') || '';
      
      if (!contentType.includes('application/json')) {
        const text = await response.text();
        console.error('API returned non-JSON response', { status: response.status });
        throw new Error('API endpoint error. Please check your server.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (data.user && data.user.role) {
        // Redirect based on role
        setTimeout(() => {
          router.push(`/${data.user.role}/dashboard`);
        }, 100);
        return;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            School Management Portal
          </h1>
          <h2 className="text-xl text-gray-600">
            विद्यालय प्रबंधन प्रवेश / School Management Portal
          </h2>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Select Role / भूमित चुनें
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="student">Student / छात्र</option>
                <option value="teacher">Teacher / शिक्षक</option>
                <option value="admin">Admin / व्यवस्थ</option>
              </select>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address / ईमेल पता
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="your.email@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password / पासवर्ड
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="••••••••"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0h2.938c.702 0 1.34.277 1.813.619l.877 4.023c.098.112.176.176h2.854c.586 0-1.043-.098 1.426-.277l-.877 4.023c.098.112-.176.176H4.938c.702 0 1.34.277 1.813.619L2.248 7.677C2.15 7.565 2 7.447 2 7.187V0h2.938c.702 0 1.34.277 1.813.619L6.877 4.023c.098.112-.176.176H4.938c.702 0 1.043-.098 1.426-.277l-.877 4.023c.098.112-.176.176H4.938c.702 0 1.34.277 1.813.619L2.248 7.677z"></path>
                    </svg>
                    Signing in... / लॉग इन हो रहा है...
                  </div>
                ) : (
                  <span className="flex items-center">
                    Sign In / लॉग इन करें
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Quick Access Cards */}
        <div className="mt-6">
          <h3 className="text-center text-lg font-medium text-gray-600 mb-4">
            Quick Access / त्वरित पहुँच
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
              <h4 className="font-medium text-blue-800">Student / छात्र</h4>
              <p className="text-sm text-gray-600 mt-1">student1@school.com</p>
              <p className="text-xs text-gray-500">password123</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
              <h4 className="font-medium text-green-800">Teacher / शिक्षक</h4>
              <p className="text-sm text-gray-600 mt-1">teacher1@school.com</p>
              <p className="text-xs text-gray-500">password123</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
              <h4 className="font-medium text-red-800">Admin / व्यवस्थ</h4>
              <p className="text-sm text-gray-600 mt-1">admin@school.com</p>
              <p className="text-xs text-gray-500">password123</p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Select your role and enter credentials to access the portal.
          </p>
          <p className="text-sm text-gray-600">
            अपना भूमित चुनकर क्रेडेंशल्स दर्ज करें और प्रवेश करने के लिए प्रवेश करें।
          </p>
        </div>
      </div>
    </div>
  );
}
