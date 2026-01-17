import React, { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../services/api';
import { Send, Search, User, ArrowLeft, MoreVertical, Edit, Trash2, X, Check } from 'lucide-react';
import { getUserData } from '../utils/userUtils';

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
      if (window.innerWidth >= 768) {
        setShowChatList(true);
      }
    };
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
    setSelectedMessage(message._id);
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      message
    });
  };

  const handleTouchStart = (e, message) => {
    const touchTimer = setTimeout(() => {
      setSelectedMessage(message._id);
      setContextMenu({
        show: true,
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        message
      });
    }, 500);
    
    const handleTouchEnd = () => {
      clearTimeout(touchTimer);
      document.removeEventListener('touchend', handleTouchEnd);
    };
    
    document.addEventListener('touchend', handleTouchEnd);
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
    if (isMobile) {
      setShowChatList(false);
    }
  };

  const goBackToList = () => {
    setShowChatList(true);
    setSelectedChat(null);
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
    <div className="flex h-screen bg-white">
      {/* Chat List Sidebar */}
      <div className={`${
        isMobile 
          ? (showChatList ? 'w-full' : 'hidden') 
          : 'w-80 border-r border-gray-200'
      } flex flex-col bg-white`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Chats</h2>
            <button
              onClick={() => setShowUserSearch(!showUserSearch)}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            >
              <Search size={20} />
            </button>
          </div>
          
          {showUserSearch && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search people..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
              
              {searchQuery && (
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {filteredUsers.map(user => (
                    <button
                      key={user._id}
                      onClick={() => startChat(user._id)}
                      disabled={loading}
                      className="w-full flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium overflow-hidden">
                        {user.profileImage ? (
                          <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          user.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.role === 'student' ? user.name.split(' ').slice(0, 2).join(' ') : user.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                      </div>
                    </button>
                  ))}
                  {filteredUsers.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-2">No users found</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 && users.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <User size={24} />
              </div>
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs text-gray-400 mt-1">Start a new chat to begin messaging</p>
            </div>
          ) : (
            <>
              {/* Existing Chats */}
              {chats.map(chat => (
                <button
                  key={chat._id}
                  onClick={() => selectChat(chat)}
                  className={`w-full flex items-center space-x-3 p-4 hover:bg-gray-50 transition-colors ${
                    selectedChat?._id === chat._id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                  }`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium overflow-hidden">
                      {chat.otherParticipant?.profileImage ? (
                        <img src={chat.otherParticipant.profileImage} alt={chat.otherParticipant.name} className="w-full h-full object-cover" />
                      ) : (
                        chat.otherParticipant?.name?.charAt(0).toUpperCase()
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {chat.otherParticipant?.role === 'student' ? 
                          chat.otherParticipant.name.split(' ').slice(0, 2).join(' ') : 
                          chat.otherParticipant?.name
                        }
                      </p>
                      <span className="text-xs text-gray-500">
                        {chat.lastMessage && formatTime(chat.lastMessage)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500 truncate">
                        {chat.lastMessageText || 'Start a conversation'}
                      </p>
                      {chat.unreadCount > 0 && (
                        <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
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
                  {chats.length > 0 && <div className="border-t border-gray-200 my-2"></div>}
                  {users.filter(user => !chats.some(chat => chat.otherParticipant?._id === user._id)).map(user => (
                    <button
                      key={user._id}
                      onClick={() => startChat(user._id)}
                      disabled={loading}
                      className="w-full flex items-center space-x-3 p-4 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium overflow-hidden">
                        {user.profileImage ? (
                          <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          user.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.role === 'student' ? user.name.split(' ').slice(0, 2).join(' ') : user.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                      </div>
                    </button>
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`${
        isMobile 
          ? (showChatList ? 'hidden' : 'w-full') 
          : 'flex-1'
      } flex flex-col`}>
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center space-x-3">
                {isMobile && (
                  <button
                    onClick={goBackToList}
                    className="p-1 text-gray-600 hover:text-gray-900"
                  >
                    <ArrowLeft size={20} />
                  </button>
                )}
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium overflow-hidden">
                  {selectedChat.otherParticipant?.profileImage ? (
                    <img src={selectedChat.otherParticipant.profileImage} alt={selectedChat.otherParticipant.name} className="w-full h-full object-cover" />
                  ) : (
                    selectedChat.otherParticipant?.name?.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {selectedChat.otherParticipant?.role === 'student' ? 
                      selectedChat.otherParticipant.name.split(' ').slice(0, 2).join(' ') : 
                      selectedChat.otherParticipant?.name
                    }
                  </h3>
                  <p className="text-sm text-gray-500 capitalize">{selectedChat.otherParticipant?.role}</p>
                </div>
              </div>
              <button
                onClick={deleteChat}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="Delete Chat"
              >
                <Trash2 size={18} />
              </button>

            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message, index) => {
                const currentUser = getUserData();
                const isOwn = message.sender._id === currentUser?._id;
                const showAvatar = index === 0 || messages[index - 1].sender._id !== message.sender._id;
                
                return (
                  <div key={message._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    {isOwn ? (
                      // Sent messages (right side)
                      <div className="max-w-xs lg:max-w-md relative group">
                        {editingMessage === message._id ? (
                          <div className="bg-blue-500 text-white px-4 py-2 rounded-2xl rounded-br-md">
                            <input
                              ref={editInputRef}
                              type="text"
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEdit();
                                if (e.key === 'Escape') cancelEdit();
                              }}
                              className="w-full bg-transparent text-white placeholder-blue-200 border-0 outline-0 text-sm"
                            />
                            <div className="flex items-center justify-end space-x-2 mt-2">
                              <button onClick={saveEdit} className="text-blue-200 hover:text-white">
                                <Check size={14} />
                              </button>
                              <button onClick={cancelEdit} className="text-blue-200 hover:text-white">
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div 
                            className={`bg-blue-500 text-white px-4 py-2 rounded-2xl rounded-br-md cursor-pointer transition-all ${
                              selectedMessage === message._id ? 'ring-2 ring-blue-300 bg-blue-600' : ''
                            }`}
                            onContextMenu={(e) => handleRightClick(e, message)}
                            onTouchStart={(e) => handleTouchStart(e, message)}
                          >
                            <p className={`text-sm ${message.deleted ? 'italic text-blue-200' : ''}`}>{message.content}</p>
                            {message.edited && <p className="text-xs text-blue-200 mt-1">edited</p>}
                            <div className="flex items-center justify-end gap-1 mt-1">
                              <p className="text-xs text-blue-100">
                                {formatTime(message.createdAt)}
                              </p>
                              <div className="flex">
                                {message.readBy && message.readBy.length > 0 ? (
                                  // Double tick for read
                                  <>
                                    <Check className="h-3 w-3 text-blue-200" />
                                    <Check className="h-3 w-3 text-blue-200 -ml-1" />
                                  </>
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
                            onClick={() => setShowMessageOptions(showMessageOptions === message._id ? null : message._id)}
                            className="absolute -left-8 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 transition-opacity"
                          >
                            <MoreVertical size={16} />
                          </button>
                        )}
                        {showMessageOptions === message._id && (
                          <div className="absolute -left-20 top-0 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10">
                            <button
                              onClick={() => startEdit(message)}
                              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              <Edit size={14} />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => deleteMessageForMe(message._id)}
                              className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                            >
                              <Trash2 size={14} />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      // Received messages (left side)
                      <div className="flex items-end space-x-2 max-w-xs lg:max-w-md">
                        {showAvatar && (
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium overflow-hidden">
                            {message.sender.profileImage ? (
                              <img src={message.sender.profileImage} alt={message.sender.name} className="w-full h-full object-cover" />
                            ) : (
                              message.sender.name.charAt(0).toUpperCase()
                            )}
                          </div>
                        )}
                        {!showAvatar && <div className="w-6"></div>}
                        <div 
                          className={`bg-white text-gray-900 px-4 py-2 rounded-2xl rounded-bl-md border border-gray-200 cursor-pointer transition-all ${
                            selectedMessage === message._id ? 'ring-2 ring-blue-300 bg-blue-50' : ''
                          }`}
                          onContextMenu={(e) => handleRightClick(e, message)}
                          onTouchStart={(e) => handleTouchStart(e, message)}
                        >
                          <p className={`text-sm ${message.deleted ? 'italic text-gray-400' : ''}`}>{message.content}</p>
                          {message.edited && <p className="text-xs text-gray-400 mt-1">edited</p>}
                          <p className="text-xs mt-1 text-gray-500">
                            {formatTime(message.createdAt)}
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
                className="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50 min-w-[180px]"
                style={{ left: contextMenu.x, top: contextMenu.y }}
              >
                {contextMenu.message?.sender._id === getUserData()?._id ? (
                  // Own message options (like Telegram)
                  <>
                    <button
                      onClick={() => startEdit(contextMenu.message)}
                      className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 w-full text-left transition-colors"
                    >
                      <Edit size={18} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => deleteMessageForEveryone(contextMenu.message._id)}
                      className="flex items-center space-x-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors"
                    >
                      <Trash2 size={18} />
                      <span>Delete message</span>
                    </button>
                  </>
                ) : (
                  // Other's message options
                  <button
                    onClick={() => deleteMessageForEveryone(contextMenu.message._id)}
                    className="flex items-center space-x-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors"
                  >
                    <Trash2 size={18} />
                    <span>Delete message</span>
                  </button>
                )}
              </div>
            )}

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <form onSubmit={sendMessage} className="flex items-center space-x-3">
                <div className="flex-1 relative">
                  <input
                    ref={messageInputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Message..."
                    disabled={loading}
                    className="w-full px-4 py-2 bg-gray-100 border-0 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!newMessage.trim() || loading}
                  className={`p-2 rounded-full transition-colors ${
                    newMessage.trim() && !loading
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <User size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Your Messages</h3>
              <p className="text-gray-500 mb-6">Send private messages</p>
              <button
                onClick={() => setShowUserSearch(true)}
                className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
              >
                Send Message
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;