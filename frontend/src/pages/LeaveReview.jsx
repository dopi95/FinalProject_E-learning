import React, { useState, useEffect } from 'react';
import { Star, Send, CheckCircle, Clock, XCircle } from 'lucide-react';
import { reviewAPI } from '../services/api';
import PopupNotification from '../components/PopupNotification';

const LeaveReview = () => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [notification, setNotification] = useState({
    isVisible: false,
    type: 'success',
    title: '',
    message: ''
  });

  const showNotification = (type, title, message) => {
    setNotification({ isVisible: true, type, title, message });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  };

  useEffect(() => {
    fetchMyReview();
  }, []);

  const fetchMyReview = async () => {
    try {
      const response = await reviewAPI.getMyReview();
      if (response.data.review) {
        setExistingReview(response.data.review);
        setRating(response.data.review.rating);
        setMessage(response.data.review.message);
      }
    } catch (error) {
      console.error('Error fetching review:', error);
    }
  };

  const handleDeleteReview = async () => {
    if (!window.confirm('Are you sure you want to delete your review? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      await reviewAPI.deleteMyReview();
      setExistingReview(null);
      setRating(0);
      setMessage('');
      showNotification('success', 'Review Deleted!', 'Your review has been deleted successfully');
    } catch (error) {
      showNotification('error', 'Delete Failed', error.response?.data?.message || 'Failed to delete review');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || !message.trim()) {
      showNotification('error', 'Validation Error', 'Please provide both rating and message');
      return;
    }

    try {
      setLoading(true);
      await reviewAPI.submitReview({ rating, message });
      showNotification('success', 'Review Submitted!', 'Your review has been submitted for approval');
      fetchMyReview();
    } catch (error) {
      showNotification('error', 'Submission Failed', error.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300', text: 'Pending Review' },
      approved: { icon: CheckCircle, color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300', text: 'Approved' },
      rejected: { icon: XCircle, color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300', text: 'Rejected' }
    };
    
    const badge = badges[status];
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        <Icon className="h-4 w-4 mr-1" />
        {badge.text}
      </span>
    );
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      <PopupNotification
        type={notification.type}
        title={notification.title}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col py-4 sm:py-6 lg:py-8">
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2 sm:mb-4">Leave a Review</h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400">Share your experience with AAU E-Learning Platform</p>
        </div>

        {existingReview ? (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 p-4 sm:p-6 lg:p-8 flex-1 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Your Review</h2>
              <div className="flex items-center gap-2 sm:gap-3">
                {getStatusBadge(existingReview.status)}
                <button
                  onClick={handleDeleteReview}
                  disabled={loading}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 disabled:opacity-50 group"
                  title="Delete Review"
                >
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">Rating</label>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 ${star <= existingReview.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                  <span className="ml-2 sm:ml-3 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    {existingReview.rating} out of 5 stars
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">Message</label>
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 p-4 sm:p-6 rounded-2xl border border-gray-200 dark:border-gray-600">
                  <p className="text-sm sm:text-base lg:text-lg text-gray-900 dark:text-white leading-relaxed break-words">
                    {existingReview.message}
                  </p>
                </div>
              </div>
              
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-xl">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                  <span>Submitted on {new Date(existingReview.createdAt).toLocaleDateString()}</span>
                  {existingReview.reviewedAt && (
                    <span>Reviewed on {new Date(existingReview.reviewedAt).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 p-4 sm:p-6 lg:p-8 flex-1 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 h-full flex flex-col">
              <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-3 sm:mb-4">
                  Rate your experience
                </label>
                <div className="flex items-center justify-center sm:justify-start space-x-2 sm:space-x-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-gray-700 dark:to-gray-600 rounded-2xl">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="focus:outline-none transition-all duration-200 hover:scale-125 active:scale-110"
                    >
                      <Star
                        className={`h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 ${
                          star <= (hoverRating || rating)
                            ? 'text-yellow-400 fill-current drop-shadow-lg'
                            : 'text-gray-300 hover:text-yellow-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <div className="text-center sm:text-left mt-3">
                    <span className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm sm:text-base font-medium">
                      ⭐ {rating} out of 5 stars
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1 flex flex-col">
                <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                  Your Review Message
                </label>
                <div className="flex-1 relative">
                  <textarea
                    rows="4"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full h-full px-4 py-3 sm:px-6 sm:py-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none transition-all duration-200 text-sm sm:text-base"
                    placeholder="Share your experience with the platform, courses, instructors, or any feedback you'd like to provide..."
                    maxLength="500"
                  />
                  <div className="absolute bottom-2 right-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded-lg">
                    {message.length}/500
                  </div>
                </div>
              </div>

              <div className="flex justify-center sm:justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading || !rating || !message.trim()}
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 sm:py-4 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-semibold text-sm sm:text-base transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      <span>Submit Review</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveReview;