import React, { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../services/api';
import { Send, Search, User, ArrowLeft, MoreVertical, Edit, Trash2, X, Check, Plus, Smile, Paperclip, Phone, Video, Info } from 'lucide-react';
import { getUserData } from '../utils/userUtils';

// Hide scrollbars globally for this component
const scrollbarHideStyle = `
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  /* Prevent zoom on mobile */
  input, textarea, select {
    font-size: 16px !important;
    transform-origin: left top;
  }
  
  /* Mobile touch improvements */
  * {
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
    -webkit-overflow-scrolling: touch;
  }
  
  input, textarea {
    -webkit-user-select: text;
    user-select: text;
  }
  
  /* Prevent horizontal scroll */
  body, html {
    overflow-x: hidden;
  }
  
  .chat-container {
    max-width: 100vw;
    overflow-x: hidden;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = scrollbarHideStyle;
  if (!document.head.querySelector('style[data-scrollbar-hide]')) {
    styleElement.setAttribute('data-scrollbar-hide', 'true');
    document.head.appendChild(styleElement);
  }
}

const ChatInterface = ({ onChatViewed }) => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showChatList, setShowChatList] = useState(true);
  const messagesEndRef = useRef(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState('');
  const [showMessageOptions, setShowMessageOptions] = useState(null);
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, message: null });
  const [selectedMessage, setSelectedMessage] = useState(null);
  const messageInputRef = useRef(null);
  const editInputRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef(null);

  const downloadFile = (message) => {
    if (message.fileId) {
      const fileData = localStorage.getItem(`file_${message.fileId}`);
      if (fileData) {
        const file = JSON.parse(fileData);
        const link = document.createElement('a');
        link.href = file.data;
        link.download = message.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert('File not found in storage.');
      }
    } else {
      // For text-only file messages, show info
      alert(`File "${message.fileName}" is not available for download. This was sent as a text message only.`);
    }
  };

  const parseMessage = (message) => {
    try {
      const parsed = JSON.parse(message.content);
      if (parsed.fileId && parsed.fileName) {
        // Get file data from localStorage
        const fileData = localStorage.getItem(`file_${parsed.fileId}`);
        if (fileData) {
          const file = JSON.parse(fileData);
          return { 
            ...message, 
            ...parsed, 
            fileUrl: file.data,
            isFile: true, 
            isValidFile: true 
          };
        }
        return { ...message, ...parsed, isFile: true, isValidFile: false };
      }
    } catch (e) {
      // Check if it's a file message by content pattern
      if (message.content.includes('📎')) {
        const fileName = message.content.replace('📎 ', '');
        return { 
          ...message, 
          fileName: fileName,
          isFile: true, 
          isValidFile: false,
          fileType: fileName.includes('.jpg') || fileName.includes('.png') || fileName.includes('.jpeg') ? 'image' : 'application'
        };
      }
    }
    return { ...message, isFile: false };
  };

  const emojis = ['😀', '😂', '😍', '🥰', '😊', '😎', '🤔', '😢', '😭', '😡', '👍', '👎', '❤️', '🔥', '💯', '🎉', '👏', '🙏', '💪', '✨'];

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      sendFileMessage(file);
    }
  };

  const sendFileMessage = async (file) => {
    if (!selectedChat || loading) return;

    try {
      setLoading(true);
      
      // Create object URL for the file
      const fileUrl = URL.createObjectURL(file);
      const fileType = file.type.split('/')[0];
      
      // Store file in localStorage for persistence
      const fileId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      const reader = new FileReader();
      
      reader.onload = async () => {
        try {
          // Store file data in localStorage
          localStorage.setItem(`file_${fileId}`, JSON.stringify({
            data: reader.result,
            name: file.name,
            type: file.type,
            size: file.size
          }));
          
          // Create file message
          const fileMessage = {
            content: `📎 ${file.name}`,
            fileId: fileId,
            fileName: file.name,
            fileSize: file.size,
            fileType: fileType,
            mimeType: file.type,
            isFile: true
          };
          
          const response = await chatAPI.sendMessage(selectedChat._id, JSON.stringify(fileMessage));
          
          // Add file data to message
          const messageWithFile = {
            ...response.data,
            ...fileMessage
          };
          
          setMessages(prev => [...prev, messageWithFile]);
          
          setChats(prev => prev.map(chat => 
            chat._id === selectedChat._id 
              ? { ...chat, lastMessageText: `📎 ${file.name}`, lastMessage: new Date() }
              : chat
          ));
        } catch (error) {
          console.error('Error processing file:', error);
          alert('Failed to process file. Please try again.');
        } finally {
          setLoading(false);
          setSelectedFile(null);
        }
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error sending file:', error);
      alert('Failed to send file. Please try again.');
      setLoading(false);
      setSelectedFile(null);
    }
  };

  const insertEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    messageInputRef.current?.focus();
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu({ show: false, x: 0, y: 0, message: null });
      setSelectedMessage(null);
      setShowMessageOptions(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      // Always show chat list on desktop
      if (window.innerWidth >= 768) {
        setShowChatList(true);
      }
    };
    
    // Set initial state
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchChats();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat._id);
      markAsRead(selectedChat._id);
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChats = async () => {
    try {
      const response = await chatAPI.getChats();
      setChats(response.data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await chatAPI.getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const response = await chatAPI.getMessages(chatId);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const startChat = async (userId) => {
    try {
      setLoading(true);
      const response = await chatAPI.startChat(userId);
      const newChat = response.data;
      
      setChats(prev => {
        const exists = prev.find(chat => chat._id === newChat._id);
        if (exists) return prev;
        return [newChat, ...prev];
      });
      
      setSelectedChat(newChat);
      setShowUserSearch(false);
      setSearchQuery('');
      
      if (isMobile) {
        setShowChatList(false);
      }
    } catch (error) {
      console.error('Error starting chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat || loading) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    
    try {
      setLoading(true);
      const response = await chatAPI.sendMessage(selectedChat._id, messageText);
      setMessages(prev => [...prev, response.data]);
      
      // Update chat list
      setChats(prev => prev.map(chat => 
        chat._id === selectedChat._id 
          ? { ...chat, lastMessageText: messageText, lastMessage: new Date() }
          : chat
      ));
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(messageText);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (chatId) => {
    try {
      await chatAPI.markAsRead(chatId);
      // Remove unread count immediately when chat is opened
      setChats(prev => prev.map(chat => 
        chat._id === chatId ? { ...chat, unreadCount: 0 } : chat
      ));
      // Notify parent component to update unread count
      if (onChatViewed) {
        onChatViewed(chatId);
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const deleteMessageForMe = async (messageId) => {
    try {
      await chatAPI.deleteMessage(messageId);
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
      setContextMenu({ show: false, x: 0, y: 0, message: null });
      setSelectedMessage(null);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const deleteMessageForEveryone = async (messageId) => {
    try {
      await chatAPI.deleteMessage(messageId);
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
      setContextMenu({ show: false, x: 0, y: 0, message: null });
      setSelectedMessage(null);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleRightClick = (e, message) => {
    e.preventDefault();
    if (!e.currentTarget) return;
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const menuWidth = 200;
    const menuHeight = 120;
    
    let x = e.clientX;
    let y = e.clientY;
    
    // Adjust position to keep menu within viewport
    if (x + menuWidth > viewportWidth) {
      x = viewportWidth - menuWidth - 10;
    }
    if (y + menuHeight > viewportHeight) {
      y = viewportHeight - menuHeight - 10;
    }
    if (x < 10) x = 10;
    if (y < 10) y = 10;
    
    setSelectedMessage(message._id);
    setContextMenu({
      show: true,
      x,
      y,
      message
    });
  };

  const handleTouchStart = (e, message) => {
    const touchTimer = setTimeout(() => {
      const touch = e.touches[0];
      if (!e.currentTarget || !touch) return;
      
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const menuWidth = 200;
      const menuHeight = 120;
      
      let x = touch.clientX;
      let y = touch.clientY;
      
      // Adjust position to keep menu within viewport
      if (x + menuWidth > viewportWidth) {
        x = viewportWidth - menuWidth - 10;
      }
      if (y + menuHeight > viewportHeight) {
        y = viewportHeight - menuHeight - 10;
      }
      if (x < 10) x = 10;
      if (y < 10) y = 10;
      
      setSelectedMessage(message._id);
      setContextMenu({
        show: true,
        x,
        y,
        message
      });
      
      // Add haptic feedback on mobile
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500);
    
    const handleTouchEnd = () => {
      clearTimeout(touchTimer);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchmove', handleTouchEnd);
    };
    
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('touchmove', handleTouchEnd);
  };

  const updateMessage = async (messageId, newContent) => {
    try {
      await chatAPI.updateMessage(messageId, newContent);
      setMessages(prev => prev.map(msg => 
        msg._id === messageId ? { ...msg, content: newContent, edited: true } : msg
      ));
      setEditingMessage(null);
      setEditText('');
    } catch (error) {
      console.error('Error updating message:', error);
    }
  };

  const deleteChat = async () => {
    if (!selectedChat || !confirm('Are you sure you want to delete this chat? This action cannot be undone.')) return;
    
    try {
      await chatAPI.deleteChat(selectedChat._id);
      setChats(prev => prev.filter(chat => chat._id !== selectedChat._id));
      setSelectedChat(null);
      setMessages([]);
      if (isMobile) setShowChatList(true);
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const startEdit = (message) => {
    setEditingMessage(message._id);
    setEditText(message.content);
    setShowMessageOptions(null);
    setTimeout(() => editInputRef.current?.focus(), 100);
  };

  const cancelEdit = () => {
    setEditingMessage(null);
    setEditText('');
  };

  const saveEdit = () => {
    if (editText.trim() && editText !== messages.find(m => m._id === editingMessage)?.content) {
      updateMessage(editingMessage, editText.trim());
    } else {
      cancelEdit();
    }
  };

  const selectChat = (chat) => {
    setSelectedChat(chat);
    // Clear unread count immediately when chat is selected
    const hadUnreadMessages = chat.unreadCount > 0;
    setChats(prev => prev.map(c => 
      c._id === chat._id ? { ...c, unreadCount: 0 } : c
    ));
    // Notify parent component to update unread count only if there were unread messages
    if (hadUnreadMessages && onChatViewed) {
      onChatViewed(chat._id);
    }
    // Only hide chat list on mobile
    if (isMobile) {
      setShowChatList(false);
    }
  };

  const goBackToList = () => {
    setShowChatList(true);
    // Don't clear selected chat to maintain state
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffInHours < 168) {
      return messageDate.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return messageDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  return (
    <div className="chat-container flex h-full bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 overflow-hidden relative w-full max-w-full" style={{ minHeight: 'calc(100vh - 80px)' }}>
      {/* Chat List - Full Width on Mobile, Sidebar on Desktop */}
      <div className={`${
        isMobile 
          ? (showChatList ? 'w-full' : 'hidden')
          : 'w-80 border-r border-gray-200 dark:border-gray-700'
      } flex flex-col bg-white dark:bg-gray-800 shadow-xl overflow-hidden h-full flex-shrink-0 relative`}>
        {/* Header - Mobile Optimized */}
        <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-bold">Messages</h2>
            <button
              onClick={() => setShowUserSearch(!showUserSearch)}
              className="p-2 hover:bg-white/20 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              <Search size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>
          
          {showUserSearch && (
            <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search people..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/30 transition-all duration-200"
                  style={{ fontSize: '16px' }}
                />
              </div>
              
              {searchQuery && (
                <div className="max-h-48 overflow-y-auto space-y-2 bg-white/10 backdrop-blur-sm rounded-xl p-2">
                  {filteredUsers.map(user => (
                    <button
                      key={user._id}
                      onClick={() => startChat(user._id)}
                      disabled={loading}
                      className="w-full flex items-center space-x-3 p-3 hover:bg-white/20 rounded-lg transition-all duration-200 text-left group"
                    >
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden ring-2 ring-white/30">
                          {user.profileImage ? (
                            <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            user.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate group-hover:text-blue-100 transition-colors">
                          {user.role === 'student' ? user.name.split(' ').slice(0, 2).join(' ') : user.name}
                        </p>
                        <p className="text-sm text-white/70 capitalize">{user.role}</p>
                      </div>
                    </button>
                  ))}
                  {filteredUsers.length === 0 && (
                    <p className="text-sm text-white/70 text-center py-4">No users found</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-800 hide-scrollbar">
          {chats.length === 0 && users.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 p-4 sm:p-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <User size={24} className="sm:w-8 sm:h-8 text-blue-500" />
              </div>
              <h3 className="font-semibold text-base sm:text-lg mb-2">No conversations yet</h3>
              <div className="text-xs sm:text-sm text-center leading-relaxed">Start a new chat to begin<br />messaging with others</div>
            </div>
          ) : (
            <>
              {/* Existing Chats */}
              {chats.map(chat => (
                <button
                  key={chat._id}
                  onClick={() => selectChat(chat)}
                  className={`w-full flex items-center space-x-2 sm:space-x-4 p-2 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 border-l-4 ${
                    selectedChat?._id === chat._id 
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 shadow-sm' 
                      : 'border-transparent'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-8 h-8 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden ring-1 sm:ring-2 ring-gray-200 dark:ring-gray-600">
                      {chat.otherParticipant?.profileImage ? (
                        <img src={chat.otherParticipant.profileImage} alt={chat.otherParticipant.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs sm:text-base">{chat.otherParticipant?.name?.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 sm:w-5 sm:h-5 bg-green-400 border border-white dark:border-gray-800 rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                      <h4 className="font-medium sm:font-semibold text-gray-900 dark:text-white truncate text-xs sm:text-base">
                        {chat.otherParticipant?.role === 'student' ? 
                          chat.otherParticipant.name.split(' ').slice(0, 2).join(' ') : 
                          chat.otherParticipant?.name
                        }
                      </h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-1">
                        {chat.lastMessage && formatTime(chat.lastMessage)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-600 dark:text-gray-300 truncate pr-1 max-w-[120px] sm:max-w-none">
                        {chat.lastMessageText || 'Start a conversation'}
                      </p>
                      {chat.unreadCount > 0 && (
                        <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold rounded-full px-1 py-0.5 min-w-[16px] text-center shadow-lg animate-pulse flex-shrink-0">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
              
              {/* Available Users */}
              {users.length > 0 && (
                <>
                  {chats.length > 0 && (
                    <div className="mx-2 sm:mx-4 my-2 sm:my-3">
                      <div className="border-t border-gray-200 dark:border-gray-700"></div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2 sm:mt-3 font-medium">Available to chat</p>
                    </div>
                  )}
                  {users.filter(user => !chats.some(chat => chat.otherParticipant?._id === user._id)).map(user => (
                    <button
                      key={user._id}
                      onClick={() => startChat(user._id)}
                      disabled={loading}
                      className="w-full flex items-center space-x-2 sm:space-x-4 p-2 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 text-left group"
                    >
                      <div className="relative flex-shrink-0">
                        <div className="w-6 h-6 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden ring-1 sm:ring-2 ring-gray-200 dark:ring-gray-600">
                          {user.profileImage ? (
                            <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs sm:text-sm">{user.name.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 sm:w-4 sm:h-4 bg-green-400 border border-white dark:border-gray-800 rounded-full"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-xs sm:text-base">
                          {user.role === 'student' ? user.name.split(' ').slice(0, 2).join(' ') : user.name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
                      </div>
                    </button>
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Chat Area - Full Width on Mobile, Flex on Desktop */}
      <div className={`${
        isMobile 
          ? (!showChatList ? 'w-full' : 'hidden')
          : 'flex-1'
      } flex flex-col bg-white dark:bg-gray-900 h-full overflow-hidden relative`}>
        {selectedChat ? (
          <>
            {/* Fixed Chat Header - Mobile Optimized */}
            <div className="flex items-center justify-between p-3 sm:p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm flex-shrink-0 z-10">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                {isMobile && (
                  <button
                    onClick={goBackToList}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all duration-200 active:scale-95 flex-shrink-0"
                  >
                    <ArrowLeft size={18} />
                  </button>
                )}
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden ring-2 ring-blue-100 dark:ring-blue-900">
                    {selectedChat.otherParticipant?.profileImage ? (
                      <img src={selectedChat.otherParticipant.profileImage} alt={selectedChat.otherParticipant.name} className="w-full h-full object-cover" />
                    ) : (
                      selectedChat.otherParticipant?.name?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg truncate">
                    {selectedChat.otherParticipant?.role === 'student' ? 
                      selectedChat.otherParticipant.name.split(' ').slice(0, 2).join(' ') : 
                      selectedChat.otherParticipant?.name
                    }
                  </h3>
                  <div className="text-xs sm:text-sm text-green-500 font-medium flex items-center gap-1">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="truncate">{selectedChat.otherParticipant?.role}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={deleteChat}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all duration-200 active:scale-95 flex-shrink-0"
                title="Delete Chat"
              >
                <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
              </button>
            </div>

            {/* Messages Area - Mobile Optimized */}
            <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3 sm:space-y-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 hide-scrollbar" 
                 style={{ maxHeight: 'calc(100vh - 200px)' }}>
              {messages.map((message, index) => {
                const currentUser = getUserData();
                const parsedMessage = parseMessage(message);
                const isOwn = parsedMessage.sender?._id === currentUser?._id;
                const showAvatar = index === 0 || messages[index - 1]?.sender?._id !== parsedMessage.sender?._id;
                const showTime = index === messages.length - 1 || 
                  (index < messages.length - 1 && 
                   new Date(messages[index + 1].createdAt) - new Date(parsedMessage.createdAt) > 300000); // 5 minutes
                
                return (
                  <div key={parsedMessage._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}>
                    {isOwn ? (
                      // Sent messages (right side)
                      <div className="max-w-xs lg:max-w-md xl:max-w-lg relative">
                        {editingMessage === parsedMessage._id ? (
                          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-3 rounded-2xl rounded-br-md shadow-lg">
                            <input
                              ref={editInputRef}
                              type="text"
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEdit();
                                if (e.key === 'Escape') cancelEdit();
                              }}
                              className="w-full bg-transparent text-white placeholder-blue-200 border-0 outline-0 text-sm font-medium"
                              placeholder="Edit message..."
                            />
                            <div className="flex items-center justify-end space-x-3 mt-3 pt-2 border-t border-white/20">
                              <button 
                                onClick={saveEdit} 
                                className="flex items-center gap-1 text-white/80 hover:text-white transition-colors text-sm font-medium"
                              >
                                <Check size={14} />
                                Save
                              </button>
                              <button 
                                onClick={cancelEdit} 
                                className="flex items-center gap-1 text-white/80 hover:text-white transition-colors text-sm font-medium"
                              >
                                <X size={14} />
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div 
                            className={`bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-3 rounded-2xl rounded-br-md cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] ${
                              selectedMessage === message._id ? 'ring-2 ring-blue-300 scale-[1.02]' : ''
                            }`}
                            onContextMenu={(e) => handleRightClick(e, parsedMessage)}
                            onTouchStart={(e) => handleTouchStart(e, parsedMessage)}
                          >
                            <div className={`text-sm font-medium leading-relaxed ${
                              parsedMessage.deleted ? 'italic text-blue-200' : ''
                            }`}>
                              {parsedMessage.isFile && parsedMessage.isValidFile ? (
                                parsedMessage.fileType === 'image' ? (
                                  <div className="space-y-2">
                                    <img 
                                      src={parsedMessage.fileUrl} 
                                      alt={parsedMessage.fileName}
                                      className="max-w-[200px] sm:max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        // Create a modal or lightbox instead of opening in new tab
                                        const modal = document.createElement('div');
                                        modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
                                        modal.innerHTML = `
                                          <div class="relative max-w-full max-h-full">
                                            <img src="${parsedMessage.fileUrl}" class="max-w-full max-h-full object-contain" />
                                            <button class="absolute top-4 right-4 text-white text-2xl hover:text-gray-300" onclick="this.parentElement.parentElement.remove()">&times;</button>
                                          </div>
                                        `;
                                        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
                                        document.body.appendChild(modal);
                                      }}
                                    />
                                    <p className="text-xs text-blue-100">{parsedMessage.fileName}</p>
                                  </div>
                                ) : (
                                  <div className="bg-white/10 rounded-lg p-3 space-y-2 max-w-[200px] sm:max-w-xs">
                                    <div className="flex items-center gap-2">
                                      <Paperclip size={16} className="text-blue-100 flex-shrink-0" />
                                      <span className="text-blue-100 font-medium truncate text-sm">{parsedMessage.fileName}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs text-blue-200">{parsedMessage.fileSize ? (parsedMessage.fileSize / 1024).toFixed(1) + ' KB' : 'Unknown size'}</span>
                                      {parsedMessage.isValidFile ? (
                                        <button 
                                          onClick={() => downloadFile(parsedMessage)}
                                          className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors flex-shrink-0"
                                        >
                                          Download
                                        </button>
                                      ) : (
                                        <button 
                                          onClick={() => downloadFile(parsedMessage)}
                                          className="text-xs bg-white/10 text-blue-300 px-2 py-1 rounded cursor-not-allowed flex-shrink-0"
                                        >
                                          Not Available
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                )
                              ) : parsedMessage.content.includes('📎') ? (
                                <div className="bg-white/10 rounded-lg p-3 space-y-2 max-w-[200px] sm:max-w-xs">
                                  <div className="flex items-center gap-2">
                                    <Paperclip size={16} className="text-blue-100 flex-shrink-0" />
                                    <span className="text-blue-100 font-medium truncate text-sm">{parsedMessage.content.replace('📎 ', '')}</span>
                                  </div>
                                  <span className="text-xs text-blue-300">File not available</span>
                                </div>
                              ) : (
                                parsedMessage.content
                              )}
                            </div>
                            {parsedMessage.edited && (
                              <p className="text-xs text-blue-200 mt-1 font-medium">✏️ edited</p>
                            )}
                            <div className="flex items-center justify-end gap-2 mt-2">
                              <p className="text-xs text-blue-100 font-medium">
                                {formatTime(parsedMessage.createdAt)}
                              </p>
                              <div className="flex items-center">
                                {parsedMessage.readBy && parsedMessage.readBy.length > 0 ? (
                                  // Double tick for read
                                  <div className="flex items-center">
                                    <Check className="h-3 w-3 text-blue-200" />
                                    <Check className="h-3 w-3 text-blue-200 -ml-1" />
                                  </div>
                                ) : (
                                  // Single tick for sent
                                  <Check className="h-3 w-3 text-blue-200" />
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                        {!editingMessage && (
                          <button
                            onClick={() => setShowMessageOptions(showMessageOptions === parsedMessage._id ? null : parsedMessage._id)}
                            className="absolute -left-10 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white dark:hover:bg-gray-700 rounded-full shadow-lg transition-all duration-200"
                          >
                            <MoreVertical size={16} />
                          </button>
                        )}
                        {showMessageOptions === parsedMessage._id && (
                          <div className="absolute -left-36 top-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-2xl py-2 z-10 min-w-[160px] animate-in slide-in-from-right-2 duration-200">
                            <button
                              onClick={() => {
                                startEdit(parsedMessage);
                                setShowMessageOptions(null);
                              }}
                              className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 w-full text-left transition-colors font-medium"
                            >
                              <Edit size={16} className="text-blue-500" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => {
                                deleteMessageForMe(parsedMessage._id);
                                setShowMessageOptions(null);
                              }}
                              className="flex items-center space-x-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left transition-colors font-medium"
                            >
                              <Trash2 size={16} />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      // Received messages (left side)
                      <div className="flex items-end space-x-3 max-w-xs lg:max-w-md xl:max-w-lg">
                        {showAvatar ? (
                          <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold overflow-hidden ring-2 ring-gray-200 dark:ring-gray-600 flex-shrink-0">
                            {parsedMessage.sender?.profileImage ? (
                              <img src={parsedMessage.sender.profileImage} alt={parsedMessage.sender.name} className="w-full h-full object-cover" />
                            ) : (
                              parsedMessage.sender?.name?.charAt(0).toUpperCase() || 'U'
                            )}
                          </div>
                        ) : (
                          <div className="w-8 flex-shrink-0"></div>
                        )}
                        <div 
                          className={`bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-2xl rounded-bl-md border border-gray-200 dark:border-gray-600 cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] ${
                            selectedMessage === parsedMessage._id ? 'ring-2 ring-blue-300 dark:ring-blue-500 scale-[1.02]' : ''
                          }`}
                          onContextMenu={(e) => handleRightClick(e, parsedMessage)}
                          onTouchStart={(e) => handleTouchStart(e, parsedMessage)}
                        >
                          <div className={`text-sm font-medium leading-relaxed ${
                            parsedMessage.deleted ? 'italic text-gray-400 dark:text-gray-500' : ''
                          }`}>
                            {parsedMessage.isFile && parsedMessage.isValidFile ? (
                              parsedMessage.fileType === 'image' ? (
                                <div className="space-y-2">
                                  <img 
                                    src={parsedMessage.fileUrl} 
                                    alt={parsedMessage.fileName}
                                    className="max-w-[200px] sm:max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      const modal = document.createElement('div');
                                      modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
                                      modal.innerHTML = `
                                        <div class="relative max-w-full max-h-full">
                                          <img src="${parsedMessage.fileUrl}" class="max-w-full max-h-full object-contain" />
                                          <button class="absolute top-4 right-4 text-white text-2xl hover:text-gray-300" onclick="this.parentElement.parentElement.remove()">&times;</button>
                                        </div>
                                      `;
                                      modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
                                      document.body.appendChild(modal);
                                    }}
                                  />
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{parsedMessage.fileName}</p>
                                </div>
                              ) : (
                                <div className="bg-gray-100 dark:bg-gray-600 rounded-lg p-3 space-y-2 max-w-[200px] sm:max-w-xs">
                                  <div className="flex items-center gap-2">
                                    <Paperclip size={16} className="text-gray-600 dark:text-gray-300 flex-shrink-0" />
                                    <span className="text-gray-800 dark:text-gray-200 font-medium truncate text-sm">{parsedMessage.fileName}</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{parsedMessage.fileSize ? (parsedMessage.fileSize / 1024).toFixed(1) + ' KB' : 'Unknown size'}</span>
                                    {parsedMessage.isValidFile ? (
                                      <button 
                                        onClick={() => downloadFile(parsedMessage)}
                                        className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded transition-colors flex-shrink-0"
                                      >
                                        Download
                                      </button>
                                    ) : (
                                      <button 
                                        onClick={() => downloadFile(parsedMessage)}
                                        className="text-xs bg-gray-400 text-white px-2 py-1 rounded cursor-not-allowed flex-shrink-0"
                                      >
                                        Not Available
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )
                            ) : parsedMessage.content.includes('📎') ? (
                              <div className="bg-gray-100 dark:bg-gray-600 rounded-lg p-3 space-y-2 max-w-[200px] sm:max-w-xs">
                                <div className="flex items-center gap-2">
                                  <Paperclip size={16} className="text-gray-600 dark:text-gray-300 flex-shrink-0" />
                                  <span className="text-gray-800 dark:text-gray-200 font-medium truncate text-sm">{parsedMessage.content.replace('📎 ', '')}</span>
                                </div>
                                <span className="text-xs text-gray-400">File not available</span>
                              </div>
                            ) : (
                              parsedMessage.content
                            )}
                          </div>
                          {parsedMessage.edited && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-medium">✏️ edited</p>
                          )}
                          <p className="text-xs mt-2 text-gray-500 dark:text-gray-400 font-medium">
                            {formatTime(parsedMessage.createdAt)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Context Menu */}
            {contextMenu.show && (
              <div 
                className="fixed z-[9999] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-2xl py-1 min-w-[150px]"
                style={{ 
                  left: `${contextMenu.x}px`, 
                  top: `${contextMenu.y}px`
                }}
              >
                  {contextMenu.message?.sender?._id === getUserData()?._id ? (
                    // Own message options
                    <div key="own-message-options">
                      <button
                        key="edit"
                        onClick={() => {
                          startEdit(contextMenu.message);
                          setContextMenu({ show: false, x: 0, y: 0, message: null });
                        }}
                        className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 w-full text-left transition-colors"
                      >
                        <Edit size={14} className="text-blue-500" />
                        <span>Edit</span>
                      </button>
                      
                      <button
                        key="delete"
                        onClick={() => {
                          deleteMessageForEveryone(contextMenu.message._id);
                          setContextMenu({ show: false, x: 0, y: 0, message: null });
                        }}
                        className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left transition-colors"
                      >
                        <Trash2 size={14} />
                        <span>Delete</span>
                      </button>
                    </div>
                  ) : (
                    // Other's message options
                    <div key="other-message-options">
                      <button
                        onClick={() => {
                          deleteMessageForEveryone(contextMenu.message._id);
                          setContextMenu({ show: false, x: 0, y: 0, message: null });
                        }}
                        className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left transition-colors"
                      >
                        <Trash2 size={14} />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
            )}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="px-4 py-2 bg-white dark:bg-gray-800">
                <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-sm font-medium">Someone is typing...</span>
                </div>
              </div>
            )}

            {/* Fixed Message Input Footer - Mobile Optimized */}
            <div className="p-2 sm:p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 z-10">
              <form onSubmit={sendMessage} className="flex items-end space-x-2 sm:space-x-3">
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 sm:p-2.5 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-all duration-200 active:scale-95"
                  >
                    <Paperclip size={18} className="sm:w-5 sm:h-5" />
                  </button>
                </div>
                <div className="flex-1 relative">
                  <input
                    ref={messageInputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    disabled={loading}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 bg-gray-100 dark:bg-gray-700 border-0 rounded-2xl font-medium text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-600 transition-all duration-200 resize-none"
                    style={{ fontSize: '16px', minHeight: '40px', maxHeight: '120px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 p-1 sm:p-1.5 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-full transition-all duration-200 active:scale-95"
                  >
                    <Smile size={16} className="sm:w-[18px] sm:h-[18px]" />
                  </button>
                  {showEmojiPicker && (
                    <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-2xl p-2 sm:p-3 z-50">
                      <div className="grid grid-cols-6 sm:grid-cols-5 gap-1 sm:gap-2 max-w-[180px] sm:max-w-[200px]">
                        {emojis.map((emoji, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => insertEmoji(emoji)}
                            className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-base sm:text-lg hover:scale-110 transform duration-150 active:scale-95"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={!newMessage.trim() || loading}
                  className={`p-2.5 sm:p-3 rounded-full transition-all duration-200 transform active:scale-95 ${
                    newMessage.trim() && !loading
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl scale-100 hover:scale-105'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed scale-95'
                  }`}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <Send size={16} className="sm:w-[18px] sm:h-[18px]" />
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
            <div className="text-center max-w-md mx-auto p-8">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                <User size={48} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your Messages</h3>
              <div className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Send private messages to students and instructors.<br />
                Start meaningful conversations and collaborate effectively.
              </div>
              <button
                onClick={() => setShowUserSearch(true)}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Start Conversation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;