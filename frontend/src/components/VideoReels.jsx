import React, { useState, useRef, useEffect } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Heart, MessageCircle, Share, MoreVertical } from 'lucide-react';

const VideoReels = ({ isOpen, onClose }) => {
  const [currentVideo, setCurrentVideo] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [likedVideos, setLikedVideos] = useState(new Set());
  const videoRefs = useRef([]);
  const containerRef = useRef(null);

  // Sample video data - replace with real data later
  const videos = [
    {
      id: 1,
      title: "Introduction to React Hooks",
      instructor: "John Doe",
      course: "React Fundamentals",
      videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
      likes: 245,
      comments: 32,
      description: "Learn the basics of React Hooks in this quick tutorial"
    },
    {
      id: 2,
      title: "JavaScript ES6 Features",
      instructor: "Jane Smith",
      course: "Modern JavaScript",
      videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4",
      likes: 189,
      comments: 28,
      description: "Explore the latest ES6 features that every developer should know"
    },
    {
      id: 3,
      title: "CSS Grid Layout",
      instructor: "Mike Johnson",
      course: "Advanced CSS",
      videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4",
      likes: 312,
      comments: 45,
      description: "Master CSS Grid for responsive web layouts"
    }
  ];

  useEffect(() => {
    // Pause all videos first
    videoRefs.current.forEach(video => {
      if (video) video.pause();
    });
    
    // Play only current video
    const currentVideoRef = videoRefs.current[currentVideo];
    if (currentVideoRef && isPlaying) {
      currentVideoRef.play();
    }
  }, [currentVideo, isPlaying]);

  const handleVideoClick = () => {
    setIsPlaying(!isPlaying);
  };

  const handleScroll = (e) => {
    const container = e.target;
    const videoHeight = container.clientHeight;
    const scrollTop = container.scrollTop;
    const newIndex = Math.round(scrollTop / videoHeight);
    
    if (newIndex !== currentVideo && newIndex >= 0 && newIndex < videos.length) {
      setCurrentVideo(newIndex);
      setIsPlaying(true);
    }
  };

  const handleLike = (videoId) => {
    setLikedVideos(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(videoId)) {
        newLiked.delete(videoId);
      } else {
        newLiked.add(videoId);
      }
      return newLiked;
    });
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
    <div className="fixed inset-0 bg-black z-50 flex">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Video Container */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        onScroll={handleScroll}
      >
        {videos.map((video, index) => (
          <div key={video.id} className="relative h-screen w-full snap-start flex items-center justify-center">
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
                <source src={video.videoUrl} type="video/mp4" />
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
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <div className="text-white">
                  <h3 className="font-semibold text-lg mb-1">{video.title}</h3>
                  <p className="text-sm text-gray-300 mb-1">@{video.instructor}</p>
                  <p className="text-sm text-gray-300 mb-2">{video.course}</p>
                  <p className="text-sm">{video.description}</p>
                </div>
              </div>
            </div>

            {/* Side Actions */}
            <div className="absolute right-4 bottom-20 flex flex-col gap-6">
              {/* Like */}
              <div className="flex flex-col items-center">
                <button 
                  onClick={() => handleLike(video.id)}
                  className={`p-3 rounded-full transition-all duration-300 ${
                    likedVideos.has(video.id) 
                      ? 'bg-red-500 scale-110' 
                      : 'bg-white/20 hover:bg-white/30'
                  }`}
                >
                  <Heart className={`h-6 w-6 transition-colors ${
                    likedVideos.has(video.id) ? 'text-white fill-current' : 'text-white'
                  }`} />
                </button>
                <span className="text-white text-xs mt-1">
                  {video.likes + (likedVideos.has(video.id) ? 1 : 0)}
                </span>
              </div>

              {/* Comment */}
              <div className="flex flex-col items-center">
                <button className="bg-white/20 p-3 rounded-full hover:bg-white/30 transition-colors">
                  <MessageCircle className="h-6 w-6 text-white" />
                </button>
                <span className="text-white text-xs mt-1">{video.comments}</span>
              </div>

              {/* Share */}
              <div className="flex flex-col items-center">
                <button className="bg-white/20 p-3 rounded-full hover:bg-white/30 transition-colors">
                  <Share className="h-6 w-6 text-white" />
                </button>
              </div>

              {/* More */}
              <div className="flex flex-col items-center">
                <button className="bg-white/20 p-3 rounded-full hover:bg-white/30 transition-colors">
                  <MoreVertical className="h-6 w-6 text-white" />
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

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default VideoReels;