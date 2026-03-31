import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Send, Bot, MessageSquare, History, Trash2, Edit2, Plus, Clock } from 'lucide-react';
import { chatHistoryAPI, groqChatAPI } from '../services/api';

// Add custom styles
const chatbotStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes typing {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0.5; }
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
  
  .animate-fadeIn {
    animation: fadeIn 0.6s ease-out forwards;
  }
  
  .animate-typing {
    animation: typing 2s infinite;
  }
  
  .animate-wave {
    animation: wave 1s ease-in-out 3;
  }
  
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
  
  .animate-slideUp {
    animation: slideUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }
  
  .animate-bounce {
    animation: bounce 2s infinite;
  }
  
  .animate-blink {
    animation: blink 3s infinite;
  }
  
  .animate-wiggle {
    animation: wiggle 1s ease-in-out infinite;
  }
  
  .animate-heartbeat {
    animation: heartbeat 1.5s ease-in-out infinite;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = chatbotStyles;
  document.head.appendChild(styleSheet);
}

const Chatbot = ({ showIcons = true }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isInHeroSection, setIsInHeroSection] = useState(false);
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
    // Check if user is logged in
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    setIsLoggedIn(!!token);
    
    if (token) {
      loadChatSessions();
    }

    const checkMobileMenu = () => {
      const mobileMenuOverlay = document.querySelector('[class*="fixed inset-0 z-40 lg:hidden"]');
      if (mobileMenuOverlay) {
        const isVisible = !mobileMenuOverlay.classList.contains('pointer-events-none');
        setIsMobileMenuOpen(isVisible);
      }
    };

    const checkHeroSection = () => {
      const heroSection = document.querySelector('section');
      if (heroSection && window.innerWidth < 768) {
        const rect = heroSection.getBoundingClientRect();
        setIsInHeroSection(rect.bottom > 0 && rect.top < window.innerHeight);
      } else {
        setIsInHeroSection(false);
      }
    };

    const observer = new MutationObserver(checkMobileMenu);
    const targetNode = document.body;
    observer.observe(targetNode, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    
    checkMobileMenu();
    checkHeroSection();
    
    window.addEventListener('scroll', checkHeroSection);
    window.addEventListener('resize', checkHeroSection);
    
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', checkHeroSection);
      window.removeEventListener('resize', checkHeroSection);
    };
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
    setMessages([{
      id: 1,
      text: "Hello! I'm your AAU E-Learning assistant. Feel free to ask me about courses, enrollment, pricing, or anything else!",
      sender: 'bot',
      timestamp: new Date()
    }]);
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
      setChatSessions(prev => prev.filter(session => session.sessionId !== sessionId));
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error deleting chat session:', error);
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
      setChatSessions(prev => prev.map(session => 
        session.sessionId === sessionId ? { ...session, title } : session
      ));
      setEditingTitle(null);
    } catch (error) {
      console.error('Error updating title:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0 && !currentSessionId && !showHistory) {
      if (isLoggedIn) {
        createNewSession();
      }
      
      setShowCharacter(true);
      
      setTimeout(() => {
        setCharacterMessage('👋 Hi there!');
      }, 800);
      
      setTimeout(() => {
        setCharacterMessage('What can I help you with?');
      }, 2500);
      
      setTimeout(() => {
        const initialMessage = {
          id: 1,
          text: "Hello! I'm your AAU E-Learning assistant. Feel free to ask me about courses, enrollment, pricing, or anything else!",
          sender: 'bot',
          timestamp: new Date(),
          animated: true
        };
        setMessages([initialMessage]);
        if (isLoggedIn && currentSessionId) {
          saveChatMessage(initialMessage);
        }
        setShowCharacter(false);
      }, 4000);
    }
  }, [isOpen, t, currentSessionId, isLoggedIn, showHistory]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    const currentInput = inputMessage;
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    if (isLoggedIn && currentSessionId) {
      await saveChatMessage(userMessage);
    }

    try {
      // Build conversation history for context
      const history = messages
        .filter(m => !m.animated)
        .slice(-10)
        .map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text }));

      const response = await groqChatAPI.sendMessage(currentInput, history);
      const botResponse = {
        id: Date.now() + 1,
        text: response.data.reply,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
      if (isLoggedIn && currentSessionId) {
        await saveChatMessage(botResponse);
      }
    } catch (error) {
      const errorResponse = {
        id: Date.now() + 1,
        text: 'Sorry, I am having trouble connecting. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isMobileMenuOpen && showIcons && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`fixed bottom-6 right-6 z-[99999] w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 group overflow-hidden ${
            isOpen ? '' : 'animate-bounce'
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full animate-pulse"></div>
          <div className="relative z-10 flex items-center justify-center">
            {isOpen ? (
              <X className="h-6 w-6 transform group-hover:rotate-90 transition-transform duration-300" />
            ) : (
              <MessageSquare className="h-6 w-6 transform group-hover:scale-110 transition-transform duration-300" />
            )}
          </div>
          {!isOpen && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
          )}
        </button>
      )}

      {/* Chat Popup */}
      {!isMobileMenuOpen && showIcons && (
        <div
          className={`fixed z-[9999] transition-all duration-300 transform ${
            isOpen ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-0 opacity-0 pointer-events-none'
          }`}
          style={{
            bottom: '5.5rem',
            right: '1.5rem',
            width: '380px',
            maxWidth: 'calc(100vw - 2rem)',
            transformOrigin: 'bottom right',
          }}
        >
        <div className="flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700" style={{ height: '520px', maxHeight: 'calc(100vh - 8rem)' }}>

        {/* Chat Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-t-2xl flex-shrink-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 animate-pulse pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-base leading-tight">{t('chatbot.title')}</h3>
                <div className="text-xs opacity-90 flex items-center gap-1 mt-0.5">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Online</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {isLoggedIn && (
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors"
                  title="Chat History"
                >
                  <History className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages Area or History Panel */}
        {showHistory ? (
          <div className="p-4 space-y-4 overflow-y-auto" style={{ height: '320px', minHeight: '200px' }}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-800 dark:text-white">Chat History</h4>
              <div className="flex space-x-2">
                <button
                  onClick={createNewSession}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  title="New Chat"
                >
                  <Plus className="h-4 w-4" />
                </button>
                {chatSessions.length > 0 && (
                  <button
                    onClick={() => {
                      if (window.confirm('Delete all chat history?')) {
                        deleteAllSessions();
                      }
                    }}
                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    title="Delete All"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            
            {chatSessions.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No chat history yet</p>
                <p className="text-sm">Start a conversation to save your chats</p>
              </div>
            ) : (
              <div className="space-y-2">
                {chatSessions.map((session) => (
                  <div
                    key={session.sessionId}
                    className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                      currentSessionId === session.sessionId
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                        : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                    onClick={() => loadChatSession(session.sessionId)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        {editingTitle === session.sessionId ? (
                          <input
                            type="text"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            onBlur={() => {
                              if (newTitle.trim()) {
                                updateSessionTitle(session.sessionId, newTitle.trim());
                              } else {
                                setEditingTitle(null);
                              }
                            }}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                if (newTitle.trim()) {
                                  updateSessionTitle(session.sessionId, newTitle.trim());
                                } else {
                                  setEditingTitle(null);
                                }
                              }
                            }}
                            className="w-full text-sm font-medium bg-transparent border-none outline-none text-gray-800 dark:text-white"
                            autoFocus
                          />
                        ) : (
                          <h5 className="text-sm font-medium text-gray-800 dark:text-white truncate">
                            {session.title}
                          </h5>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                          {session.lastMessage}
                        </p>
                        <div className="flex items-center text-xs text-gray-400 dark:text-gray-500 mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{new Date(session.lastActivity).toLocaleDateString()}</span>
                          <span className="mx-2">•</span>
                          <span>{session.messageCount} messages</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTitle(session.sessionId);
                            setNewTitle(session.title);
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                          title="Edit Title"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Delete this chat?')) {
                              deleteChatSession(session.sessionId);
                            }
                          }}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete Chat"
                        >
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
          <div className="overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 flex-1 relative" style={{ height: '320px', minHeight: '200px' }}>
          
          {/* Animated Character */}
          {showCharacter && (
            <div className="flex justify-center items-center h-full animate-slideUp">
              <div className="text-center">
                {/* Cartoon Character */}
                <div className="relative mb-4 animate-bounce">
                  {/* Character Body */}
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl animate-float relative overflow-hidden">
                    {/* Character Face */}
                    <div className="relative z-10">
                      {/* Eyes */}
                      <div className="flex space-x-2 mb-1">
                        <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center animate-blink">
                          <div className="w-2 h-2 bg-black rounded-full animate-wiggle"></div>
                        </div>
                        <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center animate-blink">
                          <div className="w-2 h-2 bg-black rounded-full animate-wiggle"></div>
                        </div>
                      </div>
                      {/* Mouth */}
                      <div className="w-4 h-2 bg-white rounded-full mx-auto animate-heartbeat"></div>
                    </div>
                    
                    {/* Shine Effect */}
                    <div className="absolute top-2 left-2 w-4 h-4 bg-white/30 rounded-full animate-pulse"></div>
                    
                    {/* Floating Particles */}
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                    <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                  </div>
                  
                  {/* Character Arms */}
                  <div className="absolute top-8 -left-2 w-6 h-2 bg-blue-500 rounded-full transform -rotate-45 animate-wave"></div>
                  <div className="absolute top-8 -right-2 w-6 h-2 bg-blue-500 rounded-full transform rotate-45 animate-wave" style={{animationDelay: '0.3s'}}></div>
                  
                  {/* Magic Sparkles */}
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="flex space-x-1">
                      <span className="text-yellow-400 animate-ping text-xs">✨</span>
                      <span className="text-pink-400 animate-pulse text-xs" style={{animationDelay: '0.2s'}}>⭐</span>
                      <span className="text-blue-400 animate-ping text-xs" style={{animationDelay: '0.4s'}}>💫</span>
                    </div>
                  </div>
                </div>
                
                {/* Speech Bubble */}
                {characterMessage && (
                  <div className="relative animate-fadeIn">
                    <div className="bg-white dark:bg-gray-700 px-6 py-3 rounded-2xl shadow-xl border-2 border-blue-200 dark:border-gray-600 animate-heartbeat">
                      <p className="text-lg font-bold text-gray-800 dark:text-white bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {characterMessage}
                      </p>
                    </div>
                    {/* Speech Bubble Tail */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                      <div className="w-0 h-0 border-l-4 border-r-4 border-t-8 border-transparent border-t-white dark:border-t-gray-700"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {!showCharacter && messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              style={{animationDelay: `${index * 0.2}s`}}
            >
              <div
                className={`max-w-[85%] sm:max-w-xs px-4 py-3 rounded-2xl text-sm shadow-sm transform transition-all duration-300 hover:scale-105 ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white ml-auto'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-600'
                }`}
              >
                <p className="text-sm">{message.text}</p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-2xl max-w-[85%] sm:max-w-xs">
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

        {/* Input Area */}
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