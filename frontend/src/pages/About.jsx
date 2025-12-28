import React from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Target, Eye, Users, Award, BookOpen, Calendar, MapPin } from 'lucide-react';
import img from "../../public/assets/images/hero1.jpeg"

const About = () => {
  const { t } = useTranslation();

  const stats = [
    { icon: Users, label: t('about.students'), value: '10,000+' },
    { icon: BookOpen, label: t('footer.courses'), value: '500+' },
    { icon: Users, label: t('about.instructors'), value: '200+' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16 md:mb-20">
            <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6 px-4">
              {t('about.title')}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed px-4">
              {t('about.description')}
            </p>
          </div>

          {/* AAU History Section */}
          <div className="mb-20">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-12 shadow-xl border border-gray-100 dark:border-gray-700">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                <div className="order-2 lg:order-1">
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6 text-gray-900 dark:text-white">
                    {t('about.historyTitle')}
                  </h2>
                  <p className="text-base md:text-lg leading-relaxed mb-4 md:mb-6 text-gray-600 dark:text-gray-300">
                    {t('about.historyText1')}
                  </p>
                  <p className="text-base md:text-lg leading-relaxed text-gray-600 dark:text-gray-300 mb-6 md:mb-8">
                    {t('about.historyText2')}
                  </p>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 md:h-6 md:w-6 mr-2 text-blue-600" />
                      <span className="font-semibold text-sm md:text-base text-gray-900 dark:text-white">{t('about.established')}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 md:h-6 md:w-6 mr-2 text-blue-600" />
                      <span className="font-semibold text-sm md:text-base text-gray-900 dark:text-white">{t('about.location')}</span>
                    </div>
                  </div>
                </div>
                <div className="order-1 lg:order-2">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-4 md:p-8 border border-gray-200 dark:border-gray-600">
                    <div className="w-full h-48 md:h-64 rounded-xl overflow-hidden">
                      <img 
                        src={img}
                        alt="AAU Campus" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-center mt-4">
                      <p className="text-sm text-gray-600 dark:text-gray-300">{t('about.excellenceText')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mission & Vision Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-16 md:mb-20">
            <div className="group bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-10 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center mb-6 md:mb-8">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl p-3 md:p-4 mr-4 md:mr-6 group-hover:scale-110 transition-transform duration-300">
                  <Target className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  {t('about.mission')}
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base md:text-lg">
                {t('about.missionText')}
              </p>
            </div>

            <div className="group bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-10 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center mb-6 md:mb-8">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-3 md:p-4 mr-4 md:mr-6 group-hover:scale-110 transition-transform duration-300">
                  <Eye className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  {t('about.vision')}
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base md:text-lg">
                {t('about.visionText')}
              </p>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-12 shadow-xl border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 dark:text-white mb-8 md:mb-12">
              {t('about.impactTitle')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl p-4 md:p-6 w-20 h-20 md:w-24 md:h-24 mx-auto mb-4 md:mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <stat.icon className="h-8 w-8 md:h-12 md:w-12 text-white" />
                  </div>
                  <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-2 md:mb-3">
                    {stat.value}
                  </div>
                  <div className="text-lg md:text-xl text-gray-600 dark:text-gray-300 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;