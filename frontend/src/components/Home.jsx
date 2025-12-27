import React from 'react';
import Header from './Header';
import Hero from './Hero';
import Courses from './Courses';
import Testimonials from './Testimonials';
import Footer from './Footer';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <Hero />
      <Courses />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Home;