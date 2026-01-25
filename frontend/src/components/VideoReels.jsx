import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Heart, MessageCircle, Share, MoreVertical, Loader, Send, User, Reply, Trash2 } from 'lucide-react';
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
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [viewedReels, setViewedReels] = useState(new Set());
  const [isScrolling, setIsScrolling] = useState(false);
  const [lastScrollTime, setLastScrollTime] = useState(0);
  const [scrollCooldown, setScrollCooldown] = useState(false);
  const videoRefs = useRef([]);
  const containerRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

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

  const handleAddReply = async (reelId, parentCommentId) => {
    if (!user || !replyText.trim()) return;
    
    try {
      const response = await reelAPI.addComment(reelId, replyText.trim(), parentCommentId);
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

  const handleShowComments = (reelId) => {
    setShowComments(true);
    fetchComments(reelId);
  };

  useEffect(() => {
    if (!reels.length) return;
    
    // Pause all videos first
    videoRefs.current.forEach((video, index) => {
      if (video && index !== currentVideo) {
        video.pause();
        video.volume = 0;
      }
    });
    
    // Handle current video
    const currentVideoRef = videoRefs.current[currentVideo];
    if (currentVideoRef) {
      currentVideoRef.currentTime = 0;
      currentVideoRef.volume = isMuted ? 0 : 1;
      
      if (isPlaying) {
        const playPromise = currentVideoRef.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.log('Video play interrupted:', error);
          });
        }
      } else {
        currentVideoRef.pause();
      }
      
      // Increment view count
      if (reels[currentVideo] && !viewedReels.has(reels[currentVideo]._id)) {
        const reelId = reels[currentVideo]._id;
        setViewedReels(prev => new Set([...prev, reelId]));
        
        const viewData = user ? {} : { sessionId };
        reelAPI.incrementView(reelId, viewData).catch(console.error);
      }
    }
  }, [currentVideo, isPlaying, isMuted, reels, user, sessionId, viewedReels]);

  // Auto-play first video when reels load
  useEffect(() => {
    if (reels.length > 0 && videoRefs.current[0] && isOpen) {
      setTimeout(() => {
        const firstVideo = videoRefs.current[0];
        if (firstVideo) {
          firstVideo.currentTime = 0;
          firstVideo.muted = isMuted;
          const playPromise = firstVideo.play();
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.log('Auto-play failed:', error);
            });
          }
        }
      }, 100);
    }
  }, [reels, isOpen, isMuted]);

  const handleVideoClick = () => {
    // Simple click handler - no preventDefault needed
  };

  const handleVideoPress = () => {
    const currentVideoRef = videoRefs.current[currentVideo];
    if (currentVideoRef && !currentVideoRef.paused) {
      currentVideoRef.pause();
    }
  };

  const handleVideoRelease = () => {
    const currentVideoRef = videoRefs.current[currentVideo];
    if (currentVideoRef && currentVideoRef.paused) {
      const playPromise = currentVideoRef.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log('Video play failed:', error);
        });
      }
    }
  };

  const handleScroll = useCallback((e) => {
    if (isScrolling) return;
    
    const container = e.target;
    const videoHeight = window.innerHeight;
    const scrollTop = container.scrollTop;
    const newIndex = Math.round(scrollTop / videoHeight);
    
    // Only allow sequential navigation (one reel at a time)
    const maxAllowedIndex = Math.min(currentVideo + 1, reels.length - 1);
    const minAllowedIndex = Math.max(currentVideo - 1, 0);
    const clampedIndex = Math.max(minAllowedIndex, Math.min(maxAllowedIndex, newIndex));
    
    if (clampedIndex !== currentVideo && clampedIndex >= 0 && clampedIndex < reels.length) {
      setCurrentVideo(clampedIndex);
      setIsPlaying(true);
    }

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Set timeout to snap to current video after scrolling stops
    scrollTimeoutRef.current = setTimeout(() => {
      scrollToVideo(currentVideo);
    }, 100);
  }, [currentVideo, reels.length, isScrolling]);

  const scrollToVideo = useCallback((index) => {
    if (containerRef.current && !isScrolling && index >= 0 && index < reels.length) {
      setIsScrolling(true);
      containerRef.current.scrollTo({
        top: index * window.innerHeight,
        behavior: 'smooth'
      });
      
      // Reset scrolling flag after animation
      setTimeout(() => {
        setIsScrolling(false);
      }, 600); // Slightly longer to ensure smooth completion
    }
  }, [isScrolling, reels.length]);

  // Handle touch/wheel events for better scroll control
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let startY = 0;
    let isTouch = false;

    const handleTouchStart = (e) => {
      startY = e.touches[0].clientY;
      isTouch = true;
    };

    const handleTouchEnd = (e) => {
      if (!isTouch || isScrolling || scrollCooldown) return;
      
      const now = Date.now();
      if (now - lastScrollTime < 300) return; // Prevent rapid scrolling
      
      const endY = e.changedTouches[0].clientY;
      const deltaY = startY - endY;
      const threshold = 80; // Increased threshold for more deliberate swipes

      if (Math.abs(deltaY) > threshold) {
        setScrollCooldown(true);
        setLastScrollTime(now);
        
        if (deltaY > 0 && currentVideo < reels.length - 1) {
          // Swipe up - next video (only one at a time)
          const nextIndex = currentVideo + 1;
          setCurrentVideo(nextIndex);
          scrollToVideo(nextIndex);
        } else if (deltaY < 0 && currentVideo > 0) {
          // Swipe down - previous video (only one at a time)
          const prevIndex = currentVideo - 1;
          setCurrentVideo(prevIndex);
          scrollToVideo(prevIndex);
        }
        
        // Reset cooldown after animation
        setTimeout(() => {
          setScrollCooldown(false);
        }, 600);
      } else {
        // If swipe is too small, snap back to current video
        scrollToVideo(currentVideo);
      }
      
      isTouch = false;
    };

    const handleWheel = (e) => {
      e.preventDefault();
      
      if (isScrolling || scrollCooldown) return;
      
      const now = Date.now();
      if (now - lastScrollTime < 200) return; // Prevent rapid wheel scrolling
      
      const deltaY = e.deltaY;
      const threshold = 50; // Increased threshold to prevent accidental scrolling

      if (Math.abs(deltaY) > threshold) {
        setScrollCooldown(true);
        setLastScrollTime(now);
        
        if (deltaY > 0 && currentVideo < reels.length - 1) {
          // Scroll down - next video (only one at a time)
          const nextIndex = currentVideo + 1;
          setCurrentVideo(nextIndex);
          scrollToVideo(nextIndex);
        } else if (deltaY < 0 && currentVideo > 0) {
          // Scroll up - previous video (only one at a time)
          const prevIndex = currentVideo - 1;
          setCurrentVideo(prevIndex);
          scrollToVideo(prevIndex);
        }
        
        // Reset cooldown after animation
        setTimeout(() => {
          setScrollCooldown(false);
        }, 400);
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('wheel', handleWheel);
    };
  }, [currentVideo, reels.length, scrollToVideo, isScrolling, scrollCooldown, lastScrollTime]);

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
          className="flex-1 overflow-y-auto snap-y snap-mandatory scrollbar-hide"
          onScroll={handleScroll}
          style={{ scrollBehavior: isScrolling ? 'smooth' : 'auto' }}
        >
          {reels.map((reel, index) => (
            <div key={reel._id} className="relative h-screen w-full snap-start snap-always flex items-center justify-center">
              {/* Video */}
              <div className="relative w-full h-full bg-black flex items-center justify-center">
                <div className="relative w-full max-w-sm sm:max-w-md h-full bg-black">
                  <video
                    ref={el => videoRefs.current[index] = el}
                    className="w-full h-full object-cover"
                    loop
                    muted={false}
                    playsInline
                    autoPlay={index === 0}
                    preload="auto"
                    onClick={handleVideoClick}
                    onMouseDown={handleVideoPress}
                    onMouseUp={handleVideoRelease}
                    onMouseLeave={handleVideoRelease}
                    onTouchStart={handleVideoPress}
                    onTouchEnd={handleVideoRelease}
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

                  {/* Video Info Overlay - Bottom Position */}
                  <div className="absolute left-2 sm:left-4 right-16 sm:right-20 bottom-2 sm:bottom-4">
                    <div className="p-2 sm:p-3">
                      <div className="text-white">
                        <h3 className="font-bold text-xs sm:text-sm md:text-base mb-1 break-words leading-tight text-shadow-lg">
                          {reel.title}
                        </h3>
                        <div className="text-xs leading-relaxed">
                          {reel.description && reel.description.length > 60 ? (
                            <div className="space-y-1">
                              <p className={`break-words whitespace-pre-wrap leading-relaxed transition-all duration-300 text-shadow ${
                                expandedDescriptions.has(reel._id) 
                                  ? 'max-h-none' 
                                  : 'max-h-6 overflow-hidden relative'
                              }`}>
                                {reel.description}
                                {!expandedDescriptions.has(reel._id) && (
                                  <span className="absolute bottom-0 right-0 bg-gradient-to-l from-black/90 to-transparent pl-3">...</span>
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
                                className="text-gray-300 hover:text-white text-xs font-semibold transition-colors px-1 py-1 rounded-full"
                              >
                                {expandedDescriptions.has(reel._id) ? '▲ Less' : '▼ More'}
                              </button>
                            </div>
                          ) : (
                            <p className="break-words whitespace-pre-wrap leading-relaxed text-shadow">
                              {reel.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Side Actions - Always Visible */}
              <div className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-4 sm:gap-6 p-2 sm:p-3">
                {/* Like */}
                <div className="flex flex-col items-center">
                  <button 
                    onClick={() => handleLike(reel._id)}
                    disabled={!user}
                    className={`p-2 sm:p-3 rounded-full transition-all duration-300 shadow-lg ${
                      likedVideos.has(reel._id) 
                        ? 'scale-110 shadow-red-500/50' 
                        : user ? 'hover:scale-105' : 'cursor-not-allowed'
                    }`}
                  >
                    <Heart className={`h-5 w-5 sm:h-6 sm:w-6 transition-colors drop-shadow-lg ${
                      likedVideos.has(reel._id) ? 'text-red-500 fill-current' : 'text-white'
                    }`} />
                  </button>
                  <span className="text-white text-xs mt-1 font-bold drop-shadow-lg">
                    {reel.likes?.length || 0}
                  </span>
                </div>

                {/* Comment */}
                <div className="flex flex-col items-center">
                  <button 
                    onClick={() => handleShowComments(reel._id)}
                    className="p-2 sm:p-3 rounded-full hover:scale-105 transition-all duration-300 shadow-lg"
                  >
                    <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white drop-shadow-lg" />
                  </button>
                  <span className="text-white text-xs mt-1 font-bold drop-shadow-lg">
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
                        navigator.clipboard.writeText(window.location.href);
                      }
                    }}
                    className="p-2 sm:p-3 rounded-full hover:scale-105 transition-all duration-300 shadow-lg"
                  >
                    <Share className="h-5 w-5 sm:h-6 sm:w-6 text-white drop-shadow-lg" />
                  </button>
                </div>

                {/* Volume */}
                <div className="flex flex-col items-center">
                  <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2 sm:p-3 rounded-full hover:scale-105 transition-all duration-300 shadow-lg"
                  >
                    {isMuted ? <VolumeX className="h-5 w-5 sm:h-6 sm:w-6 text-white drop-shadow-lg" /> : <Volume2 className="h-5 w-5 sm:h-6 sm:w-6 text-white drop-shadow-lg" />}
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
        .text-shadow {
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
        }
        .text-shadow-lg {
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.9);
        }
        .drop-shadow-lg {
          filter: drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.8));
        }
        .snap-start {
          scroll-snap-align: start;
        }
        .snap-always {
          scroll-snap-stop: always;
        }
        .snap-y {
          scroll-snap-type: y mandatory;
        }
        .snap-mandatory {
          scroll-snap-type: y mandatory;
        }
      `}</style>

      {/* Comments Modal */}
      {showComments && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-[10000] p-0 sm:p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-sm sm:max-w-md h-[90vh] sm:h-[75vh] rounded-t-3xl sm:rounded-2xl flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Comments</h3>
              </div>
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
                  <div key={comment._id} className="space-y-3">
                    {/* Main Comment */}
                    <div className="flex gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
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
                        <div className="flex items-center gap-4 mt-2">
                          <button
                            onClick={() => setReplyingTo(comment._id)}
                            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <Reply className="h-3 w-3" />
                            Reply
                          </button>
                          {user && user._id === comment.user?._id && (
                            <button
                              onClick={() => handleDeleteComment(comment._id)}
                              className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 transition-colors"
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
                      <div className="ml-8 space-y-2">
                        {comment.replies.map((reply) => (
                          <div key={reply._id} className="flex gap-2 p-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                            <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                              {reply.user?.profileImage ? (
                                <img src={reply.user.profileImage} alt="" className="w-full h-full rounded-full object-cover" />
                              ) : (
                                <User className="h-3 w-3 text-white" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-xs text-gray-900 dark:text-white">
                                    {reply.user?.name || 'User'}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(reply.createdAt).toLocaleDateString('en-US', { 
                                      month: 'short', 
                                      day: 'numeric' 
                                    })}
                                  </span>
                                </div>
                                {user && user._id === reply.user?._id && (
                                  <button
                                    onClick={() => handleDeleteComment(reply._id)}
                                    className="text-xs text-red-600 hover:text-red-800 transition-colors"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                              <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed break-words">
                                {reply.comment}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
              
              {/* Reply Input */}
              {replyingTo && user && (
                <div className="px-4 pb-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a reply..."
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddReply(reels[currentVideo]?._id, replyingTo);
                        }
                      }}
                    />
                    <button
                      onClick={() => handleAddReply(reels[currentVideo]?._id, replyingTo)}
                      disabled={!replyText.trim()}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Send className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyText('');
                      }}
                      className="px-3 py-2 text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
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