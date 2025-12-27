import React from 'react';
import { useTranslation } from 'react-i18next';
import { Star, Quote } from 'lucide-react';

const Testimonials = () => {
  const { t } = useTranslation();

  const testimonials = [
    {
      id: 1,
      name: t('testimonials.abebe'),
      role: t('testimonials.csStudent'),
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      rating: 5,
      text: t('testimonials.student1Text')
    },
    {
      id: 2,
      name: t('testimonials.meron'),
      role: t('testimonials.seInstructor'),
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
      rating: 5,
      text: t('testimonials.instructor1Text')
    },
    {
      id: 3,
      name: t('testimonials.hanan'),
      role: t('testimonials.baStudent'),
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      rating: 5,
      text: t('testimonials.student2Text')
    }
  ];

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('testimonials.title')}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            {t('testimonials.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map(testimonial => (
            <div key={testimonial.id} className="group bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center mb-6">
                <Quote className="h-8 w-8 text-blue-600 mr-3 group-hover:scale-110 transition-transform" />
                <div className="flex">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-8 italic leading-relaxed text-lg">
                "{testimonial.text}"
              </p>
              <div className="flex items-center">
                <div className="relative">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full mr-4 border-3 border-blue-100 dark:border-blue-900 group-hover:border-blue-300 dark:group-hover:border-blue-700 transition-colors"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white dark:border-gray-900"></div>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-lg">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;