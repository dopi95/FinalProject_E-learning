import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, Quote, User, Heart } from 'lucide-react';
import { reviewAPI } from '../services/api';

const Testimonials = () => {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fallbackTestimonials = [
    {
      id: 1,
      user: { name: t('testimonials.abebe'), role: 'student' },
      rating: 5,
      message: t('testimonials.student1Text')
    },
    {
      id: 2,
      user: { name: t('testimonials.meron'), role: 'instructor' },
      rating: 5,
      message: t('testimonials.instructor1Text')
    },
    {
      id: 3,
      user: { name: t('testimonials.hanan'), role: 'student' },
      rating: 5,
      message: t('testimonials.student2Text')
    }
  ];

  useEffect(() => {
    fetchApprovedReviews();
  }, []);

  const fetchApprovedReviews = async () => {
    try {
      const response = await reviewAPI.getApprovedReviews();
      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const testimonials = reviews.length > 0 ? reviews : fallbackTestimonials;
  const mobileSlides = testimonials.length;

  // Auto-slide functionality
  useEffect(() => {
    if (testimonials.length > 3) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % (testimonials.length - 2));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [testimonials.length]);

  if (loading) {
    return (
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading testimonials...</p>
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return (
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('testimonials.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              No reviews available yet. Be the first to share your experience!
            </p>
          </div>
        </div>
      </section>
    );
  }

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-800 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('testimonials.title')}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            {t('testimonials.subtitle')}
          </p>
        </div>

        {/* Desktop Slider (horizontal) */}
        <div className="hidden lg:block relative">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out gap-8"
              style={{ transform: `translateX(-${currentSlide * (100/3)}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={testimonial.id || index} className="w-1/3 flex-shrink-0">
                  <TestimonialCard testimonial={testimonial} />
                </div>
              ))}
            </div>
          </div>
          
          {/* Desktop Dots */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.length > 3 && Array.from({ length: Math.max(1, testimonials.length - 2) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentSlide === index 
                    ? 'bg-blue-600 w-8' 
                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-blue-400'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Mobile Slider (1 card) */}
        <div className="lg:hidden relative">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * (100 / mobileSlides) * mobileSlides}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={testimonial.id || index} className="w-full flex-shrink-0 px-2">
                  <TestimonialCard testimonial={testimonial} />
                </div>
              ))}
            </div>
          </div>
          
          {/* Mobile Dots */}
          <div className="flex justify-center mt-8 space-x-2 flex-wrap">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 mb-2 ${
                  currentSlide === index 
                    ? 'bg-blue-600 w-6' 
                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-blue-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Testimonial Card Component
const TestimonialCard = ({ testimonial }) => {
  const { t } = useTranslation();
  
  const getRoleDisplay = (role) => {
    return role === 'instructor' ? t('testimonials.instructorRole') : t('testimonials.studentRole');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="group bg-white dark:bg-gray-900 rounded-3xl p-8 transition-all duration-500 transform hover:-translate-y-3 border border-gray-100 dark:border-gray-700 h-full">
      <div className="flex items-center mb-6">
        <Quote className="h-8 w-8 text-blue-600 mr-3 group-hover:scale-110 transition-transform" />
        <div className="flex">
          {[...Array(testimonial.rating)].map((_, i) => (
            <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
          ))}
        </div>
      </div>
      <p className="text-gray-600 dark:text-gray-300 mb-8 italic leading-relaxed text-lg break-words word-wrap">
        "{testimonial.message || testimonial.text}"
      </p>
      <div className="flex items-center mt-auto">
        <div className="w-14 h-14 rounded-full mr-4 bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform overflow-hidden">
          {testimonial.user?.profileImage ? (
            <img src={testimonial.user.profileImage} alt={testimonial.user.name || testimonial.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-white font-bold text-lg">
              {getInitials(testimonial.user?.name || testimonial.name)}
            </span>
          )}
        </div>
        <div>
          <h4 className="font-bold text-gray-900 dark:text-white text-lg">
            {testimonial.user?.name || testimonial.name}
          </h4>
          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
            {getRoleDisplay(testimonial.user?.role || testimonial.role)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;