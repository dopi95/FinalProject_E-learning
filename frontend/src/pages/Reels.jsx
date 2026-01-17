import React, { useState, useEffect } from 'react';
import { Video, Heart, Eye, Calendar, User, ArrowLeft, MessageCircle, Send, Reply, Trash2 } from 'lucide-react';
import { reelAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { getUserData } from '../utils/userUtils';

const Reels = () => {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReel, setSelectedReel] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReels();
    const userData = getUserData();
    setUser(userData);
  }, []);

  const fetchReels = async () => {
    try {
      setLoading(true);
      const response = await reelAPI.getReels();
      setReels(response.data.reels || []);
    } catch (error) {
      console.error('Fetch reels error:', error);
      setReels([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeReel = async (reelId) => {
    try {
      const response = await reelAPI.likeReel(reelId);
      setReels(prev => prev.map(reel => 
        reel._id === reelId 
          ? { ...reel, likes: Array(response.data.likes).fill(null) }
          : reel
      ));
    } catch (error) {
      console.error('Like reel error:', error);
    }
  };

  const handleViewReel = async (reelId) => {
    try {
      await reelAPI.incrementView(reelId);
      setReels(prev => prev.map(reel => 
        reel._id === reelId 
          ? { ...reel, views: (reel.views || 0) + 1 }
          : reel
      ));
    } catch (error) {
      console.error('View reel error:', error);
    }
  };

  const fetchComments = async (reelId) => {
    try {
      const response = await reelAPI.getComments(reelId);
      setComments(response.data.comments || []);
    } catch (error) {
      console.error('Fetch comments error:', error);
      setComments([]);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;
    
    try {
      const response = await reelAPI.addComment(selectedReel._id, newComment.trim());
      setComments(prev => [response.data.comment, ...prev]);
      setNewComment('');
    } catch (error) {
      console.error('Add comment error:', error);
    }
  };

  const handleAddReply = async (parentCommentId) => {
    if (!replyText.trim() || !user) return;
    
    try {
      const response = await reelAPI.addComment(selectedReel._id, replyText.trim(), parentCommentId);
      setComments(prev => prev.map(comment => 
        comment._id === parentCommentId 
          ? { ...comment, replies: [...(comment.replies || []), response.data.comment] }
          : comment
      ));
      setReplyText('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Add reply error:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await reelAPI.deleteComment(commentId);
      setComments(prev => prev.filter(comment => comment._id !== commentId));
    } catch (error) {
      console.error('Delete comment error:', error);
    }
  };

  const handleDeleteReply = async (commentId, replyId) => {
    try {
      await reelAPI.deleteComment(replyId);
      setComments(prev => prev.map(comment => 
        comment._id === commentId 
          ? { ...comment, replies: comment.replies.filter(reply => reply._id !== replyId) }
          : comment
      ));
    } catch (error) {
      console.error('Delete reply error:', error);
    }
  };

  const handleSelectReel = (reel) => {
    setSelectedReel(reel);
    handleViewReel(reel._id);
    fetchComments(reel._id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading reels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Back
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Video className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Educational Reels
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {reels.length} video{reels.length !== 1 ? 's' : ''} available
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {reels.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <Video className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Reels Available
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Check back later for new educational content.
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              Back to Home
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {reels.map((reel) => (
              <div
                key={reel._id}
                className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Video Thumbnail */}
                <div className="aspect-video bg-gray-200 dark:bg-gray-700 relative group cursor-pointer">
                  <video
                    src={reel.videoUrl}
                    className="w-full h-full object-cover"
                    preload="metadata"
                    onClick={() => {
                      handleSelectReel(reel);
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                    <div className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Video className="h-6 w-6 text-gray-800 ml-1" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 leading-tight">
                    {reel.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {reel.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{reel.views}</span>
                      </div>
                      <button
                        onClick={() => handleLikeReel(reel._id)}
                        className="flex items-center gap-1 hover:text-red-500 transition-colors"
                      >
                        <Heart className="h-4 w-4" />
                        <span>{reel.likes?.length || 0}</span>
                      </button>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {reel.uploadedBy?.name || 'Admin'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(reel.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video Modal */}
      {selectedReel && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden max-w-6xl w-full max-h-[90vh] flex">
            {/* Left side - Video */}
            <div className="flex-1 flex flex-col">
              {/* Modal Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {selectedReel.title}
                </h3>
                <button
                  onClick={() => {
                    setSelectedReel(null);
                    setComments([]);
                    setNewComment('');
                    setReplyingTo(null);
                    setReplyText('');
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Video Player */}
              <div className="flex-1 bg-black flex items-center justify-center">
                <video
                  src={selectedReel.videoUrl}
                  className="max-w-full max-h-full"
                  controls
                  autoPlay
                  muted={false}
                />
              </div>

              {/* Video Info */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  {selectedReel.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{selectedReel.views} views</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      <span>{selectedReel.likes?.length || 0} likes</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <User className="h-4 w-4" />
                    <span>{selectedReel.uploadedBy?.name || 'Admin'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Comments */}
            <div className="w-96 border-l border-gray-200 dark:border-gray-700 flex flex-col">
              {/* Comments Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Comments ({comments.length})
                  </h4>
                </div>
              </div>

              {/* Comments List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {comments.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      No comments yet. Be the first to comment!
                    </p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment._id} className="space-y-2">
                      {/* Main Comment */}
                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm text-gray-900 dark:text-white">
                                {comment.user?.name || 'User'}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-800 dark:text-gray-200 break-words">
                              {comment.comment}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 mt-2">
                            <button
                              onClick={() => {
                                console.log('Reply clicked for comment:', comment._id);
                                setReplyingTo(comment._id);
                              }}
                              className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs hover:bg-blue-200 flex items-center gap-1"
                            >
                              <Reply className="h-3 w-3" />
                              Reply
                            </button>
                            {user && user._id === comment.user?._id && (
                              <button
                                onClick={() => {
                                  console.log('Delete clicked for comment:', comment._id);
                                  handleDeleteComment(comment._id);
                                }}
                                className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs hover:bg-red-200 flex items-center gap-1"
                              >
                                <Trash2 className="h-3 w-3" />
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="ml-11 space-y-2">
                          {comment.replies.map((reply) => (
                            <div key={reply._id} className="flex gap-3">
                              <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="h-3 w-3 text-gray-600 dark:text-gray-300" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="bg-gray-50 dark:bg-gray-600 rounded-lg p-2">
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-xs text-gray-900 dark:text-white">
                                        {reply.user?.name || 'User'}
                                      </span>
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {new Date(reply.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                    {user && user._id === reply.user?._id && (
                                      <button
                                        onClick={() => handleDeleteReply(comment._id, reply._id)}
                                        className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </button>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-800 dark:text-gray-200 break-words">
                                    {reply.comment}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reply Input */}
                      {replyingTo === comment._id && user && (
                        <div className="ml-11">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Write a reply..."
                              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleAddReply(comment._id);
                                }
                              }}
                            />
                            <button
                              onClick={() => handleAddReply(comment._id)}
                              disabled={!replyText.trim()}
                              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Send className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyText('');
                              }}
                              className="px-3 py-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment */}
              {user ? (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddComment();
                        }
                      }}
                    />
                    <button
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      Send
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Please log in to comment
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reels;