'use client';

import { useState, useEffect } from 'react';

export default function ReportCard() {
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, []);

  const downloadReportCard = async () => {
    setDownloading(true);
    try {
      const response = await fetch('/api/student/report-card');
      if (response.ok) {
        // Get the blob from response
        const blob = await response.blob();
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-card-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        alert('Report card downloaded successfully! / रिपोर्ट कार्ड सफलतापूर्वक अपलोड हो गई!');
      } else {
        const error = await response.json();
        alert('Failed to download report card: ' + error.error);
      }
    } catch (error) {
      alert('Error downloading report card: ' + error.message);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Report Card / रिपोर्ट कार्ड</h1>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-8 text-white">
            <div className="text-center">
              <div className="mb-4">
                <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold mb-2">Download Your Report Card</h2>
              <p className="text-xl mb-6">अपना रिपोर्ट कार्ड डाउनलोड करें</p>
              <button
                onClick={downloadReportCard}
                disabled={downloading}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0h2.938c.702 0 1.34.277 1.813.619l.877 4.023c.098.112.176.176h2.854c.586 0 1.043-.098 1.426-.277l.877-4.023c.098-.112.176-.176h2.854c-.586 0-1.043.098-1.426.277l-.877 4.023c-.098.112-.176.176H4.938c-.702 0-1.34-.277-1.813-.619L2.248 7.677C2.15 7.565 2 7.447 2 7.187V0h2.938c.702 0 1.34.277 1.813.619L6.877 4.023c-.098-.112-.176-.176H3.938c-.586 0-1.043.098-1.426.277l-.877 4.023c-.098.112-.176.176H4.938c.702 0 1.34.277 1.813.619L7.877 4.023c.098.112.176.176h2.854c.586 0 1.043-.098 1.426-.277l.877-4.023c.098-.112.176.176H4.938c-.702 0-1.34-.277-1.813-.619L2.248 7.677C2.15 7.565 2 7.447 2 7.187V0h2.938c.702 0 1.34.277 1.813.619L6.877 4.023c-.098-.112-.176-.176H3.938c-.586 0-1.043.098-1.426.277l-.877 4.023c-.098.112-.176.176H4.938c.702 0 1.34.277 1.813.619L7.877 4.023c.098.112.176.176h2.854c.586 0 1.043-.098 1.426-.277l.877-4.023c.098.112.176.176H4.938c.702 0 1.34-.277-1.813-.619L2.248 7.677z"></path>
                    </svg>
                    Downloading... / डाउनलोड हो रहा है...
                  </>
                ) : (
                  <>
                    <svg className="-ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l-3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download PDF / PDF डाउनलोड करें
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-blue-600 mb-4">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v1a1 1 0 001 1h4a1 1 0 001-1v-1m3-3H8a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V9a2 2 0 00-2-2H6a2 2 0 00-2 2v2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Complete Grades</h3>
              <p className="text-gray-600">All subjects with detailed performance metrics</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-green-600 mb-4">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Attendance Summary</h3>
              <p className="text-gray-600">Year-long attendance statistics</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-purple-600 mb-4">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h1m1-4h1m1-4h1M3 21h18M5 21H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Professional Format</h3>
              <p className="text-gray-600">Print-ready PDF document</p>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-3">Important Notes / महत्वपूर्ण बातें</h3>
            <ul className="list-disc list-inside space-y-2 text-yellow-800">
              <li>Report card includes all grades and attendance data / रिपोर्ट कार्ड में सभी ग्रेड और उपस्थिति डेटा शामिल है</li>
              <li>PDF is automatically generated with current data / PDF वर्तमान डेटा के साथ स्वचालित रूप से जेनरेट होता है</li>
              <li>Save the PDF for your records / अपने रिकॉर्ड के लिए PDF को सेव करें</li>
              <li>Contact teachers if you see any errors / यदि आपको कोई त्रुटि दिखाई देती है, तो अपने शिक्षकों से संपर्क करें</li>
            </ul>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions / त्वरित कार्य</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-left">
                <div className="text-indigo-600 mb-2">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div className="font-medium">Email Report Card</div>
                <div className="text-sm text-gray-600">Send to parents/guardians</div>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-left">
                <div className="text-green-600 mb-2">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.768 9 12.5c0-.737.33-1.312.744-1.312h8c0 1.105.695 2 1.5 2s1.5-.895 1.5-2V7c0-.268-.105-.525-.294-.687C19.124 4.74 18.631 4 18 4c-.737 0-1.312.33-1.312.744V7c0 1.105.695 2 1.5 2s1.5-.895 1.5-2v-.25M8.684 13.342C8.886 12.938 9 12.768 9 12.5c0-.737.33-1.312.744-1.312h8c0 1.105.695 2 1.5 2s1.5-.895 1.5-2V7c0-.268-.105-.525-.294-.687C19.124 4.74 18.631 4 18 4c-.737 0-1.312.33-1.312.744V7c0 1.105.695 2 1.5 2s1.5-.895 1.5-2v-.25z" />
                  </svg>
                </div>
                <div className="font-medium">Print Report Card</div>
                <div className="text-sm text-gray-600">Get physical copy</div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
