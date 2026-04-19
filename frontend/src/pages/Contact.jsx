import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Mail, Phone, MapPin, Send, CheckCircle, X, Clock, ExternalLink } from 'lucide-react';
import { contactAPI } from '../services/api';

const AAU_MAP_URL = 'https://www.google.com/maps/place/Addis+Ababa+University+Main+Campus/@9.0404,38.7634,17z';
const AAU_EMBED_URL = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.5!2d38.7634!3d9.0404!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b85cef5ab402d%3A0x8467b6b037a24d49!2sAddis%20Ababa%20University!5e0!3m2!1sen!2set!4v1700000000000!5m2!1sen!2set';

const Contact = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await contactAPI.submitContact(formData);
      setShowSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error('Error submitting contact form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      {/* Hero Banner */}
      <div className="relative bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800 py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-10 w-96 h-96 bg-purple-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium px-4 py-2 rounded-full mb-6">
            <MapPin className="h-4 w-4" />
            Addis Ababa University — School of Commerce
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            {t('contact.title')}
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto">
            {t('contact.getInTouch')}
          </p>
        </div>
      </div>

      <main className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

          {/* Info Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Mail className="h-6 w-6 text-white" />,
                gradient: 'from-blue-500 to-indigo-600',
                bg: 'bg-blue-50 dark:bg-blue-900/20',
                border: 'border-blue-100 dark:border-blue-800',
                label: t('contact.email'),
                value: 'info@aau-elearning.edu.et',
                href: 'mailto:info@aau-elearning.edu.et'
              },
              {
                icon: <Phone className="h-6 w-6 text-white" />,
                gradient: 'from-green-500 to-emerald-600',
                bg: 'bg-green-50 dark:bg-green-900/20',
                border: 'border-green-100 dark:border-green-800',
                label: t('contact.phone'),
                value: '+251 11 123 4567',
                href: 'tel:+251111234567'
              },
              {
                icon: <MapPin className="h-6 w-6 text-white" />,
                gradient: 'from-purple-500 to-pink-600',
                bg: 'bg-purple-50 dark:bg-purple-900/20',
                border: 'border-purple-100 dark:border-purple-800',
                label: t('contact.address'),
                value: 'King George VI St, Addis Ababa',
                href: AAU_MAP_URL
              },
              {
                icon: <Clock className="h-6 w-6 text-white" />,
                gradient: 'from-orange-500 to-red-500',
                bg: 'bg-orange-50 dark:bg-orange-900/20',
                border: 'border-orange-100 dark:border-orange-800',
                label: 'Office Hours',
                value: 'Mon – Fri: 8:00 AM – 5:00 PM',
                href: null
              }
            ].map((item, i) => (
              <div key={i} className={`${item.bg} border ${item.border} rounded-2xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow`}>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg`}>
                  {item.icon}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">{item.label}</p>
                  {item.href ? (
                    <a href={item.href} target="_blank" rel="noopener noreferrer"
                      className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{item.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Map + Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

            {/* Google Map */}
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Find Us on the Map</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Addis Ababa University — Main Campus</p>
              </div>

              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 group cursor-pointer"
                onClick={() => window.open(AAU_MAP_URL, '_blank')}>

                {/* Embedded Map */}
                <iframe
                  title="AAU Main Campus"
                  src={AAU_EMBED_URL}
                  width="100%"
                  height="400"
                  style={{ border: 0, display: 'block' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="pointer-events-none"
                />

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-900/20 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 font-semibold text-sm border border-gray-200 dark:border-gray-700">
                    <ExternalLink className="h-4 w-4 text-blue-600" />
                    Open in Google Maps
                  </div>
                </div>
              </div>

              {/* Open in Maps button */}
              <a
                href={AAU_MAP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 px-6 rounded-2xl border-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-500 font-semibold hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all duration-200 text-sm"
              >
                <MapPin className="h-4 w-4" />
                Open in Google Maps
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>

            {/* Contact Form */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700 relative overflow-hidden">

              {/* Success overlay */}
              {showSuccess && (
                <div className="absolute inset-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm flex items-center justify-center z-10 rounded-3xl">
                  <div className="text-center px-8">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-5 animate-bounce">
                      <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('contact.successTitle')}</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">{t('contact.successMessage')}</p>
                    <button onClick={() => setShowSuccess(false)}
                      className="bg-green-600 text-white px-6 py-2.5 rounded-xl hover:bg-green-700 font-medium transition-colors">
                      Send Another
                    </button>
                  </div>
                  <button onClick={() => setShowSuccess(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('contact.contactInfo')}</h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('contact.name')}</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required disabled={isSubmitting}
                      placeholder="Your full name"
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 disabled:opacity-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('contact.email')}</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required disabled={isSubmitting}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 disabled:opacity-50" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject</label>
                  <input type="text" name="subject" value={formData.subject} onChange={handleChange} required disabled={isSubmitting}
                    placeholder="How can we help?"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 disabled:opacity-50" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('contact.message')}</label>
                  <textarea name="message" rows={6} value={formData.message} onChange={handleChange} required disabled={isSubmitting}
                    placeholder="Write your message here..."
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 disabled:opacity-50 resize-none" />
                </div>

                <button type="submit" disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      <span>{t('contact.sending')}</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      <span>{t('contact.send')}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
