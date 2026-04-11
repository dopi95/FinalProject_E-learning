import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Eye, X, CheckCircle, Clock, FileText, Users, Video, Monitor, VideoOff, MonitorOff } from 'lucide-react';
import { examAPI } from '../services/api';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000';

const EMPTY_QUESTION = {
  question: '',
  type: 'mcq',
  options: ['', '', '', ''],
  correctAnswer: '',
  marks: 10
};

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
  const [currentQuestion, setCurrentQuestion] = useState({ ...EMPTY_QUESTION });
  const [controlModal, setControlModal] = useState(null);
  const [controlStudents, setControlStudents] = useState([]);
  const [controlLoading, setControlLoading] = useState(false);
  const socketRef = useRef(null);
  const peerConnections = useRef({});
  const videoRefs = useRef({});
  const screenRefs = useRef({});
  const streamCountRef = useRef({});
  const [streamStatus, setStreamStatus] = useState({});
  const instructorIdRef = useRef(null);

  useEffect(() => { fetchExams(); }, []);

  // WebRTC: connect socket when monitor opens, disconnect when it closes
  useEffect(() => {
    if (!controlModal) {
      // Cleanup
      Object.values(peerConnections.current).forEach(pc => pc.close());
      peerConnections.current = {};
      if (socketRef.current) { socketRef.current.disconnect(); socketRef.current = null; }
      return;
    }

    const userId = (() => {
      try {
        const d = localStorage.getItem('user') || sessionStorage.getItem('user');
        return d ? JSON.parse(d)._id : null;
      } catch { return null; }
    })();
    instructorIdRef.current = userId;

    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('instructor:watch', { examId: controlModal._id, userId });
    });

    // Receive list of already-connected students
    socket.on('exam:students', ({ students }) => {
      students.forEach(({ studentId, socketId }) => {
        // Instructor sends answer after receiving offer — nothing to do here proactively
      });
    });

    // New student joined — tell them our socket ID so they send us a WebRTC offer
    socket.on('student:joined', ({ studentId, studentSocketId }) => {
      if (studentSocketId && socket.id) {
        socket.emit('request:offer', { targetSocketId: studentSocketId, instructorSocketId: socket.id });
      }
    });

    // Receive WebRTC offer from student
    socket.on('webrtc:offer', async ({ offer, studentId, fromSocketId }) => {
      // Close existing connection for this student
      if (peerConnections.current[fromSocketId]) {
        peerConnections.current[fromSocketId].close();
        delete peerConnections.current[fromSocketId];
      }

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' }
        ]
      });
      peerConnections.current[fromSocketId] = pc;

      // Track streams: first stream = camera, second stream = screen
      const receivedStreams = [];

      pc.ontrack = (e) => {
        const stream = e.streams[0];
        if (!stream) return;
        // Check if we already have this stream
        if (receivedStreams.find(s => s.id === stream.id)) return;
        receivedStreams.push(stream);

        const idx = receivedStreams.length; // 1 = camera, 2 = screen
        if (idx === 1) {
          // First stream = camera
          const el = videoRefs.current[studentId];
          if (el) {
            el.srcObject = stream;
            el.play().catch(() => {});
          }
          setStreamStatus(prev => ({ ...prev, [studentId]: { ...prev[studentId], camera: true } }));
        } else if (idx === 2) {
          // Second stream = screen share
          const el = screenRefs.current[studentId];
          if (el) {
            el.srcObject = stream;
            el.play().catch(() => {});
          }
          setStreamStatus(prev => ({ ...prev, [studentId]: { ...prev[studentId], screen: true } }));
        }
      };

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit('webrtc:ice', { targetSocketId: fromSocketId, candidate: e.candidate, studentId });
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
          delete peerConnections.current[fromSocketId];
        }
      };

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('webrtc:answer', { targetSocketId: fromSocketId, answer, studentId });
      } catch (err) {
        console.error('WebRTC answer error:', err);
      }
    });

    // ICE candidates from student
    socket.on('webrtc:ice', async ({ candidate, fromSocketId, studentId }) => {
      const pc = peerConnections.current[fromSocketId];
      if (pc && pc.remoteDescription) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
      }
    });

    // Stream status updates (camera/screen on/off)
    socket.on('stream:status', ({ studentId, camera, screen }) => {
      setStreamStatus(prev => ({ ...prev, [studentId]: { camera, screen } }));
      if (!camera && videoRefs.current[studentId]) {
        videoRefs.current[studentId].srcObject = null;
      }
      if (!screen && screenRefs.current[studentId]) {
        screenRefs.current[studentId].srcObject = null;
      }
    });

    socket.on('student:left', ({ studentId }) => {
      setStreamStatus(prev => ({ ...prev, [studentId]: { camera: false, screen: false } }));
      if (videoRefs.current[studentId]) videoRefs.current[studentId].srcObject = null;
      if (screenRefs.current[studentId]) screenRefs.current[studentId].srcObject = null;
    });

    return () => {
      Object.values(peerConnections.current).forEach(pc => pc.close());
      peerConnections.current = {};
      socket.disconnect();
      socketRef.current = null;
    };
  }, [controlModal]);

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
    if (!currentQuestion.question) {
      showNotification('error', 'Error', 'Question text is required');
      return;
    }
    let q = { ...currentQuestion };
    if (!q.correctAnswer) {
      showNotification('error', 'Error', 'Correct answer is required');
      return;
    }

    if (editingQuestionIndex !== null) {
      const updated = [...examForm.questions];
      updated[editingQuestionIndex] = q;
      setExamForm({ ...examForm, questions: updated });
      setEditingQuestionIndex(null);
    } else {
      setExamForm({ ...examForm, questions: [...examForm.questions, q] });
    }
    setCurrentQuestion({ ...EMPTY_QUESTION });
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
      setExamForm({ title: '', course: '', duration: '', totalMarks: '', startDate: '', endDate: '', instructions: '', showResults: false, questions: [] });
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

  const openControlModal = async (exam) => {
    // Reset stream tracking
    streamCountRef.current = {};
    Object.values(peerConnections.current).forEach(pc => pc.close());
    peerConnections.current = {};
    setControlModal(exam);
    setControlLoading(true);
    try {
      const { instructorAPI } = await import('../services/api');
      const res = await instructorAPI.getStudents({ course: exam.course?._id || exam.course });
      const students = (res.data.students || []).map(s => ({
        _id: s._id,
        name: s.name,
        email: s.email,
        profileImage: s.profileImage,
        submitted: (exam.submissions || []).some(sub =>
          (sub.student?._id || sub.student)?.toString() === s._id?.toString()
        ),
        score: (() => {
          const sub = (exam.submissions || []).find(sub =>
            (sub.student?._id || sub.student)?.toString() === s._id?.toString()
          );
          return sub ? sub.score : null;
        })()
      }));
      setControlStudents(students);
      const status = {};
      students.forEach(s => { status[s._id] = { camera: false, screen: false }; });
      setStreamStatus(status);
    } catch {
      setControlStudents([]);
    } finally {
      setControlLoading(false);
    }
  };

  const typeLabel = (type) => {
    if (type === 'mcq') return 'Multiple Choice';
    if (type === 'true-false') return 'True/False';
    if (type === 'fill-blank') return 'Fill in the Blank';
    return type;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Exams</h2>
        <button
          onClick={() => { setShowModal(true); setEditingExam(null); setExamForm({ title: '', course: '', duration: '', totalMarks: '', startDate: '', endDate: '', instructions: '', showResults: false, questions: [] }); setCurrentQuestion({ ...EMPTY_QUESTION }); }}
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
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{exam.course?.title || 'Unknown Course'}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>Duration: {exam.duration} min</span>
                    <span>Questions: {exam.questions?.length || 0}</span>
                    <span>Total Marks: {exam.totalMarks}</span>
                    <span>Submissions: {exam.submissions?.length || 0}</span>
                  </div>
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(exam.startDate).toLocaleString()} - {new Date(exam.endDate).toLocaleString()}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${exam.status === 'active' ? 'bg-green-100 text-green-800' : exam.status === 'completed' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {exam.status}
                  </span>
                  <button
                    onClick={() => openControlModal(exam)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-lg transition-colors"
                    title="Control Students"
                  >
                    <Users className="h-3.5 w-3.5" />
                    Control Students
                  </button>
                  {exam.status === 'draft' && (
                    <button onClick={() => handlePublish(exam._id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Publish">
                      <CheckCircle className="h-4 w-4" />
                    </button>
                  )}
                  {exam.status === 'active' && (
                    <button onClick={() => handleUnpublish(exam._id)} className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg" title="Unpublish">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  {exam.submissions?.length > 0 && (
                    <button onClick={() => setExpandedExam(expandedExam === exam._id ? null : exam._id)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Show Results">
                      <Eye className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setEditingExam(exam);
                      setExamForm({ ...exam, course: exam.course?._id || exam.course, startDate: exam.startDate ? new Date(exam.startDate).toISOString().slice(0, 16) : '', endDate: exam.endDate ? new Date(exam.endDate).toISOString().slice(0, 16) : '' });
                      setShowModal(true);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(exam._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
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
                          <p className="font-medium text-gray-900 dark:text-white">{submission.student?.name || 'Loading...'}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Submitted: {new Date(submission.submittedAt).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">{submission.score}/{exam.totalMarks}</div>
                          <div className="text-sm text-gray-500">{((submission.score / exam.totalMarks) * 100).toFixed(1)}%</div>
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

      {/* Control Students Modal */}
      {controlModal && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-gray-700 flex-shrink-0">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
                {controlModal.title} — Live Monitor
              </h3>
              <p className="text-sm text-gray-400 mt-0.5">{controlModal.course?.title}</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Stats */}
              {[
                { label: 'Students', value: controlStudents.length, color: 'text-blue-400' },
                { label: 'Submitted', value: controlStudents.filter(s => s.submitted).length, color: 'text-green-400' },
                { label: 'Pending', value: controlStudents.filter(s => !s.submitted).length, color: 'text-yellow-400' },
              ].map((stat, i) => (
                <div key={i} className="text-center px-3 py-1 bg-gray-800 rounded-lg border border-gray-700">
                  <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </div>
              ))}
              <button
                onClick={() => { setControlModal(null); setControlStudents([]); setStreamStatus({}); }}
                className="ml-2 p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-950">
            {controlLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
              </div>
            ) : controlStudents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <Users className="h-16 w-16 mb-4 opacity-20" />
                <p className="text-lg font-medium text-gray-400">No students enrolled</p>
                <p className="text-sm mt-1">Students will appear here once they enroll in this course</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {controlStudents.map((student) => {
                  const status = streamStatus[student._id] || { camera: false, screen: false };
                  const initials = student.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
                  return (
                    <div key={student._id} className={`bg-gray-800 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                      student.submitted ? 'border-green-600/60' : status.camera || status.screen ? 'border-blue-600/60' : 'border-gray-700'
                    }`}>

                      {/* Camera Feed */}
                      <div className="relative bg-gray-900 aspect-video flex items-center justify-center">
                        <video
                          ref={el => { if (el) videoRefs.current[student._id] = el; }}
                          autoPlay playsInline muted
                          style={{ display: status.camera ? 'block' : 'none', width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
                        />
                        {!status.camera && (
                          <div className="flex flex-col items-center justify-center gap-2 absolute inset-0">
                            {student.profileImage ? (
                              <img src={student.profileImage} alt={student.name} className="w-16 h-16 rounded-full object-cover border-2 border-gray-600" />
                            ) : (
                              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                                <span className="text-xl font-bold text-white">{initials}</span>
                              </div>
                            )}
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <VideoOff className="h-3 w-3" /> Camera Off
                            </span>
                          </div>
                        )}
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          {student.submitted && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-green-600/90 text-white text-xs rounded-full font-medium">
                              <CheckCircle className="h-3 w-3" />
                              Submitted {student.score !== null ? `· ${student.score}/${controlModal.totalMarks}` : ''}
                            </span>
                          )}
                        </div>
                        <div className="absolute top-2 right-2">
                          <span className={`flex items-center gap-1 px-2 py-0.5 text-xs rounded-full font-medium ${
                            status.camera ? 'bg-green-600/90 text-white' : 'bg-gray-700/80 text-gray-400'
                          }`}>
                            {status.camera ? <><Video className="h-3 w-3" /> Live</> : <><VideoOff className="h-3 w-3" /> Off</>}
                          </span>
                        </div>
                      </div>

                      {/* Student name bar */}
                      <div className="px-3 py-2 bg-gray-800 flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{student.name}</p>
                          <p className="text-xs text-gray-500 truncate">{student.email}</p>
                        </div>
                        <span className={`ml-2 flex-shrink-0 w-2.5 h-2.5 rounded-full ${
                          student.submitted ? 'bg-green-400' : 'bg-gray-600'
                        }`} title={student.submitted ? 'Submitted' : 'Not submitted'} />
                      </div>

                      {/* Screen Share */}
                      <div className="mx-3 mb-3 rounded-xl overflow-hidden border border-gray-700 bg-gray-900">
                        <div className="flex items-center justify-between px-2.5 py-1.5 bg-gray-700/80">
                          <span className="text-xs text-gray-300 flex items-center gap-1.5">
                            <Monitor className="h-3 w-3" /> Screen Share
                          </span>
                          <span className={`text-xs font-medium ${
                            status.screen ? 'text-blue-400' : 'text-gray-500'
                          }`}>
                            {status.screen ? '● Live' : 'Not Sharing'}
                          </span>
                        </div>
                        <div className="relative aspect-video flex items-center justify-center">
                          <video
                            ref={el => { if (el) screenRefs.current[student._id] = el; }}
                            autoPlay playsInline muted
                            style={{ display: status.screen ? 'block' : 'none', width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
                          />
                          {!status.screen && (
                            <div className="flex flex-col items-center gap-1 text-gray-600">
                              <MonitorOff className="h-8 w-8" />
                              <span className="text-xs">No screen shared</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-gray-900 border-t border-gray-700 flex items-center justify-between flex-shrink-0">
            <p className="text-xs text-gray-500">Live camera & screen feeds appear when students enable them during the exam. Submitted students are highlighted in green.</p>
            <button
              onClick={() => { setControlModal(null); setControlStudents([]); setStreamStatus({}); }}
              className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Close Monitor
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{editingExam ? 'Edit Exam' : 'Create Exam'}</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="h-6 w-6" /></button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Title *</label>
                    <input type="text" value={examForm.title} onChange={(e) => setExamForm({ ...examForm, title: e.target.value })} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Course *</label>
                    <select value={examForm.course} onChange={(e) => setExamForm({ ...examForm, course: e.target.value })} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700">
                      <option value="">Select Course</option>
                      {courses.map((course) => (<option key={course._id} value={course._id}>{course.title}</option>))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Duration (minutes) *</label>
                    <input type="text" value={examForm.duration} onChange={(e) => setExamForm({ ...examForm, duration: e.target.value })} placeholder="e.g., 60" className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Total Marks *</label>
                    <input type="text" value={examForm.totalMarks} onChange={(e) => setExamForm({ ...examForm, totalMarks: e.target.value })} placeholder="e.g., 100" className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Start Date & Time *</label>
                    <input type="datetime-local" value={examForm.startDate} onChange={(e) => setExamForm({ ...examForm, startDate: e.target.value })} min={new Date().toISOString().slice(0, 16)} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">End Date & Time *</label>
                    <input type="datetime-local" value={examForm.endDate} onChange={(e) => setExamForm({ ...examForm, endDate: e.target.value })} min={examForm.startDate || new Date().toISOString().slice(0, 16)} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Instructions</label>
                  <textarea value={examForm.instructions} onChange={(e) => setExamForm({ ...examForm, instructions: e.target.value })} rows="3" className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700" />
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={examForm.showResults} onChange={(e) => setExamForm({ ...examForm, showResults: e.target.checked })} className="rounded" />
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
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded">{typeLabel(q.type)}</span>
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded">{q.marks} marks</span>
                          </div>
                          {q.type === 'mcq' && q.options?.some(opt => opt) && (
                            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                              <p className="font-medium mb-1">Options:</p>
                              <ul className="list-disc list-inside space-y-1">{q.options.filter(opt => opt).map((opt, i) => <li key={i}>{opt}</li>)}</ul>
                            </div>
                          )}
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400"><span className="font-medium">Correct Answer:</span> {q.correctAnswer}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => { setEditingQuestionIndex(idx); setCurrentQuestion({ ...EMPTY_QUESTION, ...q }); }} className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded" title="Edit"><Edit className="h-4 w-4" /></button>
                          <button onClick={() => setExamForm({ ...examForm, questions: examForm.questions.filter((_, i) => i !== idx) })} className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded" title="Delete"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add/Edit Question Form */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg space-y-3">
                    <h5 className="font-medium">{editingQuestionIndex !== null ? 'Edit Question' : 'Add Question'}</h5>
                    <input type="text" placeholder="Question" value={currentQuestion.question} onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700" />

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1">Question Type</label>
                        <select value={currentQuestion.type} onChange={(e) => setCurrentQuestion({ ...currentQuestion, type: e.target.value, correctAnswer: '', options: ['', '', '', ''] })} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700">
                          <option value="mcq">Multiple Choice</option>
                          <option value="true-false">True/False</option>
                          <option value="fill-blank">Fill in the Blank</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Marks</label>
                        <input type="number" min="1" value={currentQuestion.marks} onChange={(e) => setCurrentQuestion({ ...currentQuestion, marks: parseInt(e.target.value) || 10 })} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700" />
                      </div>
                    </div>

                    {/* MCQ options */}
                    {currentQuestion.type === 'mcq' && (
                      <div className="space-y-2">
                        {currentQuestion.options.map((opt, idx) => (
                          <input key={idx} type="text" placeholder={`Option ${idx + 1}`} value={opt} onChange={(e) => { const o = [...currentQuestion.options]; o[idx] = e.target.value; setCurrentQuestion({ ...currentQuestion, options: o }); }} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700" />
                        ))}
                      </div>
                    )}

                    {/* Fill in the blank hint */}
                    {currentQuestion.type === 'fill-blank' && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded-lg">
                        Write the question with <strong>___</strong> where the blank should be. e.g. "The capital of Ethiopia is ___".
                      </p>
                    )}

                    <input type="text" placeholder={currentQuestion.type === 'fill-blank' ? 'Correct answer for the blank' : 'Correct Answer'} value={currentQuestion.correctAnswer} onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700" />

                    <button onClick={handleAddQuestion} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                      {editingQuestionIndex !== null ? 'Update Question' : 'Add Question'}
                    </button>
                    {editingQuestionIndex !== null && (
                      <button onClick={() => { setEditingQuestionIndex(null); setCurrentQuestion({ ...EMPTY_QUESTION }); }} className="w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600">Cancel Edit</button>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button onClick={handleSubmit} disabled={loading} className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50">
                    {loading ? 'Saving...' : editingExam ? 'Update Exam' : 'Create Exam'}
                  </button>
                  <button onClick={() => setShowModal(false)} className="px-6 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamManager;
