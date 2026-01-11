// Test component to verify chat history API
import React, { useState, useEffect } from 'react';
import { chatHistoryAPI } from '../services/api';

const ChatHistoryTest = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testChatHistory = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Test creating a session
      const newSession = await chatHistoryAPI.createChatSession({
        sessionId: `test_${Date.now()}`,
        title: 'Test Chat Session'
      });
      
      console.log('Created session:', newSession.data);
      
      // Test adding a message
      const testMessage = {
        id: Date.now(),
        text: 'Hello, this is a test message',
        sender: 'user',
        timestamp: new Date()
      };
      
      await chatHistoryAPI.addMessage(newSession.data.sessionId, testMessage);
      console.log('Added message to session');
      
      // Test getting all sessions
      const allSessions = await chatHistoryAPI.getChatSessions();
      setSessions(allSessions.data);
      console.log('All sessions:', allSessions.data);
      
    } catch (err) {
      setError(err.message);
      console.error('Test error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-bold mb-4">Chat History API Test</h3>
      
      <button
        onClick={testChatHistory}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Chat History API'}
      </button>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}
      
      {sessions.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Chat Sessions:</h4>
          <div className="space-y-2">
            {sessions.map((session) => (
              <div key={session.sessionId} className="p-3 bg-white rounded border">
                <div className="font-medium">{session.title}</div>
                <div className="text-sm text-gray-600">
                  Session ID: {session.sessionId}
                </div>
                <div className="text-sm text-gray-600">
                  Messages: {session.messageCount}
                </div>
                <div className="text-sm text-gray-600">
                  Last Activity: {new Date(session.lastActivity).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatHistoryTest;