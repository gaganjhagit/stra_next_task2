'use client';

import { useState } from 'react';

export default function BulkUpload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
      setMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a CSV file');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/bulk-upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setMessage(`✅ Successfully uploaded ${data.successCount} users`);
      setResults(data);
      setFile(null);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
      <h2 className="text-xl font-semibold mb-4">Upload CSV File</h2>

      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Select CSV File</label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
          <p className="text-sm text-gray-600 mt-2">
            CSV Format: <code className="bg-gray-100 px-2 py-1 rounded">name,email,password,role</code>
          </p>
          <p className="text-xs text-gray-500 mt-1">Roles: student or teacher</p>
        </div>

        {file && (
          <div className="bg-blue-50 border border-blue-200 p-3 rounded">
            <p className="text-sm">
              <strong>Selected file:</strong> {file.name}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !file}
          className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Uploading...' : 'Upload Users'}
        </button>
      </form>

      {results && (
        <div className="mt-6 pt-6 border-t">
          <h3 className="font-semibold mb-3">Upload Results</h3>
          <div className="space-y-2 text-sm">
            <p>✅ Successfully added: <strong>{results.successCount}</strong></p>
            {results.failedCount > 0 && (
              <p>❌ Failed: <strong>{results.failedCount}</strong></p>
            )}
            {results.failed && results.failed.length > 0 && (
              <div className="mt-3 bg-yellow-50 p-3 rounded">
                <p className="font-semibold mb-2">Failed records:</p>
                <ul className="text-xs space-y-1">
                  {results.failed.map((item, idx) => (
                    <li key={idx}>
                      Row {item.row}: {item.email} - {item.reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-8 bg-gray-50 p-4 rounded">
        <h3 className="font-semibold mb-2">Example CSV Format</h3>
        <pre className="text-xs bg-white p-3 rounded border overflow-auto">
{`name,email,password,role
John Doe,john@school.com,password123,student
Jane Smith,jane@school.com,password123,teacher
Bob Wilson,bob@school.com,password123,student`}
        </pre>
      </div>
    </div>
  );
}
