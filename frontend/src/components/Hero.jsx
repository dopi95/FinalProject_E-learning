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
    <section className="relative h-screen md:h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden">
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



      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-8">
          <span className="inline-flex items-center px-6 py-3 rounded-full text-sm font-medium bg-white/10 backdrop-blur-md text-white border border-white/20 shadow-lg">
            {t('hero.welcomeBadge')}
          </span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 md:mb-8 leading-tight min-h-[120px] sm:min-h-[150px] md:min-h-[200px] flex items-center justify-center">
          <span className="text-white drop-shadow-2xl text-center">
            {displayText}
          </span>
        </h1>
        
        <p className="text-lg sm:text-xl md:text-2xl text-white/95 mb-8 md:mb-12 max-w-4xl mx-auto leading-relaxed drop-shadow-lg font-medium px-4">
          {t('hero.subtitle')}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center px-4">
          <button 
            onClick={handleGetStarted}
            className="w-full sm:w-auto group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center space-x-3 shadow-2xl hover:shadow-blue-500/25 transform hover:-translate-y-1 font-semibold text-base md:text-lg border border-white/20"
          >
            <span>{t('hero.getStarted')}</span>
            <ArrowRight className="h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button 
            onClick={handleBrowseCourses}
            className="w-full sm:w-auto group border-2 border-white/80 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300 flex items-center justify-center space-x-3 font-semibold text-base md:text-lg shadow-xl"
          >
            <Play className="h-4 w-4 md:h-5 md:w-5 group-hover:scale-110 transition-transform" />
            <span>{t('hero.browseCourses')}</span>
          </button>
        </div>
        
        {/* Slide Indicators */}
        <div className="flex justify-center mt-8 space-x-4">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'bg-white scale-125'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-float backdrop-blur-sm"></div>
      <div className="absolute top-40 right-20 w-16 h-16 bg-white/10 rounded-full animate-float animation-delay-2000 backdrop-blur-sm"></div>
      <div className="absolute bottom-40 left-20 w-24 h-24 bg-white/10 rounded-full animate-float animation-delay-4000 backdrop-blur-sm"></div>
    </section>
  );
};

export default Hero;