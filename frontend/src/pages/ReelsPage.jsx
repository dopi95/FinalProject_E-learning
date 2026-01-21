import React, { useState, useEffect } from 'react';
import VideoReels from '../components/VideoReels';
import { Video, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ReelsPage = () => {
  const [isReelsOpen, setIsReelsOpen] = useState(true);
  const navigate = useNavigate();

  const handleCloseReels = () => {
    setIsReelsOpen(false);
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header - only visible when reels are not open */}
      {!isReelsOpen && (
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
                    Swipe up/down to navigate
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Reels Component */}
      <VideoReels 
        isOpen={isReelsOpen} 
        onClose={handleCloseReels}
      />
    </div>
  );
};

export default ReelsPage;