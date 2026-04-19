import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Send, Bot, MessageSquare, History, Trash2, Edit2, Plus, Clock, MapPin, ExternalLink, Globe } from 'lucide-react';
import { chatHistoryAPI, groqChatAPI } from '../services/api';

const chatbotStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes wave {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(20deg); }
    75% { transform: rotate(-10deg); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  @keyframes slideUp {
    from { transform: translateY(100px) scale(0.8); opacity: 0; }
    to { transform: translateY(0) scale(1); opacity: 1; }
  }
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-20px); }
    60% { transform: translateY(-10px); }
  }
  @keyframes blink {
    0%, 90%, 100% { transform: scaleY(1); }
    95% { transform: scaleY(0.1); }
  }
  @keyframes wiggle {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(5deg); }
    75% { transform: rotate(-5deg); }
  }
  @keyframes heartbeat {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
  .animate-fadeIn { animation: fadeIn 0.6s ease-out forwards; }
  .animate-wave { animation: wave 1s ease-in-out 3; }
  .animate-float { animation: float 3s ease-in-out infinite; }
  .animate-slideUp { animation: slideUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
  .animate-bounce { animation: bounce 2s infinite; }
  .animate-blink { animation: blink 3s infinite; }
  .animate-wiggle { animation: wiggle 1s ease-in-out infinite; }
  .animate-heartbeat { animation: heartbeat 1.5s ease-in-out infinite; }
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = chatbotStyles;
  document.head.appendChild(styleSheet);
}

const WELCOME_MESSAGE = "Hello! I'm ፍኖት (Finot), your AAU E-Learning AI Assistant. Feel free to ask me about courses, enrollment, pricing, or anything else!";

// Map card component
const MapCard = ({ data }) => (
  <a href={data.map} target="_blank" rel="noopener noreferrer"
    className="flex items-start gap-3 mt-2 p-3 bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-700 rounded-2xl hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-200 group">
    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
      <MapPin className="h-5 w-5 text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-0.5">📍 Campus Location</p>
      <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{data.name}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{data.address}</p>
      <div className="flex items-center gap-1 mt-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium">
        <ExternalLink className="h-3 w-3" />
        <span>Open in Google Maps</span>
      </div>
    </div>
  </a>
);

// Website card component
const WebsiteCard = ({ data }) => (
  <a href={data.url} target="_blank" rel="noopener noreferrer"
    className="flex items-start gap-3 mt-2 p-3 bg-white dark:bg-gray-800 border-2 border-green-200 dark:border-green-700 rounded-2xl hover:border-green-400 dark:hover:border-green-500 hover:shadow-lg transition-all duration-200 group">
    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
      <Globe className="h-5 w-5 text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide mb-0.5">🌐 Official Website</p>
      <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{data.label}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{data.description}</p>
      <div className="flex items-center gap-1 mt-1.5 text-xs text-green-600 dark:text-green-400 font-medium">
        <ExternalLink className="h-3 w-3" />
        <span>Visit aau.edu.et</span>
      </div>
    </div>
  </a>
);

// Renders bot markdown responses with styled lists, bold, headers, etc.
const BotMessage = ({ text }) => {
  // Handle special card types
  if (text.startsWith('MAP_CARD:')) {
    try {
      const data = JSON.parse(text.slice('MAP_CARD:'.length));
      return (
        <div className="space-y-1">
          <p className="text-sm">Here is the address of the <strong>{data.name}</strong>:</p>
          <MapCard data={data} />
        </div>
      );
    } catch {}
  }
  if (text.startsWith('WEBSITE_CARD:')) {
    try {
      const data = JSON.parse(text.slice('WEBSITE_CARD:'.length));
      return (
        <div className="space-y-1">
          <p className="text-sm">Here is the official AAU website:</p>
          <WebsiteCard data={data} />
        </div>
      );
    } catch {}
  }
  const lines = text.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip empty lines (add spacing)
    if (!line.trim()) { elements.push(<div key={i} className="h-1" />); i++; continue; }

    // ### Heading
    if (line.startsWith('### ')) {
      elements.push(<p key={i} className="font-bold text-blue-700 dark:text-blue-300 text-sm mt-2 mb-1">{line.slice(4)}</p>);
      i++; continue;
    }
    // ## Heading
    if (line.startsWith('## ')) {
      elements.push(<p key={i} className="font-bold text-blue-700 dark:text-blue-300 text-base mt-2 mb-1">{line.slice(3)}</p>);
      i++; continue;
    }
    // # Heading
    if (line.startsWith('# ')) {
      elements.push(<p key={i} className="font-bold text-blue-700 dark:text-blue-300 text-base mt-2 mb-1">{line.slice(2)}</p>);
      i++; continue;
    }

    // Bullet list: lines starting with - or *
    if (/^[-*] /.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*] /.test(lines[i])) {
        items.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="my-1.5 space-y-1 pl-1">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400 flex-shrink-0" />
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered list: lines starting with 1. 2. etc.
    if (/^\d+\.\s/.test(line)) {
      const items = [];
      let num = 1;
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ''));
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="my-1.5 space-y-1 pl-1">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center mt-0.5">{idx + 1}</span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      elements.push(<hr key={i} className="my-2 border-gray-300 dark:border-gray-600" />);
      i++; continue;
    }

    // Normal paragraph
    elements.push(<p key={i} className="text-sm leading-relaxed">{renderInline(line)}</p>);
    i++;
  }

  return <div className="space-y-0.5">{elements}</div>;
};

// Renders inline markdown: **bold**, *italic*, `code`
const renderInline = (text) => {
  const parts = [];
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let last = 0, match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    const val = match[0];
    if (val.startsWith('`')) parts.push(<code key={match.index} className="px-1 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-xs font-mono">{val.slice(1, -1)}</code>);
    else if (val.startsWith('**')) parts.push(<strong key={match.index} className="font-semibold">{val.slice(2, -2)}</strong>);
    else parts.push(<em key={match.index} className="italic">{val.slice(1, -1)}</em>);
    last = match.index + val.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length ? parts : text;
};

const Chatbot = ({ showIcons = true }) => {
  const { t } = useTranslation();
  const currentPath = window.location.pathname;
  const isReelsView = currentPath === '/reels-view' || currentPath === '/reels';
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showCharacter, setShowCharacter] = useState(false);
  const [characterMessage, setCharacterMessage] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [chatSessions, setChatSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [editingTitle, setEditingTitle] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    setIsLoggedIn(!!token);
    if (token) loadChatSessions();

    const checkMobileMenu = () => {
      const mobileMenuOverlay = document.querySelector('[class*="fixed inset-0 z-40 lg:hidden"]');
      if (mobileMenuOverlay) {
        setIsMobileMenuOpen(!mobileMenuOverlay.classList.contains('pointer-events-none'));
      }
    };

    const observer = new MutationObserver(checkMobileMenu);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    checkMobileMenu();
    return () => observer.disconnect();
  }, []);

  const loadChatSessions = async () => {
    try {
      const response = await chatHistoryAPI.getChatSessions();
      setChatSessions(response.data);
    } catch (error) {
      console.error('Error loading chat sessions:', error);
    }
  };

  const createNewSession = () => {
    const sessionId = `chat_${Date.now()}`;
    setCurrentSessionId(sessionId);
    setMessages([{ id: 1, text: WELCOME_MESSAGE, sender: 'bot', timestamp: new Date() }]);
    setShowHistory(false);
    setShowCharacter(false);
    setCharacterMessage('');
  };

  const loadChatSession = async (sessionId) => {
    try {
      const response = await chatHistoryAPI.getChatSession(sessionId);
      setMessages(response.data.messages);
      setCurrentSessionId(sessionId);
      setShowHistory(false);
    } catch (error) {
      console.error('Error loading chat session:', error);
    }
  };

  const saveChatMessage = async (message) => {
    if (!isLoggedIn || !currentSessionId) return;
    try {
      await chatHistoryAPI.addMessage(currentSessionId, message);
      loadChatSessions();
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const deleteChatSession = async (sessionId) => {
    try {
      await chatHistoryAPI.deleteChatSession(sessionId);
      setChatSessions(prev => prev.filter(s => s.sessionId !== sessionId));
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const deleteAllSessions = async () => {
    try {
      await chatHistoryAPI.deleteAllSessions();
      setChatSessions([]);
      setCurrentSessionId(null);
      setMessages([]);
    } catch (error) {
      console.error('Error deleting all sessions:', error);
    }
  };

  const updateSessionTitle = async (sessionId, title) => {
    try {
      await chatHistoryAPI.updateTitle(sessionId, title);
      setChatSessions(prev => prev.map(s => s.sessionId === sessionId ? { ...s, title } : s));
      setEditingTitle(null);
    } catch (error) {
      console.error('Error updating title:', error);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0 && !currentSessionId && !showHistory) {
      if (isLoggedIn) createNewSession();

      setShowCharacter(true);
      setTimeout(() => setCharacterMessage('👋 Hi there!'), 800);
      setTimeout(() => setCharacterMessage("I'm ፍኖት (Finot)! How can I help?"), 2500);
      setTimeout(() => {
        const initialMessage = { id: 1, text: WELCOME_MESSAGE, sender: 'bot', timestamp: new Date(), animated: true };
        setMessages([initialMessage]);
        if (isLoggedIn && currentSessionId) saveChatMessage(initialMessage);
        setShowCharacter(false);
      }, 4000);
    }
  }, [isOpen, currentSessionId, isLoggedIn, showHistory]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = { id: Date.now(), text: inputMessage, sender: 'user', timestamp: new Date() };
    const currentInput = inputMessage;
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    if (isLoggedIn && currentSessionId) await saveChatMessage(userMessage);

    try {
      const history = messages
        .filter(m => !m.animated && m.sender !== 'bot' || (m.sender === 'bot' && !m.text.includes('IT department')))
        .slice(-6)
        .map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text }));

      const response = await groqChatAPI.sendMessage(currentInput, history);
      const botResponse = { id: Date.now() + 1, text: response.data.reply, sender: 'bot', timestamp: new Date() };
      setMessages(prev => [...prev, botResponse]);
      if (isLoggedIn && currentSessionId) await saveChatMessage(botResponse);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: 'Sorry, I am having trouble connecting. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  return (
    <>
      {!isMobileMenuOpen && showIcons && !isReelsView && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`fixed bottom-6 right-6 z-[99999] w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 group overflow-hidden ${isOpen ? '' : 'animate-bounce'}`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full animate-pulse"></div>
          <div className="relative z-10 flex items-center justify-center">
            {isOpen ? <X className="h-6 w-6 transform group-hover:rotate-90 transition-transform duration-300" /> : <MessageSquare className="h-6 w-6" />}
          </div>
          {!isOpen && <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>}
        </button>
      )}

      {!isMobileMenuOpen && showIcons && !isReelsView && (
        <div
          className={`fixed z-[9999] transition-all duration-300 transform ${isOpen ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-0 opacity-0 pointer-events-none'}`}
          style={{ bottom: '5.5rem', right: '1.5rem', width: '380px', maxWidth: 'calc(100vw - 2rem)', transformOrigin: 'bottom right' }}
        >
          <div className="flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700" style={{ height: '520px', maxHeight: 'calc(100vh - 8rem)' }}>

            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-t-2xl flex-shrink-0 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 animate-pulse pointer-events-none"></div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base leading-tight">ፍኖት (Finot) — AAU AI Assistant</h3>
                    <div className="text-xs opacity-90 flex items-center gap-1 mt-0.5">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span>Online</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {isLoggedIn && (
                    <button onClick={() => setShowHistory(!showHistory)} className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors" title="Chat History">
                      <History className="h-4 w-4" />
                    </button>
                  )}
                  <button onClick={() => setIsOpen(false)} className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* History Panel */}
            {showHistory ? (
              <div className="p-4 space-y-4 overflow-y-auto flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-800 dark:text-white">Chat History</h4>
                  <div className="flex space-x-2">
                    <button onClick={createNewSession} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" title="New Chat">
                      <Plus className="h-4 w-4" />
                    </button>
                    {chatSessions.length > 0 && (
                      <button onClick={() => { if (window.confirm('Delete all chat history?')) deleteAllSessions(); }} className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                {chatSessions.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                    <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No chat history yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {chatSessions.map((session) => (
                      <div key={session.sessionId} className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${currentSessionId === session.sessionId ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'}`} onClick={() => loadChatSession(session.sessionId)}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            {editingTitle === session.sessionId ? (
                              <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                                onBlur={() => newTitle.trim() ? updateSessionTitle(session.sessionId, newTitle.trim()) : setEditingTitle(null)}
                                onKeyPress={(e) => e.key === 'Enter' && (newTitle.trim() ? updateSessionTitle(session.sessionId, newTitle.trim()) : setEditingTitle(null))}
                                className="w-full text-sm font-medium bg-transparent border-none outline-none text-gray-800 dark:text-white" autoFocus />
                            ) : (
                              <h5 className="text-sm font-medium text-gray-800 dark:text-white truncate">{session.title}</h5>
                            )}
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">{session.lastMessage}</p>
                            <div className="flex items-center text-xs text-gray-400 mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>{new Date(session.lastActivity).toLocaleDateString()}</span>
                              <span className="mx-2">•</span>
                              <span>{session.messageCount} messages</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 ml-2">
                            <button onClick={(e) => { e.stopPropagation(); setEditingTitle(session.sessionId); setNewTitle(session.title); }} className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                              <Edit2 className="h-3 w-3" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); if (window.confirm('Delete this chat?')) deleteChatSession(session.sessionId); }} className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="overflow-y-auto p-3 sm:p-4 space-y-3 flex-1 relative">
                {showCharacter && (
                  <div className="flex justify-center items-center h-full animate-slideUp">
                    <div className="text-center">
                      <div className="relative mb-4 animate-bounce">
                        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl animate-float relative overflow-hidden">
                          <div className="relative z-10">
                            <div className="flex space-x-2 mb-1">
                              <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center animate-blink"><div className="w-2 h-2 bg-black rounded-full animate-wiggle"></div></div>
                              <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center animate-blink"><div className="w-2 h-2 bg-black rounded-full animate-wiggle"></div></div>
                            </div>
                            <div className="w-4 h-2 bg-white rounded-full mx-auto animate-heartbeat"></div>
                          </div>
                          <div className="absolute top-2 left-2 w-4 h-4 bg-white/30 rounded-full animate-pulse"></div>
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                        </div>
                        <div className="absolute top-8 -left-2 w-6 h-2 bg-blue-500 rounded-full transform -rotate-45 animate-wave"></div>
                        <div className="absolute top-8 -right-2 w-6 h-2 bg-blue-500 rounded-full transform rotate-45 animate-wave" style={{ animationDelay: '0.3s' }}></div>
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <div className="flex space-x-1">
                            <span className="text-yellow-400 animate-ping text-xs">✨</span>
                            <span className="text-pink-400 animate-pulse text-xs">⭐</span>
                            <span className="text-blue-400 animate-ping text-xs">💫</span>
                          </div>
                        </div>
                      </div>
                      {characterMessage && (
                        <div className="relative animate-fadeIn">
                          <div className="bg-white dark:bg-gray-700 px-6 py-3 rounded-2xl shadow-xl border-2 border-blue-200 dark:border-gray-600 animate-heartbeat">
                            <p className="text-lg font-bold text-gray-800 dark:text-white bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{characterMessage}</p>
                          </div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                            <div className="w-0 h-0 border-l-4 border-r-4 border-t-8 border-transparent border-t-white dark:border-t-gray-700"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {!showCharacter && messages.map((message, index) => (
                  <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`} style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className={`max-w-[85%] sm:max-w-xs px-4 py-3 rounded-2xl text-sm shadow-sm ${message.sender === 'user' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white ml-auto' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-600'}`}>
                      {message.sender === 'bot' ? <BotMessage text={message.text} /> : <p className="text-sm">{message.text}</p>}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-2xl">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Input */}
            {!showHistory && (
              <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 bg-white dark:bg-gray-800 rounded-b-2xl">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={t('chatbot.placeholder')}
                    className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 outline-none"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim()}
                    className="flex-shrink-0 w-9 h-9 flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
