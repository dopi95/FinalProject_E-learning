import React, { useState, useRef, useEffect } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Heart, MessageCircle, Share, MoreVertical, Loader, Send, User } from 'lucide-react';
import { reelAPI } from '../services/api';

const VideoReels = ({ isOpen, onClose }) => {
  const [currentVideo, setCurrentVideo] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [likedVideos, setLikedVideos] = useState(new Set());
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [commentCounts, setCommentCounts] = useState({});
  const [expandedDescriptions, setExpandedDescriptions] = useState(new Set());
  const [sessionId, setSessionId] = useState(null);
  const [viewedReels, setViewedReels] = useState(new Set());
  const videoRefs = useRef([]);
  const containerRef = useRef(null);

  // Check if user is logged in and generate session ID
  useEffect(() => {
    const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      // Generate session ID for non-logged users
      let storedSessionId = localStorage.getItem('reelSessionId');
      if (!storedSessionId) {
        storedSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('reelSessionId', storedSessionId);
      }
      setSessionId(storedSessionId);
    }
  }, []);

  // Fetch reels from API
  useEffect(() => {
    if (isOpen) {
      fetchReels();
    }
  }, [isOpen]);

  const fetchReels = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await reelAPI.getReels();
      const reelsData = response.data.reels || [];
      setReels(reelsData);
      
      // Fetch comment counts for all reels
      const counts = {};
      await Promise.all(
        reelsData.map(async (reel) => {
          try {
            const commentsResponse = await reelAPI.getComments(reel._id);
            counts[reel._id] = commentsResponse.data.comments?.length || 0;
          } catch (error) {
            counts[reel._id] = 0;
          }
        })
      );
      setCommentCounts(counts);
    } catch (error) {
      console.error('Fetch reels error:', error);
      setError('Failed to load reels. Please try again later.');
      setReels([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (reelId) => {
    if (!user) return;
    
    try {
      const response = await reelAPI.likeReel(reelId);
      
      // Update local state
      setLikedVideos(prev => {
        const newLiked = new Set(prev);
        if (response.data.isLiked) {
          newLiked.add(reelId);
        } else {
          newLiked.delete(reelId);
        }
        return newLiked;
      });

      // Update reels data
      setReels(prev => prev.map(reel => 
        reel._id === reelId 
          ? { ...reel, likes: Array(response.data.likes).fill(null) }
          : reel
      ));
    } catch (error) {
      console.error('Like reel error:', error);
    }
  };

  const fetchComments = async (reelId) => {
    try {
      setCommentsLoading(true);
      const response = await reelAPI.getComments(reelId);
      setComments(response.data.comments || []);
    } catch (error) {
      console.error('Fetch comments error:', error);
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleAddComment = async (reelId) => {
    if (!user || !newComment.trim()) return;
    
    try {
      const response = await reelAPI.addComment(reelId, newComment.trim());
      setComments(prev => [response.data.comment, ...prev]);
      setCommentCounts(prev => ({ ...prev, [reelId]: (prev[reelId] || 0) + 1 }));
      setNewComment('');
    } catch (error) {
      console.error('Add comment error:', error);
    }
  };

  const handleShowComments = (reelId) => {
    setShowComments(true);
    fetchComments(reelId);
  };

  useEffect(() => {
    if (!reels.length) return;
    
    // Pause all videos first
    videoRefs.current.forEach(video => {
      if (video) video.pause();
    });
    
    // Play only current video and increment view
    const currentVideoRef = videoRefs.current[currentVideo];
    if (currentVideoRef && isPlaying) {
      currentVideoRef.play().catch(console.error);
      // Increment view count when video starts playing (only once per reel)
      if (reels[currentVideo] && !viewedReels.has(reels[currentVideo]._id)) {
        const reelId = reels[currentVideo]._id;
        setViewedReels(prev => new Set([...prev, reelId]));
        
        const viewData = user ? {} : { sessionId };
        reelAPI.incrementView(reelId, viewData).catch(console.error);
      }
    }
  }, [currentVideo, isPlaying, reels]);

  const handleVideoClick = () => {
    setIsPlaying(!isPlaying);
  };

  const handleScroll = (e) => {
    const container = e.target;
    const videoHeight = container.clientHeight;
    const scrollTop = container.scrollTop;
    const newIndex = Math.round(scrollTop / videoHeight);
    
    if (newIndex !== currentVideo && newIndex >= 0 && newIndex < reels.length) {
      setCurrentVideo(newIndex);
      setIsPlaying(true);
    }
  };

  const scrollToVideo = (index) => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: index * window.innerHeight,
        behavior: 'smooth'
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex" style={{zIndex: 9999}}>
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Loading State */}
      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-white">
            <Loader className="h-12 w-12 animate-spin mx-auto mb-4" />
            <p className="text-lg">Loading reels...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-white max-w-md px-4">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="h-8 w-8 text-red-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Oops! Something went wrong</h3>
            <p className="text-gray-300 mb-6">{error}</p>
            <button
              onClick={fetchReels}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* No Reels State */}
      {!loading && !error && reels.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-white max-w-md px-4">
            <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Reels Available</h3>
            <p className="text-gray-300 mb-6">
              There are no educational reels to watch at the moment. Check back later for new content!
            </p>
            <button
              onClick={onClose}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Video Container */}
      {!loading && !error && reels.length > 0 && (
        <div 
          ref={containerRef}
          className="flex-1 overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
          onScroll={handleScroll}
        >
          {reels.map((reel, index) => (
            <div key={reel._id} className="relative h-screen w-full snap-start flex items-center justify-center">
              {/* Video */}
              <div className="relative w-full max-w-md h-full bg-black">
                <video
                  ref={el => videoRefs.current[index] = el}
                  className="w-full h-full object-cover"
                  loop
                  muted={isMuted}
                  playsInline
                  onClick={handleVideoClick}
                  poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600' viewBox='0 0 400 600'%3E%3Crect width='400' height='600' fill='%23000'/%3E%3Ctext x='200' y='300' text-anchor='middle' fill='white' font-size='20'%3EVideo Loading...%3C/text%3E%3C/svg%3E"
                >
                  <source src={reel.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>

                {/* Play/Pause Overlay */}
                {!isPlaying && index === currentVideo && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="bg-white/20 rounded-full p-4">
                      <Play className="h-12 w-12 text-white ml-1" />
                    </div>
                  </div>
                )}

                {/* Video Info Overlay */}
                <div className="absolute bottom-0 left-0 right-16 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                  <div className="text-white pr-2 max-w-full">
                    <h3 className="font-bold text-base sm:text-lg mb-2 break-words leading-tight hyphens-auto overflow-wrap-anywhere">
                      {reel.title}
                    </h3>
                    <div className="text-xs sm:text-sm leading-relaxed">
                      {reel.description && reel.description.length > 100 ? (
                        <div className="space-y-1">
                          <p className={`break-words whitespace-pre-wrap leading-relaxed hyphens-auto overflow-wrap-anywhere transition-all duration-300 ${
                            expandedDescriptions.has(reel._id) 
                              ? 'max-h-none' 
                              : 'max-h-12 overflow-hidden relative'
                          }`}>
                            {reel.description}
                            {!expandedDescriptions.has(reel._id) && (
                              <span className="absolute bottom-0 right-0 bg-gradient-to-l from-black/90 to-transparent pl-8">...</span>
                            )}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedDescriptions(prev => {
                                const newSet = new Set(prev);
                                if (newSet.has(reel._id)) {
                                  newSet.delete(reel._id);
                                } else {
                                  newSet.add(reel._id);
                                }
                                return newSet;
                              });
                            }}
                            className="text-gray-300 hover:text-white text-xs font-semibold transition-colors bg-black/40 px-2 py-1 rounded-full backdrop-blur-sm"
                          >
                            {expandedDescriptions.has(reel._id) ? '▲ Less' : '▼ More'}
                          </button>
                        </div>
                      ) : (
                        <p className="break-words whitespace-pre-wrap leading-relaxed hyphens-auto overflow-wrap-anywhere">
                          {reel.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Side Actions */}
              <div className="absolute right-4 bottom-20 flex flex-col gap-6">
                {/* Like */}
                <div className="flex flex-col items-center">
                  <button 
                    onClick={() => handleLike(reel._id)}
                    disabled={!user}
                    className={`p-3 rounded-full transition-all duration-300 ${
                      likedVideos.has(reel._id) 
                        ? 'bg-red-500 scale-110' 
                        : user ? 'bg-white/20 hover:bg-white/30' : 'bg-white/10 cursor-not-allowed'
                    }`}
                  >
                    <Heart className={`h-6 w-6 transition-colors ${
                      likedVideos.has(reel._id) ? 'text-white fill-current' : 'text-white'
                    }`} />
                  </button>
                  <span className="text-white text-xs mt-1">
                    {reel.likes?.length || 0}
                  </span>
                </div>

                {/* Comment */}
                <div className="flex flex-col items-center">
                  <button 
                    onClick={() => handleShowComments(reel._id)}
                    className="bg-white/20 p-3 rounded-full hover:bg-white/30 transition-colors"
                  >
                    <MessageCircle className="h-6 w-6 text-white" />
                  </button>
                  <span className="text-white text-xs mt-1">
                    {showComments && comments.length > 0 ? comments.length : (commentCounts[reel._id] || 0)}
                  </span>
                </div>

                {/* Share */}
                <div className="flex flex-col items-center">
                  <button 
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: reel.title,
                          text: reel.description,
                          url: window.location.href
                        });
                      } else {
                        // Fallback: copy to clipboard
                        navigator.clipboard.writeText(window.location.href);
                      }
                    }}
                    className="bg-white/20 p-3 rounded-full hover:bg-white/30 transition-colors"
                  >
                    <Share className="h-6 w-6 text-white" />
                  </button>
                </div>

                {/* Volume */}
                <div className="flex flex-col items-center">
                  <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className="bg-white/20 p-3 rounded-full hover:bg-white/30 transition-colors"
                  >
                    {isMuted ? <VolumeX className="h-6 w-6 text-white" /> : <Volume2 className="h-6 w-6 text-white" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .overflow-wrap-anywhere {
          overflow-wrap: anywhere;
          word-break: break-word;
        }
        .hyphens-auto {
          hyphens: auto;
        }
      `}</style>

      {/* Comments Modal */}
      {showComments && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-[10000] p-2 sm:p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-sm sm:max-w-md h-[85vh] sm:h-[70vh] rounded-t-2xl sm:rounded-2xl flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Comments</h3>
              <button 
                onClick={() => setShowComments(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {commentsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No comments yet</p>
                  <p className="text-gray-400 text-xs mt-1">Be the first to comment!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment._id} className="flex gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      {comment.user?.profileImage ? (
                        <img src={comment.user.profileImage} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {comment.user?.name || 'Anonymous'}
                        </p>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {new Date(comment.createdAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed break-words">
                        {comment.comment}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Comment Input */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex-shrink-0">
              {user ? (
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    {user.profileImage ? (
                      <img src={user.profileImage} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-full text-sm dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddComment(reels[currentVideo]?._id)}
                    />
                    <button
                      onClick={() => handleAddComment(reels[currentVideo]?._id)}
                      disabled={!newComment.trim()}
                      className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                    <MessageCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Join the conversation</p>
                    <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">Please log in to add comments</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoReels;