import React, { useState, useEffect } from 'react';
import { Send, Mail, Users, X, CheckCircle, AlertCircle } from 'lucide-react';
import { subscriptionAPI } from '../services/api';

const NewsletterForm = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    subject: '',
    content: ''
  });
  const [subscribers, setSubscribers] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchSubscribers();
    }
  }, [isOpen]);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const response = await subscriptionAPI.getAllSubscriptions();
      setSubscribers(response.data.subscriptions);
    } catch (error) {
      console.error('Error fetching subscribers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedEmails.length === subscribers.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(subscribers.map(s => s.email));
    }
  };

  const handleEmailToggle = (email) => {
    setSelectedEmails(prev => 
      prev.includes(email) 
        ? prev.filter(e => e !== email)
        : [...prev, email]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.content || selectedEmails.length === 0) {
      alert('Please fill all fields and select at least one subscriber');
      return;
    }

    try {
      setSending(true);
      const response = await subscriptionAPI.sendNewsletter({
        subject: formData.subject,
        content: formData.content,
        selectedEmails
      });
      
      setSuccessMessage(response.data.message);
      setShowSuccess(true);
      setFormData({ subject: '', content: '' });
      setSelectedEmails([]);
      
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 3000);
    } catch (error) {
      setSuccessMessage('Error sending newsletter: ' + (error.response?.data?.message || error.message));
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Newsletter
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {showSuccess && (
          <div className="fixed top-4 right-4 z-50">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 shadow-lg flex items-center gap-3 min-w-80">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <p className="text-green-800 dark:text-green-200 text-sm font-medium">
                {successMessage}
              </p>
            </div>
          </div>
        )}

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                placeholder="Newsletter subject..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Content
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                rows={8}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                placeholder="Newsletter content (HTML supported)..."
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select Recipients ({selectedEmails.length}/{subscribers.length})
                </label>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {selectedEmails.length === subscribers.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              {loading ? (
                <div className="text-center py-4">Loading subscribers...</div>
              ) : (
                <div className="max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-4 space-y-2">
                  {subscribers.map((subscriber) => (
                    <label key={subscriber._id} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedEmails.includes(subscriber.email)}
                        onChange={() => handleEmailToggle(subscriber.email)}
                        className="rounded"
                      />
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{subscriber.email}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={sending}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sending || selectedEmails.length === 0}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
              >
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Newsletter
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewsletterForm;