import React, { useState, useEffect } from 'react';
import { Clock, FileText, CheckCircle, XCircle, AlertCircle, Eye } from 'lucide-react';
import { examAPI } from '../services/api';

const StudentExams = ({ showNotification }) => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeExam, setActiveExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [examStarted, setExamStarted] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [submission, setSubmission] = useState(null);

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    if (examStarted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [examStarted, timeLeft]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await examAPI.getStudentExams();
      setExams(response.data.exams || []);
    } catch (error) {
      console.error('Fetch exams error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getExamStatus = (exam) => {
    const now = new Date();
    const start = new Date(exam.startDate);
    const end = new Date(exam.endDate);
    
    if (now < start) return 'not-started';
    if (now > end) return 'closed';
    return 'active';
  };

  const startExam = (exam) => {
    const status = getExamStatus(exam);
    if (status !== 'active') {
      showNotification('error', 'Error', 'Exam is not available');
      return;
    }
    
    setActiveExam(exam);
    setTimeLeft(parseInt(exam.duration) * 60);
    setExamStarted(true);
    setViewMode(false);
    setAnswers({});
  };

  const viewSubmission = async (exam) => {
    try {
      setLoading(true);
      const response = await examAPI.getSubmission(exam._id);
      const { exam: examData, submission: submissionData } = response.data;
      
      const submittedAnswers = {};
      submissionData.answers.forEach(ans => {
        submittedAnswers[ans.questionIndex] = ans.answer;
      });
      
      setActiveExam(examData);
      setAnswers(submittedAnswers);
      setSubmission(submissionData);
      setViewMode(true);
      setExamStarted(false);
    } catch (error) {
      showNotification('error', 'Error', 'Failed to load submission');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!activeExam) return;
    
    try {
      setLoading(true);
      const answerArray = Object.entries(answers).map(([questionIndex, answer]) => ({
        questionIndex: parseInt(questionIndex),
        answer
      }));
      
      const timeTaken = parseInt(activeExam.duration) * 60 - timeLeft;
      const response = await examAPI.submitExam(activeExam._id, { answers: answerArray, timeTaken: Math.floor(timeTaken / 60) });
      
      if (activeExam.showResults && response.data.score !== undefined) {
        showNotification('success', 'Exam Submitted', `Your score: ${response.data.score}/${activeExam.totalMarks} (${((response.data.score / activeExam.totalMarks) * 100).toFixed(1)}%)`);
      } else {
        showNotification('success', 'Success', 'Exam submitted successfully');
      }
      
      setActiveExam(null);
      setExamStarted(false);
      fetchExams();
    } catch (error) {
      showNotification('error', 'Error', error.response?.data?.message || 'Failed to submit exam');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (activeExam) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{activeExam.title}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{activeExam.course?.title}</p>
              {viewMode && submission && (
                <p className="text-sm font-semibold text-blue-600 mt-1">
                  Score: {submission.score}/{activeExam.totalMarks} ({((submission.score / activeExam.totalMarks) * 100).toFixed(1)}%)
                </p>
              )}
            </div>
            <div className="text-right">
              {examStarted && (
                <>
                  <div className={`text-3xl font-bold ${timeLeft < 300 ? 'text-red-600' : 'text-blue-600'}`}>
                    {formatTime(timeLeft)}
                  </div>
                  <p className="text-xs text-gray-500">Time Remaining</p>
                </>
              )}
              {viewMode && (
                <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                  View Only
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {activeExam.questions.map((question, idx) => {
            const isCorrect = viewMode && question.correctAnswer.trim().toLowerCase() === answers[idx]?.trim().toLowerCase();
            
            return (
              <div key={idx} className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${viewMode ? (isCorrect ? 'border-2 border-green-500' : 'border-2 border-red-500') : ''}`}>
                <h3 className="font-semibold text-lg mb-4">
                  Q{idx + 1}. {question.question} ({question.marks} marks)
                </h3>
                
                {question.type === 'mcq' && (
                  <div className="space-y-2">
                    {question.options.map((option, optIdx) => (
                      <label key={optIdx} className={`flex items-center p-3 border rounded-lg ${viewMode ? 'cursor-default' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700'} ${viewMode && option === question.correctAnswer ? 'bg-green-100 dark:bg-green-900' : ''}`}>
                        <input
                          type="radio"
                          name={`question-${idx}`}
                          value={option}
                          checked={answers[idx] === option}
                          onChange={(e) => !viewMode && setAnswers({ ...answers, [idx]: e.target.value })}
                          disabled={viewMode}
                          className="mr-3"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                )}
                
                {question.type === 'true-false' && (
                  <div className="space-y-2">
                    {['True', 'False'].map((option) => (
                      <label key={option} className={`flex items-center p-3 border rounded-lg ${viewMode ? 'cursor-default' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700'} ${viewMode && option === question.correctAnswer ? 'bg-green-100 dark:bg-green-900' : ''}`}>
                        <input
                          type="radio"
                          name={`question-${idx}`}
                          value={option}
                          checked={answers[idx] === option}
                          onChange={(e) => !viewMode && setAnswers({ ...answers, [idx]: e.target.value })}
                          disabled={viewMode}
                          className="mr-3"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                )}
                
                {question.type === 'short-answer' && (
                  <>
                    <textarea
                      value={answers[idx] || ''}
                      onChange={(e) => !viewMode && setAnswers({ ...answers, [idx]: e.target.value })}
                      disabled={viewMode}
                      rows="4"
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
                      placeholder="Type your answer here..."
                    />
                    {viewMode && (
                      <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                        Correct Answer: {question.correctAnswer}
                      </p>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex gap-4">
          {examStarted && (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold"
            >
              {loading ? 'Submitting...' : 'Submit Exam'}
            </button>
          )}
          {viewMode && (
            <button
              onClick={() => {
                setActiveExam(null);
                setViewMode(false);
                setSubmission(null);
              }}
              className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 font-semibold"
            >
              Close
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Exams</h2>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : exams.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Exams Available</h3>
          <p className="text-gray-500 dark:text-gray-400">Check back later for new exams.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {exams.map((exam) => {
            const status = getExamStatus(exam);
            const userId = localStorage.getItem('userId');
            const submitted = exam.submissions?.some(s => {
              const studentId = s.student?._id || s.student;
              return studentId && studentId.toString() === userId;
            });
            
            return (
              <div key={exam._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{exam.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{exam.course?.title}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span><Clock className="h-4 w-4 inline mr-1" />{exam.duration} min</span>
                      <span>{exam.questions?.length} questions</span>
                      <span>{exam.totalMarks} marks</span>
                    </div>
                    <div className="mt-2 text-sm">
                      <p>Start: {new Date(exam.startDate).toLocaleString()}</p>
                      <p>End: {new Date(exam.endDate).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {status === 'not-started' && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Not Started
                      </span>
                    )}
                    {status === 'closed' && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        Closed
                      </span>
                    )}
                    {submitted ? (
                      <>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          Submitted
                        </span>
                        <button
                          onClick={() => viewSubmission(exam)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                      </>
                    ) : status === 'active' ? (
                      <>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Active
                        </span>
                        <button
                          onClick={() => startExam(exam)}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
                        >
                          Start Exam
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentExams;
