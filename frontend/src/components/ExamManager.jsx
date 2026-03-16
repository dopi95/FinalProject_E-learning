import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, X, CheckCircle, Clock, FileText, Users } from 'lucide-react';
import { examAPI } from '../services/api';

const ExamManager = ({ courses, showNotification }) => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [expandedExam, setExpandedExam] = useState(null);
  const [editingExam, setEditingExam] = useState(null);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  const [examForm, setExamForm] = useState({
    title: '',
    course: '',
    duration: '',
    totalMarks: '',
    startDate: '',
    endDate: '',
    instructions: '',
    showResults: false,
    questions: []
  });
  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    type: 'mcq',
    options: ['', '', '', ''],
    correctAnswer: '',
    marks: 10
  });

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await examAPI.getInstructorExams();
      setExams(response.data.exams || []);
    } catch (error) {
      console.error('Fetch exams error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    if (!currentQuestion.question || !currentQuestion.correctAnswer) {
      showNotification('error', 'Error', 'Question and correct answer are required');
      return;
    }
    if (editingQuestionIndex !== null) {
      const updatedQuestions = [...examForm.questions];
      updatedQuestions[editingQuestionIndex] = currentQuestion;
      setExamForm({ ...examForm, questions: updatedQuestions });
      setEditingQuestionIndex(null);
    } else {
      setExamForm({ ...examForm, questions: [...examForm.questions, currentQuestion] });
    }
    setCurrentQuestion({ question: '', type: 'mcq', options: ['', '', '', ''], correctAnswer: '', marks: 10 });
  };

  const handleSubmit = async () => {
    if (!examForm.title || !examForm.course || examForm.questions.length === 0) {
      showNotification('error', 'Error', 'Title, course, and at least one question are required');
      return;
    }

    try {
      setLoading(true);
      if (editingExam) {
        await examAPI.updateExam(editingExam._id, examForm);
        showNotification('success', 'Success', 'Exam updated successfully');
      } else {
        await examAPI.createExam(examForm);
        showNotification('success', 'Success', 'Exam created successfully');
      }
      setShowModal(false);
      setExamForm({
        title: '',
        course: '',
        duration: '',
        totalMarks: '',
        startDate: '',
        endDate: '',
        instructions: '',
        showResults: false,
        questions: []
      });
      setEditingExam(null);
      await fetchExams();
    } catch (error) {
      showNotification('error', 'Error', error.response?.data?.message || 'Failed to save exam');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this exam?')) return;
    try {
      setLoading(true);
      await examAPI.deleteExam(id);
      showNotification('success', 'Success', 'Exam deleted successfully');
      await fetchExams();
    } catch (error) {
      showNotification('error', 'Error', 'Failed to delete exam');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (id) => {
    try {
      setLoading(true);
      await examAPI.publishExam(id);
      showNotification('success', 'Success', 'Exam published successfully');
      await fetchExams();
    } catch (error) {
      showNotification('error', 'Error', 'Failed to publish exam');
    } finally {
      setLoading(false);
    }
  };

  const handleUnpublish = async (id) => {
    try {
      setLoading(true);
      await examAPI.unpublishExam(id);
      showNotification('success', 'Success', 'Exam unpublished successfully');
      await fetchExams();
    } catch (error) {
      showNotification('error', 'Error', 'Failed to unpublish exam');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Exams</h2>
        <button
          onClick={() => {
            setShowModal(true);
            setEditingExam(null);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Exam
        </button>
      </div>

      {loading && exams.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : exams.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
          <CheckCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Exams</h3>
          <p className="text-gray-500 dark:text-gray-400">Create your first exam to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {exams.map((exam) => (
            <div key={exam._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{exam.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {exam.course?.title || 'Unknown Course'}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>Duration: {exam.duration} min</span>
                    <span>Questions: {exam.questions?.length || 0}</span>
                    <span>Total Marks: {exam.totalMarks}</span>
                    <span>Submissions: {exam.submissions?.length || 0}</span>
                  </div>
                  <div className="mt-2 text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {new Date(exam.startDate).toLocaleString()} - {new Date(exam.endDate).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    exam.status === 'active' ? 'bg-green-100 text-green-800' :
                    exam.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {exam.status}
                  </span>
                  {exam.status === 'draft' && (
                    <button
                      onClick={() => handlePublish(exam._id)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                      title="Publish"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                  )}
                  {exam.status === 'active' && (
                    <button
                      onClick={() => handleUnpublish(exam._id)}
                      className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg"
                      title="Unpublish"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  {exam.submissions?.length > 0 && (
                    <button
                      onClick={() => setExpandedExam(expandedExam === exam._id ? null : exam._id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Show Results"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setEditingExam(exam);
                      const formattedExam = {
                        ...exam,
                        course: exam.course?._id || exam.course,
                        startDate: exam.startDate ? new Date(exam.startDate).toISOString().slice(0, 16) : '',
                        endDate: exam.endDate ? new Date(exam.endDate).toISOString().slice(0, 16) : ''
                      };
                      setExamForm(formattedExam);
                      setShowModal(true);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(exam._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {expandedExam === exam._id && exam.submissions?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Student Results</h4>
                  <div className="space-y-2">
                    {exam.submissions.map((submission, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {submission.student?.name || 'Loading...'}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Submitted: {new Date(submission.submittedAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            {submission.score}/{exam.totalMarks}
                          </div>
                          <div className="text-sm text-gray-500">
                            {((submission.score / exam.totalMarks) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingExam ? 'Edit Exam' : 'Create Exam'}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Title *</label>
                    <input
                      type="text"
                      value={examForm.title}
                      onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Course *</label>
                    <select
                      value={examForm.course}
                      onChange={(e) => setExamForm({ ...examForm, course: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
                    >
                      <option value="">Select Course</option>
                      {courses.map((course) => (
                        <option key={course._id} value={course._id}>{course.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Duration (minutes) *</label>
                    <input
                      type="text"
                      value={examForm.duration}
                      onChange={(e) => setExamForm({ ...examForm, duration: e.target.value })}
                      placeholder="e.g., 60"
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Total Marks *</label>
                    <input
                      type="text"
                      value={examForm.totalMarks}
                      onChange={(e) => setExamForm({ ...examForm, totalMarks: e.target.value })}
                      placeholder="e.g., 100"
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Start Date & Time *</label>
                    <input
                      type="datetime-local"
                      value={examForm.startDate}
                      onChange={(e) => setExamForm({ ...examForm, startDate: e.target.value })}
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">End Date & Time *</label>
                    <input
                      type="datetime-local"
                      value={examForm.endDate}
                      onChange={(e) => setExamForm({ ...examForm, endDate: e.target.value })}
                      min={examForm.startDate || new Date().toISOString().slice(0, 16)}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Instructions</label>
                  <textarea
                    value={examForm.instructions}
                    onChange={(e) => setExamForm({ ...examForm, instructions: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={examForm.showResults}
                      onChange={(e) => setExamForm({ ...examForm, showResults: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">Show results to students after submission</span>
                  </label>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-4">Questions ({examForm.questions.length})</h4>
                  
                  {examForm.questions.map((q, idx) => (
                    <div key={idx} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-3 border-l-4 border-blue-500">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white mb-2">Q{idx + 1}: {q.question}</p>
                          <div className="flex flex-wrap gap-2 text-xs">
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded">
                              {q.type === 'mcq' ? 'Multiple Choice' : q.type === 'true-false' ? 'True/False' : 'Short Answer'}
                            </span>
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded">
                              {q.marks} marks
                            </span>
                          </div>
                          {q.type === 'mcq' && q.options.some(opt => opt) && (
                            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                              <p className="font-medium mb-1">Options:</p>
                              <ul className="list-disc list-inside space-y-1">
                                {q.options.filter(opt => opt).map((opt, i) => (
                                  <li key={i}>{opt}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Correct Answer:</span> {q.correctAnswer}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingQuestionIndex(idx);
                              setCurrentQuestion(q);
                            }}
                            className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setExamForm({ ...examForm, questions: examForm.questions.filter((_, i) => i !== idx) })}
                            className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg space-y-3">
                    <h5 className="font-medium">{editingQuestionIndex !== null ? 'Edit Question' : 'Add Question'}</h5>
                    <input
                      type="text"
                      placeholder="Question"
                      value={currentQuestion.question}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1">Question Type</label>
                        <select
                          value={currentQuestion.type}
                          onChange={(e) => setCurrentQuestion({ ...currentQuestion, type: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
                        >
                          <option value="mcq">Multiple Choice</option>
                          <option value="true-false">True/False</option>
                          <option value="short-answer">Short Answer</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Marks</label>
                        <input
                          type="number"
                          min="1"
                          placeholder="Marks"
                          value={currentQuestion.marks}
                          onChange={(e) => setCurrentQuestion({ ...currentQuestion, marks: parseInt(e.target.value) || 10 })}
                          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
                        />
                      </div>
                    </div>
                    {currentQuestion.type === 'mcq' && (
                      <div className="space-y-2">
                        {currentQuestion.options.map((opt, idx) => (
                          <input
                            key={idx}
                            type="text"
                            placeholder={`Option ${idx + 1}`}
                            value={opt}
                            onChange={(e) => {
                              const newOpts = [...currentQuestion.options];
                              newOpts[idx] = e.target.value;
                              setCurrentQuestion({ ...currentQuestion, options: newOpts });
                            }}
                            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
                          />
                        ))}
                      </div>
                    )}
                    <input
                      type="text"
                      placeholder="Correct Answer"
                      value={currentQuestion.correctAnswer}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
                    />
                    <button
                      onClick={handleAddQuestion}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                    >
                      {editingQuestionIndex !== null ? 'Update Question' : 'Add Question'}
                    </button>
                    {editingQuestionIndex !== null && (
                      <button
                        onClick={() => {
                          setEditingQuestionIndex(null);
                          setCurrentQuestion({ question: '', type: 'mcq', options: ['', '', '', ''], correctAnswer: '', marks: 10 });
                        }}
                        className="w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : editingExam ? 'Update Exam' : 'Create Exam'}
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-6 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSubmissions && selectedExam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Submissions - {selectedExam.title}
                </h3>
                <button onClick={() => setShowSubmissions(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                {selectedExam.submissions?.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No submissions yet</p>
                  </div>
                ) : (
                  selectedExam.submissions?.map((submission, idx) => (
                    <div key={idx} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {submission.student?.name || 'Unknown Student'}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {submission.student?.email}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            {submission.score}/{selectedExam.totalMarks}
                          </div>
                          <div className="text-sm text-gray-500">
                            {((submission.score / selectedExam.totalMarks) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <p>Submitted: {new Date(submission.submittedAt).toLocaleString()}</p>
                        <p>Time Taken: {submission.timeTaken} minutes</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamManager;
