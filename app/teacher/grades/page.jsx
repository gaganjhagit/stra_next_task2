'use client';

import { useState, useEffect } from 'react';
import Notification from '@/components/Notification';
import ConfirmModal from '@/components/ConfirmModal';
import TeacherNav from '@/components/TeacherNav';

export default function TeacherGrades() {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [gradeData, setGradeData] = useState({});
  const [existingGrades, setExistingGrades] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'history'
  const [notification, setNotification] = useState({ type: '', message: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchClassesAndSubjects();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents(selectedClass);
      if (selectedSubject) {
        fetchExistingGrades(selectedClass, selectedSubject);
      }
    }
  }, [selectedClass, selectedSubject]);

  const fetchClassesAndSubjects = async () => {
    try {
      console.log('Fetching classes and subjects...');
      const response = await fetch('/api/teacher/grades');
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Classes and subjects data:', data);
        
        // If no classes from API, add sample classes for testing
        if (data.classes && data.classes.length === 0) {
          console.log('No classes found, adding sample classes...');
          data.classes = [
            { id: '1', name: 'Grade 10A' },
            { id: '2', name: 'Grade 10B' },
            { id: '3', name: 'Grade 11A' }
          ];
        }
        
        // If no subjects from API, add sample subjects for testing
        if (data.subjects && data.subjects.length === 0) {
          console.log('No subjects found, adding sample subjects...');
          data.subjects = [
            { id: '1', name: 'Mathematics' },
            { id: '2', name: 'English' },
            { id: '3', name: 'Science' },
            { id: '4', name: 'History' }
          ];
        }
        
        setClasses(data.classes || []);
        setSubjects(data.subjects || []);
      } else {
        const error = await response.json();
        console.error('Error response:', error);
        setNotification({ type: 'error', message: 'Failed to fetch classes and subjects: ' + error.error });
        setClasses([]);
        setSubjects([]);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setNotification({ type: 'error', message: 'Error fetching classes and subjects: ' + error.message });
      setClasses([]);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (classId) => {
    try {
      console.log('Fetching students for class:', classId);
      const response = await fetch(`/api/teacher/grades/students?classId=${classId}`);
      console.log('Students response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Students data:', data);
        setStudents(data);
        
        // Initialize grade data for each student
        const initialGradeData = {};
        data.forEach(student => {
          initialGradeData[student.id] = {
            grade: '',
            maxGrade: '100',
            gradeType: 'assignment',
            description: ''
          };
        });
        setGradeData(initialGradeData);
        console.log('Initial grade data:', initialGradeData);
      } else {
        const error = await response.json();
        console.error('Error fetching students:', error);
        setNotification({ type: 'error', message: 'Failed to fetch students: ' + error.error });
        setStudents([]);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
      setNotification({ type: 'error', message: 'Error fetching students: ' + error.message });
      setStudents([]);
    }
  };

  const fetchExistingGrades = async (classId, subjectId) => {
    try {
      const response = await fetch(`/api/teacher/grades/history?classId=${classId}&subjectId=${subjectId}`);
      if (response.ok) {
        const data = await response.json();
        setExistingGrades(data);
      }
    } catch (error) {
      console.error('Failed to fetch existing grades:', error);
    }
  };

  const handleGradeChange = (studentId, field, value) => {
    setGradeData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const uploadGrades = async () => {
    if (!selectedClass || !selectedSubject) {
      setNotification({ type: 'error', message: 'Please select both class and subject / कृपया कक्षा और विषय चुनें' });
      return;
    }

    console.log('Grade data before upload:', gradeData); // Debug log
    console.log('Students:', students); // Debug log

    // Validate all grades are filled
    const validGrades = students
      .filter(student => gradeData[student.id]?.grade)
      .map(student => ({
        studentId: student.id,
        grade: parseFloat(gradeData[student.id].grade),
        maxGrade: parseFloat(gradeData[student.id].maxGrade) || 100,
        gradeType: gradeData[student.id].gradeType,
        description: gradeData[student.id].description
      }));

    console.log('Valid grades to upload:', validGrades); // Debug log

    if (validGrades.length === 0) {
      setNotification({ type: 'error', message: 'Please enter at least one grade / कृपया कम से कम एक grade दर्ज करें' });
      return;
    }
    
    // Validate grade values
    for (const grade of validGrades) {
      if (grade.grade < 0 || grade.grade > grade.maxGrade) {
        setNotification({ type: 'error', message: `Invalid grade for student. Grade must be between 0 and ${grade.maxGrade}` });
        return;
      }
    }

    setUploading(true);
    try {
      const response = await fetch('/api/teacher/grades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classId: selectedClass,
          subjectId: selectedSubject,
          grades: validGrades
        }),
      });

      console.log('Upload response:', response); // Debug log

      if (response.ok) {
        const result = await response.json();
        const successCount = result.results.filter(r => r.success).length;
        setNotification({ 
          type: 'success', 
          message: `Grades successfully uploaded for ${successCount} student(s)! / ग्रेड सफलतापूर्वक अपलोड हो गए!` 
        });
        // Don't reset gradeData, keep existing data
        fetchExistingGrades(selectedClass, selectedSubject);
      } else {
        const error = await response.json();
        setNotification({ type: 'error', message: error.error || 'Failed to upload grades' });
      }
    } catch (error) {
      setNotification({ type: 'error', message: error.message || 'Error uploading grades' });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteClick = (gradeId) => {
    setDeleteConfirm(gradeId);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    const gradeId = deleteConfirm;
    setDeleteConfirm(null);

    try {
      const response = await fetch(`/api/teacher/grades/${gradeId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotification({ type: 'success', message: 'Grade deleted successfully! / ग्रेड सफलतापूर्वक हटा दिया गया!' });
        fetchExistingGrades(selectedClass, selectedSubject);
      } else {
        const error = await response.json();
        setNotification({ type: 'error', message: error.error || 'Failed to delete grade' });
      }
    } catch (error) {
      setNotification({ type: 'error', message: error.message || 'Error deleting grade' });
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Grade Management / ग्रेड प्रबंधन</h1>
        </div>
      </nav>
      <TeacherNav />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex">
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`py-2 px-6 border-b-2 font-medium text-sm ${
                    activeTab === 'upload'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Upload Grades / ग्रेड अपलोड करें
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`py-2 px-6 border-b-2 font-medium text-sm ${
                    activeTab === 'history'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Grade History / ग्रेड इतिहास
                </button>
              </nav>
            </div>
          </div>

          {activeTab === 'upload' && (
            <>
              {/* Selection Controls */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Class / कक्षा</label>
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select a class / कक्षा चुनें</option>
                      {classes.length > 0 ? (
                        classes.map(cls => (
                          <option key={cls.id} value={cls.id}>{cls.name}</option>
                        ))
                      ) : (
                        <option value="" disabled>No classes available / कोई कक्षा उपलब्ध नहीं</option>
                      )}
                    </select>
                    {classes.length === 0 && (
                      <p className="text-xs text-red-600 mt-1">No classes found. Please check your teacher assignments.</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject / विषय</label>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select a subject / विषय चुनें</option>
                      {subjects.length > 0 ? (
                        subjects.map(subject => (
                          <option key={subject.id} value={subject.id}>{subject.name}</option>
                        ))
                      ) : (
                        <option value="" disabled>No subjects available / कोई विषय उपलब्ध नहीं</option>
                      )}
                    </select>
                    {subjects.length === 0 && (
                      <p className="text-xs text-red-600 mt-1">No subjects found. Please contact admin.</p>
                    )}
                  </div>
                </div>


                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    onClick={() => {
                      const newGradeData = {};
                      students.forEach(student => {
                        newGradeData[student.id] = {
                          ...gradeData[student.id],
                          grade: '85',
                          maxGrade: '100',
                          gradeType: 'assignment'
                        };
                      });
                      setGradeData(newGradeData);
                    }}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 text-sm"
                  >
                    Set All 85% / सभी को 85% सेट करें
                  </button>
                  <button
                    onClick={() => {
                      const newGradeData = {};
                      students.forEach(student => {
                        newGradeData[student.id] = {
                          ...gradeData[student.id],
                          grade: '75',
                          maxGrade: '100',
                          gradeType: 'assignment'
                        };
                      });
                      setGradeData(newGradeData);
                    }}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200 text-sm"
                  >
                    Set All 75% / सभी को 75% सेट करें
                  </button>
                  <button
                    onClick={() => {
                      const newGradeData = {};
                      students.forEach(student => {
                        newGradeData[student.id] = {
                          ...gradeData[student.id],
                          grade: '',
                          maxGrade: '100',
                          gradeType: 'assignment',
                          description: ''
                        };
                      });
                      setGradeData(newGradeData);
                    }}
                    className="px-3 py-1 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 text-sm"
                  >
                    Clear All / सभी साफ करें
                  </button>
                </div>

                {selectedClass && selectedSubject && (
                  <button
                    onClick={uploadGrades}
                    disabled={uploading || students.length === 0}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {uploading ? 'Uploading... / अपलोड हो रहा है...' : 'Upload Grades / ग्रेड अपलोड करें'}
                  </button>
                )}
              </div>

              {/* Students List */}
              {students.length > 0 ? (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 border-b">
                    <h3 className="text-lg font-semibold">Students / छात्र</h3>
                    <p className="text-sm text-gray-600">Enter grades for each student / प्रत्येक छात्र के लिए ग्रेड दर्ज करें</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-medium">Student Name / छात्र का नाम</th>
                          <th className="px-6 py-3 text-left text-sm font-medium">Email / ईमेल</th>
                          <th className="px-6 py-3 text-left text-sm font-medium">Grade / ग्रेड</th>
                          <th className="px-6 py-3 text-left text-sm font-medium">Max Grade / अधिकतम ग्रेड</th>
                          <th className="px-6 py-3 text-left text-sm font-medium">Type / प्रकार</th>
                          <th className="px-6 py-3 text-left text-sm font-medium">Description / विवरण</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {students.map((student) => (
                          <tr key={student.id} className="hover:bg-gray-50">
                            <td className="px-6 py-3 font-medium">{student.name}</td>
                            <td className="px-6 py-3 text-gray-600">{student.email}</td>
                            <td className="px-6 py-3">
                              <input
                                type="number"
                                min="0"
                                max={gradeData[student.id]?.maxGrade || 100}
                                value={gradeData[student.id]?.grade || ''}
                                onChange={(e) => handleGradeChange(student.id, 'grade', e.target.value)}
                                placeholder="Grade / ग्रेड"
                                className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            </td>
                            <td className="px-6 py-3">
                              <input
                                type="number"
                                min="1"
                                value={gradeData[student.id]?.maxGrade || ''}
                                onChange={(e) => handleGradeChange(student.id, 'maxGrade', e.target.value)}
                                placeholder="Max / अधिकतम"
                                className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            </td>
                            <td className="px-6 py-3">
                              <select
                                value={gradeData[student.id]?.gradeType || 'assignment'}
                                onChange={(e) => handleGradeChange(student.id, 'gradeType', e.target.value)}
                                className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              >
                                <optgroup label="Academic / शैक्षणिक">
                                  <option value="assignment">Assignment / असाइनमेंट</option>
                                  <option value="homework">Homework / होमवर्क</option>
                                  <option value="classwork">Classwork / क्लासवर्क</option>
                                  <option value="project">Project / प्रोजेक्ट</option>
                                  <option value="research">Research Paper / शोध पत्र</option>
                                </optgroup>
                                <optgroup label="Assessments / मूल्यांकन">
                                  <option value="quiz">Quiz / क्विज</option>
                                  <option value="test">Test / टेस्ट</option>
                                  <option value="exam">Exam / परीक्षा</option>
                                  <option value="midterm">Midterm / मिडटर्म</option>
                                  <option value="final">Final Exam / फाइनल परीक्षा</option>
                                </optgroup>
                                <optgroup label="Participation / भागीदारी">
                                  <option value="participation">Participation / भागीदारी</option>
                                  <option value="discussion">Discussion / चर्चा</option>
                                  <option value="presentation">Presentation / प्रेजेंटेशन</option>
                                  <option value="debate">Debate / बहस</option>
                                </optgroup>
                                <optgroup label="Practical / व्यावहारिक">
                                  <option value="lab">Lab Work / लैब काम</option>
                                  <option value="practical">Practical Exam / प्रैक्टिकल परीक्षा</option>
                                  <option value="internship">Internship / इंटर्नशिप</option>
                                  <option value="fieldwork">Field Work / फील्ड काम</option>
                                </optgroup>
                                <optgroup label="Other / अन्य">
                                  <option value="extra">Extra Credit / अतिरिक्त क्रेडिट</option>
                                  <option value="makeup">Makeup Work / मेकअप काम</option>
                                  <option value="bonus">Bonus Points / बोनस अंक</option>
                                </optgroup>
                              </select>
                            </td>
                            <td className="px-6 py-3">
                              <input
                                type="text"
                                value={gradeData[student.id]?.description || ''}
                                onChange={(e) => handleGradeChange(student.id, 'description', e.target.value)}
                                placeholder="Optional description / वैकल्पिक विवरण"
                                className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : selectedClass ? (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <p className="text-gray-600">No students enrolled in this class / इस कक्षा में कोई छात्र नामांकित नहीं है</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <p className="text-gray-600">Select a class to view students / छात्रों को देखने के लिए कक्षा चुनें</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'history' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Grade History / ग्रेड इतिहास</h3>
              {existingGrades.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-medium">Student / छात्र</th>
                        <th className="px-6 py-3 text-left text-sm font-medium">Grade / ग्रेड</th>
                        <th className="px-6 py-3 text-left text-sm font-medium">Type / प्रकार</th>
                        <th className="px-6 py-3 text-left text-sm font-medium">Date / दिनांक</th>
                        <th className="px-6 py-3 text-left text-sm font-medium">Actions / कार्य</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {existingGrades.map((grade) => (
                        <tr key={grade.id} className="hover:bg-gray-50">
                          <td className="px-6 py-3">{grade.student_name}</td>
                          <td className="px-6 py-3 font-semibold">{grade.grade}/{grade.max_grade}</td>
                          <td className="px-6 py-3">{grade.grade_type}</td>
                          <td className="px-6 py-3">{new Date(grade.created_at).toLocaleDateString()}</td>
                          <td className="px-6 py-3">
                            <button
                              onClick={() => handleDeleteClick(grade.id)}
                              className="text-red-600 hover:text-red-900 text-sm font-medium"
                            >
                              Delete / हटाएं
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">No grades found. Select a class and subject to view history. / कोई ग्रेड नहीं मिला। इतिहास देखने के लिए कक्षा और विषय चुनें।</p>
                </div>
              )}
            </div>
          )}
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
        title="Delete Grade / ग्रेड हटाएं"
        message="Are you sure you want to delete this grade? This action cannot be undone. / क्या आप वाकई इस grade को हटाना चाहते हैं? यह कार्रवाई पूर्ववत नहीं की जा सकती।"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm(null)}
        confirmText="Delete / हटाएं"
        cancelText="Cancel / रद्द करें"
        confirmColor="bg-red-600"
      />
    </div>
  );
}
