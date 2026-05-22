import React, { useState, useEffect, useRef } from 'react';
import { Clock, FileText, CheckCircle, XCircle, AlertCircle, Eye, Flag, Camera, CameraOff, Monitor, MonitorOff } from 'lucide-react';
import { examAPI } from '../services/api';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000';

const StudentExams = ({ showNotification }) => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeExam, setActiveExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [examStarted, setExamStarted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [submission, setSubmission] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [flagged, setFlagged] = useState(new Set());
  const [showFlagged, setShowFlagged] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const [screenStream, setScreenStream] = useState(null);
  const [screenError, setScreenError] = useState('');
  const videoRef = useRef(null);
  const examVideoRef = useRef(null);
  const screenRef = useRef(null);
  const examScreenRef = useRef(null);
  const examHeaderRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const socketRef = useRef(null);
  const peerConnections = useRef({});
  const pendingCandidates = useRef({});
  const cameraStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const examIdRef = useRef(null);
  const userIdRef = useRef(null);
  const socketMeta_ref = useRef(null);
  const connectedInstructors = useRef(new Set());
  const [tabWarning, setTabWarning] = useState(false);
  const [tabCountdown, setTabCountdown] = useState(10);
  const [showLateModal, setShowLateModal] = useState(false);
  const tabTimerRef = useRef(null);
  const tabCountRef = useRef(0);

  const PAGE_SIZE = 1;

  const startCamera = async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      cameraStreamRef.current = stream;
      setCameraStream(stream);
      localStorage.setItem('examCameraActive', 'true');
      if (videoRef.current) videoRef.current.srcObject = stream;
      emitStreamStatus(true, !!screenStreamRef.current);
      // Re-send offers to all connected instructors with new stream
      setTimeout(() => {
        connectedInstructors.current.forEach(instrSocketId => sendOffer(instrSocketId));
      }, 300);
    } catch {
      setCameraError('Camera access denied. Please allow camera access and try again.');
    }
  };

  const stopCamera = () => {
    if (cameraStreamRef.current) { cameraStreamRef.current.getTracks().forEach(t => t.stop()); }
    cameraStreamRef.current = null;
    setCameraStream(null);
    localStorage.removeItem('examCameraActive');
    emitStreamStatus(false, !!screenStreamRef.current);
  };

  const isMobileDevice = () => /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

  const startScreenShare = async () => {
    setScreenError('');
    if (isMobileDevice() || !navigator.mediaDevices?.getDisplayMedia) {
      setScreenError('Screen sharing is not available on mobile browsers. Your camera is sufficient for mobile verification.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      screenStreamRef.current = stream;
      setScreenStream(stream);
      localStorage.setItem('examScreenActive', 'true');
      if (screenRef.current) screenRef.current.srcObject = stream;
      if (examScreenRef.current) examScreenRef.current.srcObject = stream;
      emitStreamStatus(!!cameraStreamRef.current, true);
      // Re-send offers to all connected instructors with new stream
      setTimeout(() => {
        connectedInstructors.current.forEach(instrSocketId => sendOffer(instrSocketId));
      }, 300);
      stream.getVideoTracks()[0].onended = () => {
        screenStreamRef.current = null;
        setScreenStream(null);
        localStorage.removeItem('examScreenActive');
        emitStreamStatus(!!cameraStreamRef.current, false);
      };
    } catch {
      setScreenError('Screen share cancelled or denied.');
    }
  };

  const stopScreenShare = () => {
    if (screenStreamRef.current) { screenStreamRef.current.getTracks().forEach(t => t.stop()); }
    screenStreamRef.current = null;
    setScreenStream(null);
    localStorage.removeItem('examScreenActive');
    emitStreamStatus(!!cameraStreamRef.current, false);
  };

  const emitStreamStatus = (camera, screen) => {
    if (socketRef.current && examIdRef.current && userIdRef.current) {
      socketRef.current.emit('stream:status', {
        examId: examIdRef.current,
        studentId: userIdRef.current,
        camera,
        screen
      });
    }
  };

  const getUserId = () => {
    try {
      const local = localStorage.getItem('user');
      const session = sessionStorage.getItem('user');
      const data = local || session;
      return data ? JSON.parse(data)._id : null;
    } catch { return null; }
  };

  const createPeerConnection = (instructorSocketId) => {
    if (peerConnections.current[instructorSocketId]) {
      peerConnections.current[instructorSocketId].close();
      delete peerConnections.current[instructorSocketId];
    }

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
      ]
    });
    peerConnections.current[instructorSocketId] = pc;
    pendingCandidates.current[instructorSocketId] = [];

    // Add camera stream tracks
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(track =>
        pc.addTrack(track, cameraStreamRef.current)
      );
    }
    // Add screen stream tracks as a separate stream
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track =>
        pc.addTrack(track, screenStreamRef.current)
      );
    }

    pc.onicecandidate = (e) => {
      if (e.candidate && socketRef.current) {
        socketRef.current.emit('webrtc:ice', {
          targetSocketId: instructorSocketId,
          candidate: e.candidate,
          studentId: userIdRef.current
        });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        delete peerConnections.current[instructorSocketId];
      }
    };

    return pc;
  };

  const sendOffer = async (instructorSocketId) => {
    // Only send offer if we have at least one stream
    if (!cameraStreamRef.current && !screenStreamRef.current) return;
    const pc = createPeerConnection(instructorSocketId);
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketRef.current.emit('webrtc:offer', {
        targetSocketId: instructorSocketId,
        offer,
        studentId: userIdRef.current
      });
    } catch (err) {
      console.error('WebRTC offer error:', err);
    }
  };

  // Re-send offers to all connected instructors (called when a new stream starts)
  const renegotiateAll = () => {
    if (!socketRef.current) return;
    const meta = socketMeta_ref.current;
    if (!meta) return;
    Object.keys(peerConnections.current).forEach(instrSocketId => {
      sendOffer(instrSocketId);
    });
  };

  // Measure header height dynamically so spacer always matches
  useEffect(() => {
    if (!examHeaderRef.current) return;
    const measure = () => {
      if (examHeaderRef.current) {
        setHeaderHeight(examHeaderRef.current.offsetHeight);
      }
    };
    // Measure immediately
    measure();
    // Also measure on resize
    window.addEventListener('resize', measure);
    // Use ResizeObserver for any content changes in the header
    const ro = new ResizeObserver(measure);
    ro.observe(examHeaderRef.current);
    return () => {
      window.removeEventListener('resize', measure);
      ro.disconnect();
    };
  }, [examStarted]);

  // Attach stream to video element when ref is ready
  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream]);

  // Attach stream to exam video box when exam starts
  useEffect(() => {
    if (examVideoRef.current && cameraStream) examVideoRef.current.srcObject = cameraStream;
  }, [cameraStream, examStarted]);

  useEffect(() => {
    if (screenRef.current && screenStream) screenRef.current.srcObject = screenStream;
  }, [screenStream]);

  useEffect(() => {
    if (examScreenRef.current && screenStream) examScreenRef.current.srcObject = screenStream;
  }, [screenStream, examStarted]);

  // Stop camera and screen share when exam is fully done
  useEffect(() => {
    if (!activeExam) { stopCamera(); stopScreenShare(); }
  }, [activeExam]);

  // Block navigation away + tab switch detection during active exam
  useEffect(() => {
    if (!examStarted) return;

    // 1. Block page unload / navigation (new tab, close, refresh, address bar)
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'You are in an active exam. Leaving will cancel your exam!';
      return e.returnValue;
    };

    // 2. Detect tab switch / app switch (visibility hidden)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        startTabWarning();
      } else {
        cancelTabWarning();
      }
    };

    // 3. Detect window blur (switching to another app/window)
    const handleBlur = () => startTabWarning();
    const handleFocus = () => cancelTabWarning();

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      cancelTabWarning();
    };
  }, [examStarted]);

  const startTabWarning = () => {
    if (tabTimerRef.current) return; // already counting
    tabCountRef.current = 10;
    setTabCountdown(10);
    setTabWarning(true);

    tabTimerRef.current = setInterval(() => {
      tabCountRef.current -= 1;
      setTabCountdown(tabCountRef.current);
      if (tabCountRef.current <= 0) {
        clearInterval(tabTimerRef.current);
        tabTimerRef.current = null;
        setTabWarning(false);
        // Auto-cancel exam for this student
        autoDisqualify();
      }
    }, 1000);
  };

  const cancelTabWarning = () => {
    if (tabTimerRef.current) {
      clearInterval(tabTimerRef.current);
      tabTimerRef.current = null;
    }
    setTabWarning(false);
    setTabCountdown(10);
  };

  const autoDisqualify = async () => {
    if (!activeExam) return;
    try {
      // Submit with current answers (partial) to mark as done
      const answerArray = Object.entries(answers).map(([questionIndex, answer]) => ({
        questionIndex: parseInt(questionIndex),
        answer
      }));
      const session = JSON.parse(localStorage.getItem('examSession') || 'null');
      const timeTaken = session ? Math.floor((Date.now() - session.startedAt) / 1000 / 60) : 0;
      await examAPI.submitExam(activeExam._id, { answers: answerArray, timeTaken, disqualified: true });
    } catch (e) {
      console.error('Auto-disqualify error:', e);
    } finally {
      clearExamSession();
      setActiveExam(null);
      setExamStarted(false);
      fetchExams();
    }
  };

  const toggleFlag = (idx) => {
    setFlagged(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const jumpToQuestion = (idx) => {
    setCurrentPage(idx);
    setShowFlagged(false);
  };

  useEffect(() => {
    fetchExams();
  }, []);

  // Restore active exam session on mount (handles refresh/back)
  useEffect(() => {
    const session = JSON.parse(localStorage.getItem('examSession') || 'null');
    if (!session) return;
    const elapsed = Math.floor((Date.now() - session.startedAt) / 1000);
    const remaining = session.totalSeconds - elapsed;
    if (remaining <= 0) {
      localStorage.removeItem('examSession');
      return;
    }
    examAPI.getStudentExams().then(res => {
      const exam = (res.data.exams || []).find(e => e._id === session.examId);
      if (!exam) { localStorage.removeItem('examSession'); return; }
      // If exam end time has passed, clear session — exam is closed
      if (new Date() > new Date(exam.endDate)) { clearExamSession(); return; }
      const savedAnswers = JSON.parse(localStorage.getItem('examAnswers') || '{}');
      setActiveExam(exam);
      setAnswers(savedAnswers);
      setTimeLeft(remaining);
      setExamStarted(true);
      setShowInstructions(false);
      setCurrentPage(0);
      setExams(res.data.exams || []);
      // Auto-restart camera & screen if they were active before refresh
      const wasCamera = localStorage.getItem('examCameraActive') === 'true';
      const wasScreen = localStorage.getItem('examScreenActive') === 'true';
      if (wasCamera) {
        navigator.mediaDevices.getUserMedia({ video: true, audio: false })
          .then(stream => { setCameraStream(stream); localStorage.setItem('examCameraActive', 'true'); })
          .catch(() => localStorage.removeItem('examCameraActive'));
      }
      if (wasScreen) {
        navigator.mediaDevices.getDisplayMedia({ video: true, audio: false })
          .then(stream => {
            setScreenStream(stream);
            localStorage.setItem('examScreenActive', 'true');
            stream.getVideoTracks()[0].onended = () => { setScreenStream(null); localStorage.removeItem('examScreenActive'); };
          })
          .catch(() => localStorage.removeItem('examScreenActive'));
      }
    }).catch(() => localStorage.removeItem('examSession'));
  }, []);

  // Socket.io: connect when active exam exists (instructions or started)
  useEffect(() => {
    if (!activeExam) return;

    const userId = getUserId();
    if (!userId) return;

    userIdRef.current = userId;
    examIdRef.current = activeExam._id;

    // Cleanup previous socket
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    Object.values(peerConnections.current).forEach(pc => pc.close());
    peerConnections.current = {};
    pendingCandidates.current = {};
    connectedInstructors.current = new Set();

    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('exam:join', { examId: activeExam._id, userId });
      // Emit current stream status
      emitStreamStatus(!!cameraStreamRef.current, !!screenStreamRef.current);
    });

    socket.on('instructor:watching', ({ instructorSocketId }) => {
      connectedInstructors.current.add(instructorSocketId);
      // Send offer only if we have streams
      if (cameraStreamRef.current || screenStreamRef.current) {
        sendOffer(instructorSocketId);
      }
      // Always emit stream status so instructor sees camera/screen indicators
      emitStreamStatus(!!cameraStreamRef.current, !!screenStreamRef.current);
    });

    socket.on('webrtc:answer', async ({ answer, fromSocketId }) => {
      const pc = peerConnections.current[fromSocketId];
      if (!pc) return;
      try {
        if (pc.signalingState === 'have-local-offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
          const pending = pendingCandidates.current[fromSocketId] || [];
          for (const c of pending) {
            await pc.addIceCandidate(new RTCIceCandidate(c)).catch(() => {});
          }
          pendingCandidates.current[fromSocketId] = [];
        }
      } catch (err) {
        console.error('setRemoteDescription error:', err);
      }
    });

    socket.on('webrtc:ice', async ({ candidate, fromSocketId }) => {
      const pc = peerConnections.current[fromSocketId];
      if (!pc) return;
      if (pc.remoteDescription) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
      } else {
        if (!pendingCandidates.current[fromSocketId]) pendingCandidates.current[fromSocketId] = [];
        pendingCandidates.current[fromSocketId].push(candidate);
      }
    });

    return () => {
      Object.values(peerConnections.current).forEach(pc => pc.close());
      peerConnections.current = {};
      pendingCandidates.current = {};
      connectedInstructors.current = new Set();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [activeExam]);

  // Persist answers to localStorage whenever they change
  useEffect(() => {
    if (examStarted) localStorage.setItem('examAnswers', JSON.stringify(answers));
  }, [answers, examStarted]);

  useEffect(() => {
    if (examStarted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          // Also force-submit if exam end time has passed
          if (activeExam && new Date() >= new Date(activeExam.endDate)) {
            handleSubmit();
            return 0;
          }
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
    const examExpiry = new Date(start.getTime() + parseInt(exam.duration) * 60 * 1000);
    const effectiveEnd = examExpiry < end ? examExpiry : end;

    if (now < start) return 'not-started';
    if (now > effectiveEnd) return 'closed';
    return 'active';
  };

  const startExam = (exam) => {
    const status = getExamStatus(exam);
    if (status === 'closed') {
      showNotification('error', 'Exam Closed', 'This exam has ended and is no longer available.');
      return;
    }
    if (status !== 'active') {
      showNotification('error', 'Error', 'Exam is not available');
      return;
    }
    // Always show instructions page — late check happens on "Start Exam" click
    setActiveExam(exam);
    setShowInstructions(true);
    setExamStarted(false);
    setViewMode(false);
    setAnswers({});
  };

  const beginExam = () => {
    // Block if more than 15 minutes late
    const now = new Date();
    const start = new Date(activeExam.startDate);
    const minutesLate = Math.floor((now - start) / (1000 * 60));
    if (minutesLate > 15) {
      setShowLateModal(true);
      return;
    }
    const totalSeconds = parseInt(activeExam.duration) * 60;
    localStorage.setItem('examSession', JSON.stringify({
      examId: activeExam._id,
      startedAt: Date.now(),
      totalSeconds
    }));
    localStorage.setItem('examAnswers', JSON.stringify({}));
    setShowInstructions(false);
    setTimeLeft(totalSeconds);
    setExamStarted(true);
    setCurrentPage(0);
    setFlagged(new Set());
    setShowFlagged(false);
  };

  const clearExamSession = () => {
    localStorage.removeItem('examSession');
    localStorage.removeItem('examAnswers');
    localStorage.removeItem('examCameraActive');
    localStorage.removeItem('examScreenActive');
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
      
      const session = JSON.parse(localStorage.getItem('examSession') || 'null');
      const timeTaken = session
        ? Math.floor((Date.now() - session.startedAt) / 1000 / 60)
        : Math.floor((parseInt(activeExam.duration) * 60 - timeLeft) / 60);

      const response = await examAPI.submitExam(activeExam._id, { answers: answerArray, timeTaken });
      
      clearExamSession();

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

  if (activeExam && showInstructions) {
    const minutesLate = Math.floor((new Date() - new Date(activeExam.startDate)) / (1000 * 60));
    const isLate = minutesLate > 15;

    return (
      <div className="max-w-4xl mx-auto">

        {/* Late Modal */}
        {showLateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
              {/* Red top bar */}
              <div className="bg-gradient-to-r from-red-500 to-rose-600 p-6 text-center">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-5xl">⏰</span>
                </div>
                <h2 className="text-2xl font-bold text-white">You Are Too Late!</h2>
                <p className="text-red-100 text-sm mt-1">Exam entry period has closed</p>
              </div>
              {/* Body */}
              <div className="p-6 text-center">
                <p className="text-gray-700 dark:text-gray-300 text-base mb-2">
                  The exam started <strong className="text-red-600">{minutesLate} minutes ago</strong>.
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                  Students are only allowed to start the exam within <strong>15 minutes</strong> of the scheduled start time. You are no longer permitted to take this exam.
                </p>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-2xl p-4 mb-6">
                  <p className="text-red-700 dark:text-red-300 text-sm font-medium">📋 Exam: {activeExam.title}</p>
                  <p className="text-red-600 dark:text-red-400 text-xs mt-1">Started at: {new Date(activeExam.startDate).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}</p>
                </div>
                <button
                  onClick={() => {
                    setShowLateModal(false);
                    setActiveExam(null);
                    setShowInstructions(false);
                    stopCamera();
                    stopScreenShare();
                  }}
                  className="w-full py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-rose-700 transition-all shadow-lg"
                >
                  Back to My Exams
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <h2 className="text-2xl font-bold mb-1">{activeExam.title}</h2>
            <p className="text-blue-100 text-sm">{activeExam.course?.title}</p>
          </div>

          {/* Late warning banner */}
          {isLate && (
            <div className="bg-red-50 dark:bg-red-900/20 border-b-2 border-red-300 dark:border-red-700 px-6 py-3 flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="text-red-700 dark:text-red-300 font-semibold text-sm">You are {minutesLate} minutes late — you cannot start this exam.</p>
                <p className="text-red-500 dark:text-red-400 text-xs">Entry is only allowed within 15 minutes of the start time.</p>
              </div>
            </div>
          )}

          {/* Exam Info */}
          <div className="grid grid-cols-3 divide-x divide-gray-200 dark:divide-gray-700 border-b border-gray-200 dark:border-gray-700">
            <div className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{examStarted ? formatTime(timeLeft) : activeExam.duration}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{examStarted ? 'Time Left' : 'Minutes'}</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{activeExam.questions?.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Questions</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{activeExam.totalMarks}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Marks</p>
            </div>
          </div>

          {/* Two-column layout: instructions + camera */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:divide-x divide-gray-200 dark:divide-gray-700">

            {/* Instructions */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Exam Instructions
              </h3>
              <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                  <span>You have <strong>{activeExam.duration} minutes</strong> to complete this exam. The timer starts as soon as you click <strong>Start Exam</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                  <span>The exam has <strong>{activeExam.questions?.length} questions</strong> worth a total of <strong>{activeExam.totalMarks} marks</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                  <span>Once started, the exam <strong>cannot be paused</strong>. Make sure you are in a quiet environment.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span>
                  <span>The exam will be <strong>automatically submitted</strong> when the time runs out.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">5</span>
                  <span>Copying exam content is <strong>not allowed</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">6</span>
                  <span><strong>Turn on your camera</strong> before starting the exam. Your camera must be visible throughout the exam for identity verification.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">8</span>
                  <span><strong className="text-red-600">Do not switch tabs or navigate away</strong> during the exam. If you leave this page (except to the instructions), the system will give you only <strong>10 seconds</strong> to return. After that, you will be automatically marked as a <strong className="text-red-600">cheater</strong> and your exam will <strong>not be submitted</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">9</span>
                  <span><strong className="text-red-600">Late entry is strictly not allowed.</strong> If you arrive more than <strong>15 minutes</strong> after the exam has started, you will <strong className="text-red-600">not be permitted</strong> to take the exam. Make sure you start on time.</span>
                </li>
              </ul>
            </div>

            {/* Camera + Screen Share side by side */}
            <div className="p-6 flex flex-col gap-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Camera className="h-5 w-5 text-orange-500" />
                Camera & Screen Verification
              </h3>

              {/* Camera preview */}
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Camera</p>
                <div className="w-full aspect-video bg-gray-900 rounded-xl overflow-hidden relative flex items-center justify-center">
                  {cameraStream ? (
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <CameraOff className="h-10 w-10" />
                      <p className="text-xs">Camera is off</p>
                    </div>
                  )}
                  {cameraStream && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> Live
                    </div>
                  )}
                </div>
                {cameraError && <p className="text-xs text-red-500 mt-1">{cameraError}</p>}
                <button
                  onClick={cameraStream ? stopCamera : startCamera}
                  className={`mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                    cameraStream ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30' : 'bg-orange-500 text-white hover:bg-orange-600'
                  }`}
                >
                  {cameraStream ? <><CameraOff className="h-4 w-4" /> Turn Off</> : <><Camera className="h-4 w-4" /> Turn On Camera</>}
                </button>
              </div>

              {/* Screen share preview - hidden on mobile */}
              <div className={/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ? 'hidden' : ''}>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Screen Share</p>
                <div className="w-full aspect-video bg-gray-900 rounded-xl overflow-hidden relative flex items-center justify-center">
                  {screenStream ? (
                    <video ref={screenRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <MonitorOff className="h-10 w-10" />
                      <p className="text-xs">Screen not shared</p>
                    </div>
                  )}
                  {screenStream && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> Sharing
                    </div>
                  )}
                </div>
                {screenError && <p className="text-xs text-red-500 mt-1">{screenError}</p>}
                <button
                  onClick={screenStream ? stopScreenShare : startScreenShare}
                  className={`mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                    screenStream ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30' : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {screenStream ? <><MonitorOff className="h-4 w-4" /> Stop Sharing</> : <><Monitor className="h-4 w-4" /> Share Screen</>}
                </button>
              </div>
              {/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
                  <p className="text-xs text-blue-700 dark:text-blue-300 text-center">
                    📱 Screen sharing is not available on mobile. Only camera verification is required.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 pb-6 flex gap-3 border-t border-gray-200 dark:border-gray-700 pt-4">
            {!examStarted ? (
              <button
                onClick={() => { setActiveExam(null); setShowInstructions(false); clearExamSession(); stopCamera(); stopScreenShare(); }}
                className="flex-1 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
              >
                Cancel
              </button>
            ) : (
              <button
                onClick={() => setShowInstructions(false)}
                className="flex-1 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
              >
                ← Back to Exam
              </button>
            )}
            <button
              onClick={examStarted ? () => setShowInstructions(false) : beginExam}
              disabled={isLate && !examStarted}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all shadow-lg ${
                isLate && !examStarted
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
              }`}
            >
              {examStarted ? 'Resume Exam' : isLate ? '⏰ Entry Closed' : 'Start Exam'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (activeExam && !showInstructions) {
    const totalQuestions = activeExam.questions.length;
    const totalPages = Math.ceil(totalQuestions / PAGE_SIZE);
    const pageStart = currentPage * PAGE_SIZE;
    const pageEnd = Math.min(pageStart + PAGE_SIZE, totalQuestions);
    const pageQuestions = activeExam.questions.slice(pageStart, pageEnd);
    const answeredCount = Object.keys(answers).length;

    return (
      <div
        className="fixed inset-0 lg:left-64 flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden"
        style={{ userSelect: examStarted ? 'none' : 'auto' }}
        onCopy={(e) => examStarted && e.preventDefault()}
      >
        {/* Tab-switch warning overlay */}
        {tabWarning && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center border-4 border-red-500">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-red-600 mb-2">Warning!</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4 text-base">
                You have left the exam page. Return immediately or your exam will be <strong>automatically cancelled</strong>.
              </p>
              <div className="text-6xl font-bold text-red-600 mb-4 tabular-nums">{tabCountdown}</div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">seconds remaining to return</p>
              <button
                onClick={() => { cancelTabWarning(); window.focus(); }}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors text-lg"
              >
                Return to Exam
              </button>
            </div>
          </div>
        )}

        {/* Fixed Header */}
        <div ref={examHeaderRef} className="bg-white dark:bg-gray-800 shadow-lg flex-shrink-0 z-10">

          {/* Row 1: Title + Timer */}
          <div className="flex items-center justify-between pl-14 pr-3 sm:pl-5 sm:pr-5 pt-2 pb-1 gap-2">
            {/* Exam title */}
            <div className="min-w-0 flex-1">
              <h2 className="text-sm sm:text-base lg:text-xl font-bold text-gray-900 dark:text-white truncate leading-tight">{activeExam.title}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{activeExam.course?.title}</p>
              {viewMode && submission && (
                <p className="text-xs font-semibold text-blue-600">
                  Score: {submission.score}/{activeExam.totalMarks} ({((submission.score / activeExam.totalMarks) * 100).toFixed(1)}%)
                </p>
              )}
            </div>

            {/* Timer + Instructions */}
            <div className="flex-shrink-0 text-right">
              {examStarted && (
                <>
                  <div className={`text-xl sm:text-2xl lg:text-3xl font-bold tabular-nums ${timeLeft < 300 ? 'text-red-600' : 'text-blue-600'}`}>
                    {formatTime(timeLeft)}
                  </div>
                  <p className="text-xs text-gray-500 leading-none">Time Left</p>
                  <button
                    onClick={() => setShowInstructions(true)}
                    className="text-xs text-blue-500 hover:text-blue-700 underline mt-0.5"
                  >
                    Instructions
                  </button>
                </>
              )}
              {viewMode && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs font-medium">View Only</span>
              )}
            </div>
          </div>

          {/* Row 2: Camera + Screen previews */}
          {examStarted && (cameraStream || screenStream || localStorage.getItem('examCameraActive') === 'true' || localStorage.getItem('examScreenActive') === 'true') && (
            <div className="flex items-center gap-2 pl-14 pr-3 sm:pl-5 sm:pr-5 pb-1">
              {/* Camera - same size as screen share */}
              {cameraStream ? (
                <div className="relative rounded-lg overflow-hidden border-2 border-green-400 bg-gray-900"
                  style={{ width: 'clamp(80px, 14vw, 160px)', aspectRatio: '16/9' }}>
                  <video ref={examVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  <div className="absolute bottom-1 left-1 flex items-center gap-1 bg-green-500/90 text-white text-xs px-1.5 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    <span>Cam</span>
                  </div>
                </div>
              ) : localStorage.getItem('examCameraActive') === 'true' ? (
                <button onClick={startCamera}
                  className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-orange-400 bg-orange-50 dark:bg-orange-900/20 text-orange-600 text-xs font-medium gap-1 hover:bg-orange-100 transition-colors"
                  style={{ width: 'clamp(80px, 14vw, 160px)', aspectRatio: '16/9' }}
                >
                  <Camera className="h-4 w-4" /> Reconnect
                </button>
              ) : null}

              {/* Screen Share - same size as camera */}
              {screenStream ? (
                <div className="relative rounded-lg overflow-hidden border-2 border-purple-400 bg-gray-900"
                  style={{ width: 'clamp(100px, 22vw, 220px)', aspectRatio: '16/9' }}>
                  <video ref={examScreenRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  <div className="absolute bottom-1 left-1 flex items-center gap-1 bg-purple-500/90 text-white text-xs px-1.5 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    <span>Screen</span>
                  </div>
                </div>
              ) : localStorage.getItem('examScreenActive') === 'true' ? (
                <button onClick={startScreenShare}
                  className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-purple-400 bg-purple-50 dark:bg-purple-900/20 text-purple-600 text-xs font-medium gap-1 hover:bg-purple-100 transition-colors"
                  style={{ width: 'clamp(100px, 22vw, 220px)', aspectRatio: '16/9' }}
                >
                  <Monitor className="h-4 w-4" /> Reconnect
                </button>
              ) : null}
            </div>
          )}

          {/* Row 3: Progress bar + answered count */}
          <div className="pl-14 pr-3 sm:pl-5 sm:pr-5 pb-1.5">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>Q {currentPage + 1} of {totalQuestions}</span>
              <div className="flex items-center gap-3">
                {examStarted && flagged.size > 0 && (
                  <button
                    onClick={() => setShowFlagged(f => !f)}
                    className="flex items-center gap-1 text-orange-500 hover:text-orange-600 font-medium"
                  >
                    <Flag className="h-3 w-3 fill-current" />
                    {flagged.size} flagged
                  </button>
                )}
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${((currentPage + 1) / totalQuestions) * 100}%` }}
              />
            </div>

            {/* Flagged questions panel */}
            {showFlagged && flagged.size > 0 && (
              <div className="mt-2 p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-xl">
                <p className="text-xs font-semibold text-orange-700 dark:text-orange-300 mb-1.5">Flagged — tap to jump:</p>
                <div className="flex flex-wrap gap-1.5">
                  {[...flagged].sort((a, b) => a - b).map(idx => (
                    <button
                      key={idx}
                      onClick={() => jumpToQuestion(idx)}
                      className="px-2.5 py-1 bg-orange-500 text-white text-xs rounded-full font-semibold hover:bg-orange-600 transition-colors"
                    >
                      Q{idx + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic spacer - no longer needed, using fixed positioning */}

        {/* Question area - no scroll, fills remaining space */}
        <div className="flex-1 min-h-0 flex flex-col px-3 sm:px-6 py-2">
          <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col min-h-0">
          {pageQuestions.map((question, pageIdx) => {
            const idx = pageStart + pageIdx;
            const isCorrect = viewMode && question.correctAnswer.trim().toLowerCase() === answers[idx]?.trim().toLowerCase();
            return (
              <div key={idx} className={`flex-1 min-h-0 bg-white dark:bg-gray-800 rounded-xl shadow-lg flex flex-col ${
                viewMode ? (isCorrect ? 'border-2 border-green-500' : 'border-2 border-red-500')
                : flagged.has(idx) ? 'border-2 border-orange-400' : 'border border-gray-200 dark:border-gray-700'
              }`}>
                {/* Question text */}
                <div className="flex items-start justify-between px-4 sm:px-6 pt-3 pb-2 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
                  <h3 className="font-semibold text-sm sm:text-base flex-1 leading-snug">
                    <span className="text-blue-600 font-bold mr-1">Q{idx + 1}.</span>
                    {question.question}
                    <span className="text-xs font-normal text-gray-400 ml-2">({question.marks} mark{question.marks !== 1 ? 's' : ''})</span>
                  </h3>
                  {examStarted && (
                    <button
                      onClick={() => toggleFlag(idx)}
                      title={flagged.has(idx) ? 'Remove flag' : 'Flag for review'}
                      className={`ml-2 flex-shrink-0 p-1.5 rounded-lg transition-colors ${
                        flagged.has(idx)
                          ? 'text-orange-500 bg-orange-100 dark:bg-orange-900/30'
                          : 'text-gray-300 hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                      }`}
                    >
                      <Flag className={`h-4 w-4 ${flagged.has(idx) ? 'fill-current' : ''}`} />
                    </button>
                  )}
                </div>

                {/* Options - fill remaining space evenly */}
                <div className="px-4 sm:px-6 py-2 flex-1 min-h-0 flex flex-col justify-evenly">

                {question.type === 'mcq' && (
                  <div className="flex flex-col flex-1 justify-evenly">
                    {question.options.map((option, optIdx) => (
                      <label key={optIdx} className={`flex items-center px-3 sm:px-4 py-2 border-2 rounded-xl cursor-pointer transition-all ${
                        answers[idx] === option
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      } ${
                        viewMode && option === question.correctAnswer ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : ''
                      } ${viewMode ? 'cursor-default' : ''}`}>
                        <span className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center mr-3 text-xs font-bold ${
                          answers[idx] === option ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-300 dark:border-gray-500 text-gray-400'
                        }`}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <input type="radio" name={`question-${idx}`} value={option} checked={answers[idx] === option} onChange={(e) => !viewMode && setAnswers({ ...answers, [idx]: e.target.value })} disabled={viewMode} className="hidden" />
                        <span className="text-sm sm:text-base text-gray-800 dark:text-gray-200">{option}</span>
                        {viewMode && option === question.correctAnswer && (
                          <span className="ml-auto text-green-600 text-xs font-semibold">✓ Correct</span>
                        )}
                      </label>
                    ))}
                  </div>
                )}

                {question.type === 'true-false' && (
                  <div className="grid grid-cols-2 gap-4 flex-1 content-center">
                    {['True', 'False'].map((option) => (
                      <label key={option} className={`flex items-center justify-center px-4 py-3 sm:py-4 border-2 rounded-xl cursor-pointer transition-all text-base sm:text-lg font-semibold ${
                        answers[idx] === option
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 text-gray-700 dark:text-gray-300'
                      } ${
                        viewMode && option === question.correctAnswer ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700' : ''
                      } ${viewMode ? 'cursor-default' : ''}`}>
                        <input type="radio" name={`question-${idx}`} value={option} checked={answers[idx] === option} onChange={(e) => !viewMode && setAnswers({ ...answers, [idx]: e.target.value })} disabled={viewMode} className="hidden" />
                        {option === 'True' ? '✓ ' : '✗ '}{option}
                      </label>
                    ))}
                  </div>
                )}

               


                {question.type === 'fill-blank' && (
                  <div className="flex-1 flex flex-col justify-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 italic">{question.question}</p>
                    <input
                      type="text"
                      value={answers[idx] || ''}
                      onChange={(e) => !viewMode && setAnswers({ ...answers, [idx]: e.target.value })}
                      disabled={viewMode}
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 text-base focus:border-blue-500 focus:outline-none"
                      placeholder="Type your answer here..."
                    />
                    {viewMode && <p className="mt-3 text-sm text-green-600 dark:text-green-400 font-medium">✓ Correct Answer: {question.correctAnswer}</p>}
                  </div>
                )}

                {question.type === 'matching' && (() => {
                  const pairs = question.matchingPairs || question.correctAnswer?.split('|').map(p => { const [left, right] = p.split(':'); return { left, right }; }) || [];
                  const savedAnswers = answers[idx] ? JSON.parse(answers[idx]) : {};
                  return (
                    <div className="flex-1 flex flex-col justify-evenly">
                      <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 px-1">
                        <span>Left</span><span>Match with</span>
                      </div>
                      {pairs.map((pair, pIdx) => (
                        <div key={pIdx} className="grid grid-cols-2 gap-2 items-center">
                          <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm font-medium text-blue-800 dark:text-blue-300">{pair.left}</div>
                          {viewMode ? (
                            <div className={`px-3 py-2 rounded-lg text-sm font-medium ${
                              savedAnswers[pair.left] === pair.right
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                            }`}>
                              {savedAnswers[pair.left] || '—'}
                              {savedAnswers[pair.left] !== pair.right && <span className="ml-2 text-xs">(✓ {pair.right})</span>}
                            </div>
                          ) : (
                            <select
                              value={savedAnswers[pair.left] || ''}
                              onChange={(e) => {
                                const updated = { ...savedAnswers, [pair.left]: e.target.value };
                                setAnswers({ ...answers, [idx]: JSON.stringify(updated) });
                              }}
                              className="px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm"
                            >
                              <option value="">-- Select --</option>
                              {pairs.map(p => <option key={p.right} value={p.right}>{p.right}</option>)}
                            </select>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })()}

                </div>
              </div>
            );
          })}
          </div>
        </div>

        {/* Navigation - fixed at bottom */}
        <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-3 sm:px-6 py-3">
          <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button
            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="px-4 sm:px-5 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
          >
            ← Prev
          </button>

          {/* Question counter */}
          <div className="flex-1 text-center">
            <span className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300">
              Q {currentPage + 1} <span className="text-gray-400 font-normal">of</span> {totalQuestions}
            </span>
            {examStarted && (
              <div className="text-xs text-gray-500 mt-0.5">{answeredCount}/{totalQuestions} answered</div>
            )}
          </div>

          {currentPage < totalQuestions - 1 ? (
            <button
              onClick={() => setCurrentPage(p => p + 1)}
              className="px-4 sm:px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              Next →
            </button>
          ) : (
            examStarted ? (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 sm:px-5 py-2.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors text-sm sm:text-base"
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            ) : (
              <button
                onClick={() => { setActiveExam(null); setViewMode(false); setSubmission(null); }}
                className="px-4 sm:px-5 py-2.5 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors text-sm sm:text-base"
              >
                Close
              </button>
            )
          )}
          </div>
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
                      <p>Start: {new Date(exam.startDate).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}</p>
                      <p>End: {new Date(exam.endDate).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}</p>
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
                        {(() => {
                          const minutesLate = Math.floor((new Date() - new Date(exam.startDate)) / (1000 * 60));
                          const withinDuration = minutesLate < parseInt(exam.duration);
                          return (minutesLate > 15 && withinDuration) ? (
                            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold flex items-center gap-1">
                              ⚠️ {minutesLate}m Late
                            </span>
                          ) : null;
                        })()}
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
