import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Facebook, Instagram, Linkedin, Youtube, Send } from 'lucide-react';
import logo from '../../public/assets/images/aaulogo.png';


const Footer = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const scrollToCourses = () => {
    // If we're on home page, scroll to courses section
    if (window.location.pathname === '/') {
      const coursesSection = document.getElementById('courses-section');
      if (coursesSection) {
        coursesSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Navigate to home page first
      navigate('/');
      // Wait for navigation to complete, then scroll
      setTimeout(() => {
        const coursesSection = document.getElementById('courses-section');
        if (coursesSection) {
          coursesSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/30 text-gray-800 dark:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="relative">
                <img 
                  src={logo}
                  alt="AAU E-Learning" 
                  className="h-12 w-16 object-contain cursor-pointer hover:scale-110 transition-transform"
                  onClick={scrollToTop}
                />
              </div>
              <div className="cursor-pointer" onClick={scrollToTop}>
                <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:scale-105 transition-transform inline-block">
                  AAU E-Learning
                </span>
                <div className="text-xs text-blue-600 dark:text-blue-400 font-medium tracking-wide">
                  Excellence in Education
                </div>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {t('footer.description')}
            </p>
            <div className="flex space-x-4">
              <a href="https://web.facebook.com/p/Addis-Ababa-University-100064311447035/?_rdc=1&_rdr" target="_blank" rel="noopener noreferrer">
                <Facebook className="h-6 w-6 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors" />
              </a>
              <a href="https://t.me/aau_official" target="_blank" rel="noopener noreferrer">
                <Send className="h-6 w-6 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors" />
              </a>
              <a href="https://www.instagram.com/aau_official_/" target="_blank" rel="noopener noreferrer">
                <Instagram className="h-6 w-6 text-gray-600 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400 cursor-pointer transition-colors" />
              </a>
              <a href="https://www.linkedin.com/company/addis-ababa-university-official" target="_blank" rel="noopener noreferrer">
                <Linkedin className="h-6 w-6 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors" />
              </a>
              <a href="https://www.youtube.com/@AddisAbabaUniversity-AAU" target="_blank" rel="noopener noreferrer">
                <Youtube className="h-6 w-6 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 cursor-pointer transition-colors" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/" 
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  onClick={scrollToTop}
                >
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {t('nav.about')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {t('nav.contact')}
                </Link>
              </li>
              <li>
                <button 
                  onClick={scrollToCourses}
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left"
                >
                  {t('footer.courses')}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">{t('footer.followUs')}</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {t('footer.stayUpdated')}
            </p>
          </div>
        </div>

        <div className="border-t border-blue-200 dark:border-blue-800 mt-8 pt-8 text-center">
          <p className="text-gray-600 dark:text-gray-300">{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;