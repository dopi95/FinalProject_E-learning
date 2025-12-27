import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircle, X, Send, Bot } from 'lucide-react';

const Chatbot = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const checkMobileMenu = () => {
      const mobileMenuOverlay = document.querySelector('[class*="fixed inset-0 z-40 lg:hidden"]');
      if (mobileMenuOverlay) {
        const isVisible = !mobileMenuOverlay.classList.contains('pointer-events-none');
        setIsMobileMenuOpen(isVisible);
      }
    };

    const observer = new MutationObserver(checkMobileMenu);
    const targetNode = document.body;
    observer.observe(targetNode, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    
    checkMobileMenu();
    
    return () => observer.disconnect();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 1,
        text: t('chatbot.welcome'),
        sender: 'bot',
        timestamp: new Date()
      }]);
    }
  }, [isOpen, t]);

  const generateResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('course') || message.includes('ኮርስ')) {
      return 'We offer various courses including React Development, UI/UX Design, and Digital Marketing. You can browse all courses on our courses page. Would you like to know more about a specific course?';
    }
    if (message.includes('price') || message.includes('cost') || message.includes('ዋጋ')) {
      return 'Our courses are priced competitively. React Development is 2,500 Birr, UI/UX Design is 1,800 Birr, and Digital Marketing is 3,200 Birr. All courses include lifetime access and certificates.';
    }
    if (message.includes('certificate') || message.includes('ሰርተፊኬት')) {
      return 'Yes! All our courses include a certificate of completion. You\'ll receive your certificate after successfully finishing the course requirements.';
    }
    if (message.includes('instructor') || message.includes('አስተማሪ')) {
      return 'Our courses are taught by experienced professionals including Dr. Sarah Johnson, Prof. Michael Chen, and Dr. Emily Rodriguez. All instructors provide direct support to students.';
    }
    if (message.includes('enroll') || message.includes('register') || message.includes('ይመዝገቡ')) {
      return 'To enroll in a course, simply click the "Enroll Now" button on any course card. You can also view detailed course information before enrolling.';
    }
    if (message.includes('hello') || message.includes('hi') || message.includes('ሰላም')) {
      return 'Hello! Welcome to AAU E-Learning. I\'m here to help you with any questions about our courses, enrollment, or platform features.';
    }
    if (message.includes('help') || message.includes('support') || message.includes('ረዳት')) {
      return 'I\'m here to help! You can ask me about our courses, pricing, enrollment process, certificates, or any other questions about AAU E-Learning.';
    }
    
    return 'Thank you for your question! For specific inquiries, please contact our support team or browse our courses to learn more. Is there anything specific about our courses I can help you with?';
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        text: generateResponse(inputMessage),
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isMobileMenuOpen && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          {isOpen ? (
            <X className="h-5 w-5 sm:h-6 sm:w-6 mx-auto" />
          ) : (
            <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 mx-auto" />
          )}
        </button>
      )}

      {/* Chat Popup */}
      {!isMobileMenuOpen && (
        <div className={`fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-40 w-[calc(100vw-2rem)] sm:w-80 md:w-96 max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 transition-all duration-300 transform ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} style={{ maxHeight: 'calc(100vh - 12rem)' }}>
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 sm:p-4 rounded-t-2xl flex-shrink-0 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm sm:text-base">{t('chatbot.title')}</h3>
                <p className="text-xs opacity-90">Online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-full transition-colors relative z-20"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 flex-1" style={{ height: 'calc(60vh - 8rem)', minHeight: '250px', maxHeight: '400px' }}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-xs px-3 py-2 rounded-2xl text-sm ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white ml-auto'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white'
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

        {/* Input Area */}
        <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 relative z-10">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('chatbot.placeholder')}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0 relative z-20"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;