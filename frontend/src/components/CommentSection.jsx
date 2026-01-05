import React, { useState, useEffect } from 'react';
import { MessageCircle, Heart, Reply, Trash2, Send, User } from 'lucide-react';
import { commentAPI } from '../services/api';
import { getUserData } from '../utils/userUtils';

const CommentSection = ({ courseId, isVisible, onClose, onCommentAdded }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = getUserData();
    setUser(userData);
    if (isVisible && courseId) {
      fetchComments();
    }
  }, [isVisible, courseId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await commentAPI.getCourseComments(courseId);
      setComments(response.data.comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    try {
      const response = await commentAPI.addComment({
        content: newComment,
        courseId
      });
      setComments([response.data.comment, ...comments]);
      setNewComment('');
      
      // Notify parent to update comment count
      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleAddReply = async (e, parentId) => {
    e.preventDefault();
    if (!replyText.trim() || !user) return;

    try {
      const response = await commentAPI.addComment({
        content: replyText,
        courseId,
        parentCommentId: parentId
      });
      
      setComments(comments.map(comment => 
        comment._id === parentId 
          ? { ...comment, replies: [...(comment.replies || []), response.data.comment] }
          : comment
      ));
      setReplyText('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  const handleLikeComment = async (commentId, isReply = false, parentId = null) => {
    if (!user) return;

    try {
      const response = await commentAPI.likeComment(commentId);
      
      if (isReply) {
        setComments(comments.map(comment => 
          comment._id === parentId 
            ? {
                ...comment,
                replies: comment.replies.map(reply =>
                  reply._id === commentId
                    ? { ...reply, likes: response.data.isLiked 
                        ? [...reply.likes, user.id] 
                        : reply.likes.filter(id => id !== user.id) }
                    : reply
                )
              }
            : comment
        ));
      } else {
        setComments(comments.map(comment => 
          comment._id === commentId 
            ? { ...comment, likes: response.data.isLiked 
                ? [...comment.likes, user.id] 
                : comment.likes.filter(id => id !== user.id) }
            : comment
        ));
      }
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const handleDeleteComment = async (commentId, isReply = false, parentId = null) => {
    try {
      await commentAPI.deleteComment(commentId);
      
      if (isReply) {
        setComments(comments.map(comment => 
          comment._id === parentId 
            ? { ...comment, replies: comment.replies.filter(reply => reply._id !== commentId) }
            : comment
        ));
      } else {
        setComments(comments.filter(comment => comment._id !== commentId));
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <MessageCircle className="h-6 w-6 text-blue-600" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Comments</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col h-[60vh]">
          {/* Add Comment Form */}
          {user && (
            <form onSubmit={handleAddComment} className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                  {user.profileImage ? (
                    <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-blue-500 flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white min-h-[80px] max-h-[200px]"
                    rows="3"
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      type="submit"
                      disabled={!newComment.trim()}
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="h-4 w-4" />
                      Comment
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-6 min-w-0">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No comments yet. Be the first to comment!
              </div>
            ) : (
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment._id} className="space-y-4">
                    {/* Main Comment */}
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                        {comment.author?.profileImage ? (
                          <img src={comment.author.profileImage} alt={comment.author.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-500 flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900 dark:text-white text-sm">
                              {comment.author?.name}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed break-words whitespace-pre-wrap overflow-wrap-anywhere word-break">{comment.content}</p>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <button
                            onClick={() => handleLikeComment(comment._id)}
                            className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500"
                          >
                            <Heart 
                              className={`h-4 w-4 ${comment.likes?.includes(user?.id) ? 'text-red-500 fill-current' : ''}`} 
                            />
                            {comment.likes?.length || 0}
                          </button>
                          {user && (
                            <button
                              onClick={() => setReplyingTo(comment._id)}
                              className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-500"
                            >
                              <Reply className="h-4 w-4" />
                              Reply
                            </button>
                          )}
                          {user?.id === comment.author?._id && (
                            <button
                              onClick={() => handleDeleteComment(comment._id)}
                              className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          )}
                        </div>

                        {/* Reply Form */}
                        {replyingTo === comment._id && (
                          <form onSubmit={(e) => handleAddReply(e, comment._id)} className="mt-3">
                            <div className="flex gap-2">
                              <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Write a reply..."
                                className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm min-h-[60px] max-h-[120px]"
                                rows="2"
                              />
                              <div className="flex flex-col gap-1">
                                <button
                                  type="submit"
                                  disabled={!replyText.trim()}
                                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                                >
                                  Reply
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setReplyingTo(null);
                                    setReplyText('');
                                  }}
                                  className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </form>
                        )}

                        {/* Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="ml-6 mt-4 space-y-3">
                            {comment.replies.map((reply) => (
                              <div key={reply._id} className="flex gap-3">
                                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                                  {reply.author?.profileImage ? (
                                    <img src={reply.author.profileImage} alt={reply.author.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full bg-gray-500 flex items-center justify-center">
                                      <User className="h-4 w-4 text-white" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0 overflow-hidden">
                                  <div className="bg-gray-100 dark:bg-gray-600 rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-semibold text-gray-900 dark:text-white text-sm">
                                        {reply.author?.name}
                                      </span>
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {new Date(reply.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed break-words whitespace-pre-wrap overflow-wrap-anywhere word-break">{reply.content}</p>
                                  </div>
                                  <div className="flex items-center gap-4 mt-2">
                                    <button
                                      onClick={() => handleLikeComment(reply._id, true, comment._id)}
                                      className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500"
                                    >
                                      <Heart 
                                        className={`h-4 w-4 ${reply.likes?.includes(user?.id) ? 'text-red-500 fill-current' : ''}`} 
                                      />
                                      {reply.likes?.length || 0}
                                    </button>
                                    {user?.id === reply.author?._id && (
                                      <button
                                        onClick={() => handleDeleteComment(reply._id, true, comment._id)}
                                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                        Delete
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentSection;