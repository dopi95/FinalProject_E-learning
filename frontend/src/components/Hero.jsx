import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';

const Hero = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  const heroImages = [
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&h=1080&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&h=1080&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=1920&h=1080&fit=crop&crop=center'
  ];

  const words = ['Learn', 'Without', 'Limits', 'at', 'AAU'];

  useEffect(() => {
    const resetTypewriter = () => {
      setDisplayText('');
      setCurrentWordIndex(0);
    };

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    const typewriterReset = setInterval(() => {
      setTimeout(resetTypewriter, 2000);
    }, 7000);

    return () => {
      clearInterval(interval);
      clearInterval(typewriterReset);
    };
  }, [heroImages.length]);

  useEffect(() => {
    if (currentWordIndex < words.length) {
      const currentWord = words[currentWordIndex];
      let charIndex = 0;
      
      const typeInterval = setInterval(() => {
        if (charIndex <= currentWord.length) {
          setDisplayText(prev => {
            const wordsCompleted = words.slice(0, currentWordIndex).join(' ');
            const currentTyping = currentWord.slice(0, charIndex);
            return wordsCompleted + (wordsCompleted ? ' ' : '') + currentTyping;
          });
          charIndex++;
        } else {
          clearInterval(typeInterval);
          setTimeout(() => {
            setCurrentWordIndex(prev => prev + 1);
          }, 300);
        }
      }, 150);
      
      return () => clearInterval(typeInterval);
    }
  }, [currentWordIndex]);

  const handleGetStarted = () => {
    navigate('/register');
  };

  const handleBrowseCourses = () => {
    navigate('/courses');
  };

  return (
    <section className="relative h-[100dvh] md:h-[calc(100vh-80px)] flex flex-col overflow-hidden">
      {/* Background Image Slider */}
      <div className="absolute inset-0">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={image}
              alt={`Hero ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60"></div>
          </div>
        ))}
      </div>

      {/* Content Container - Full height with proper spacing */}
      <div className="relative z-10 h-full flex flex-col px-4 sm:px-6 lg:px-8 text-center max-w-7xl mx-auto w-full py-8 sm:py-12">
        
        {/* Top spacer - hidden on mobile */}
        <div className="hidden md:block"></div>
        
        {/* Main content */}
        <div className="flex-1 flex flex-col justify-start md:justify-center pt-16 md:pt-0">
          <div className="mb-2 sm:mb-4">
            <span className="inline-flex items-center px-3 py-1.5 sm:px-6 sm:py-3 rounded-full text-xs sm:text-sm font-medium bg-white/10 backdrop-blur-md text-white border border-white/20 shadow-lg">
              {t('hero.welcomeBadge')}
            </span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-extrabold mb-2 sm:mb-4 leading-tight min-h-[50px] sm:min-h-[80px] md:min-h-[120px] flex items-center justify-center">
            <span className="text-white drop-shadow-2xl text-center">
              {displayText}
            </span>
          </h1>
          
          <p className="text-sm sm:text-lg md:text-xl text-white/95 mb-4 sm:mb-6 max-w-3xl mx-auto leading-relaxed drop-shadow-lg font-medium">
            {t('hero.subtitle')}
          </p>
          
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center items-center max-w-md sm:max-w-none mx-auto">
            <button 
              onClick={handleGetStarted}
              className="w-full sm:w-auto group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 sm:px-8 sm:py-4 rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center space-x-2 shadow-2xl hover:shadow-blue-500/25 transform hover:-translate-y-1 font-semibold text-base border border-white/20 min-h-[56px]"
            >
              <span>{t('hero.getStarted')}</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button 
              onClick={handleBrowseCourses}
              className="w-full sm:w-auto group border-2 border-white/80 text-white px-8 py-4 sm:px-8 sm:py-4 rounded-2xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300 flex items-center justify-center space-x-2 font-semibold text-base shadow-xl min-h-[56px]"
            >
              <Play className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span>{t('hero.browseCourses')}</span>
            </button>
          </div>
        </div>
        
        {/* Slide Indicators - Fixed at bottom */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex justify-center">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 mx-1 sm:mx-1.5 ${
                index === currentSlide
                  ? 'bg-white scale-125'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Animated Background Elements - Hidden on mobile */}
      <div className="hidden md:block absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-float backdrop-blur-sm"></div>
      <div className="hidden md:block absolute top-40 right-20 w-16 h-16 bg-white/10 rounded-full animate-float animation-delay-2000 backdrop-blur-sm"></div>
      <div className="hidden md:block absolute bottom-40 left-20 w-24 h-24 bg-white/10 rounded-full animate-float animation-delay-4000 backdrop-blur-sm"></div>
    </section>
  );
};

export default Hero;