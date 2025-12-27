import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      nav: {
        home: 'Home',
        about: 'About',
        contact: 'Contact',
        login: 'Login'
      },
      hero: {
        title: 'Learn Without Limits at AAU',
        subtitle: 'Discover world-class courses, connect with expert instructors, and advance your career with our comprehensive e-learning platform.',
        getStarted: 'Get Started',
        browseCourses: 'Browse Courses',
        welcomeBadge: '🎓 Welcome to the Future of Learning'
      },
      courses: {
        title: 'Featured Courses',
        searchPlaceholder: 'Search courses...',
        allCategories: 'All Categories',
        programming: 'Programming',
        design: 'Design',
        business: 'Business',
        marketing: 'Marketing',
        enrollNow: 'Enroll Now',
        reactCourse: 'React Development Masterclass',
        uiuxCourse: 'UI/UX Design Fundamentals',
        marketingCourse: 'Digital Marketing Strategy',
        drSarah: 'Dr. Sarah Johnson',
        profMichael: 'Prof. Michael Chen',
        drEmily: 'Dr. Emily Rodriguez',
        viewDetails: 'View Details',
        backToCourses: 'Back to Courses',
        instructor: 'Instructor',
        students: 'students',
        aboutCourse: 'About This Course',
        courseIncludes: 'This course includes:',
        lifetimeAccess: 'Lifetime access to course materials',
        certificate: 'Certificate of completion',
        instructorSupport: 'Direct instructor support',
        mobileAccess: 'Mobile and desktop access',
        moneyBack: '30-day money-back guarantee',
        oneTimePayment: 'One-time payment',
        birr: 'Birr',
        reactDescription: 'Master React development from basics to advanced concepts. Build real-world projects and learn industry best practices.',
        reactLongDescription: 'This comprehensive React course will take you from beginner to advanced level. You\'ll learn modern React concepts including hooks, context, state management, and more. Build multiple projects including a complete e-commerce application with payment integration and user authentication.',
        uiuxDescription: 'Learn the fundamentals of user interface and user experience design.',
        uiuxLongDescription: 'Dive deep into UI/UX design principles and create stunning user interfaces. Learn design thinking, wireframing, prototyping, and user research. Master tools like Figma and Adobe XD to create professional designs that users love.',
        marketingDescription: 'Master digital marketing strategies and grow your business online.',
        marketingLongDescription: 'Learn comprehensive digital marketing strategies including SEO, social media marketing, content marketing, email campaigns, and paid advertising. Understand analytics, conversion optimization, and how to build a complete digital marketing funnel that drives results.',
        certificateText: 'Certificate'
      },
      testimonials: {
        title: 'What Our Community Says',
        subtitle: 'Hear from students and instructors who are part of our learning journey',
        student1Text: 'The courses are incredibly well-structured and the instructors are top-notch. I\'ve learned more in 3 months than I did in a full semester!',
        instructor1Text: 'Teaching on this platform has been amazing. The tools provided make it easy to create engaging content and connect with students worldwide.',
        student2Text: 'The flexibility of online learning combined with the quality of instruction has allowed me to advance my career while studying.',
        abebe: 'Abebe Kebede',
        meron: 'Dr. Meron Tadesse',
        hanan: 'Hanan Mohammed',
        csStudent: 'Computer Science Student',
        seInstructor: 'Software Engineering Instructor',
        baStudent: 'Business Administration Student'
      },
      footer: {
        copyright: '© 2026 AAU E-Learning. All rights reserved.',
        quickLinks: 'Quick Links',
        followUs: 'Follow Us',
        description: 'Empowering learners worldwide with quality education and innovative technology.',
        courses: 'Courses',
        stayUpdated: 'Stay updated with our latest courses and announcements.'
      },
      about: {
        title: 'About AAU E-Learning',
        mission: 'Our Mission',
        missionText: 'To provide accessible, high-quality education through innovative technology and expert instruction, empowering students to achieve their academic and professional goals.',
        vision: 'Our Vision',
        visionText: 'To become the leading e-learning platform in Ethiopia and beyond, fostering a culture of lifelong learning and academic excellence.',
        description: 'Transforming education through innovative technology and world-class instruction at Addis Ababa University.',
        historyTitle: 'AAU Legacy & Innovation',
        historyText1: 'Addis Ababa University, established in 1950, is Ethiopia\'s oldest and most prestigious institution of higher learning. With over 70 years of academic excellence, AAU has been at the forefront of education, research, and innovation in Africa.',
        historyText2: 'Our e-learning platform represents the next chapter in AAU\'s commitment to accessible, quality education. By combining our rich academic heritage with cutting-edge technology, we\'re making world-class education available to students everywhere.',
        established: 'Est. 1950',
        location: 'Addis Ababa, Ethiopia',
        students: 'Students',
        instructors: 'Instructors',
        statsTitle: 'Our Impact in Numbers',
        contactTitle: 'Get in Touch with AAU E-Learning',
        addressText: 'Addis Ababa University\nMain Campus, Sidist Kilo\nAddis Ababa, Ethiopia'
      },
      contact: {
        title: 'Contact Us',
        getInTouch: 'Get in Touch',
        name: 'Name',
        email: 'Email',
        message: 'Message',
        send: 'Send Message',
        contactInfo: 'Contact Information',
        phone: 'Phone',
        address: 'Address'
      },
      chatbot: {
        title: 'AAU Assistant',
        placeholder: 'Type your message...',
        send: 'Send',
        welcome: 'Hello! I\'m your AAU E-Learning assistant. How can I help you today?',
        typing: 'Assistant is typing...',
        close: 'Close chat'
      }
    }
  },
  am: {
    translation: {
      nav: {
        home: 'መነሻ',
        about: 'ስለ እኛ',
        contact: 'ያግኙን',
        login: 'ግባ'
      },
      hero: {
        title: 'በ AAU ያለ ገደብ ይማሩ',
        subtitle: 'የዓለም ደረጃ ኮርሶችን ያግኙ፣ ከባለሙያ አስተማሪዎች ጋር ይገናኙ እና በእኛ አጠቃላይ የኢ-ትምህርት መድረክ ሙያዎን ያሳድጉ።',
        getStarted: 'ጀምር',
        browseCourses: 'ኮርሶችን አስሱ',
        welcomeBadge: '🎓 ወደ የትምህርት ወደፊት እንኳን በደህና መጡ'
      },
      courses: {
        title: 'ተመራጭ ኮርሶች',
        searchPlaceholder: 'ኮርሶችን ይፈልጉ...',
        allCategories: 'ሁሉም ምድቦች',
        programming: 'ፕሮግራሚንግ',
        design: 'ዲዛይን',
        business: 'ንግድ',
        marketing: 'ማርኬቲንግ',
        enrollNow: 'አሁን ይመዝገቡ',
        reactCourse: 'የሪአክት ልማት ማስተር ክላስ',
        uiuxCourse: 'የUI/UX ዲዛይን መሰረታዊ ነገሮች',
        marketingCourse: 'የዲጂታል ማርኬቲንግ ስትራቴጂ',
        drSarah: 'ዶ/ር ሳራ ጆንሰን',
        profMichael: 'ፕሮፌሰር ሚካኤል ቸን',
        drEmily: 'ዶ/ር ኤሚሊ ሮድሪጌዝ',
        viewDetails: 'ዝርዝር ይመልከቱ',
        backToCourses: 'ወደ ኮርሶች ተመለስ',
        instructor: 'አስተማሪ',
        students: 'ተማሪዎች',
        aboutCourse: 'ስለዚህ ኮርስ',
        courseIncludes: 'ዚህ ኮርስ የሚከተለውን:',
        lifetimeAccess: 'የትምህርት መሳሪያዎች የሁልንም መብታት',
        certificate: 'የመጠናነት ሰንድ',
        instructorSupport: 'ከአስተማሪ ቀስለ ድግፍ',
        mobileAccess: 'በሞባይል እና ዴስክቶፕ መብታት',
        moneyBack: 'በተመን 30 ቀን ነጥብ ውጤት ዋንትይ',
        oneTimePayment: 'አንድ ጊዜ ይፈይያ',
        online: 'ኦንላይን',
        birr: 'ብር',
        reactDescription: 'ከመሰረታዊ እስከ ከፍተኛ ደረጃ የሪአክት ልማትን ይማሩ። የእውነተኛ ዓለም ፕሮጀክቶችን ይገንቡ እና የኢንዱስትሪ ምርጥ ልምዶችን ይማሩ።',
        reactLongDescription: 'ይህ አጠቃላይ የሪአክት ኮርስ ከጀማሪ እስከ ከፍተኛ ደረጃ ይወስድዎታል። hooks፣ context፣ state management እና ሌሎችን ጨምሮ ዘመናዊ የሪአክት ጽንሰ-ሀሳቦችን ይማራሉ። የክፍያ ውህደት እና የተጠቃሚ ማረጋገጫን ጨምሮ ሙሉ የኢ-ኮሜርስ መተግበሪያን ጨምሮ በርካታ ፕሮጀክቶችን ይገንቡ።',
        uiuxDescription: 'የተጠቃሚ በይነገጽ እና የተጠቃሚ ተሞክሮ ዲዛይን መሰረታዊ ነገሮችን ይማሩ።',
        uiuxLongDescription: 'በUI/UX ዲዛይን መርሆች ውስጥ በጥልቀት ይግቡ እና አስደናቂ የተጠቃሚ በይነገጾችን ይፍጠሩ። የዲዛይን አስተሳሰብ፣ wireframing፣ prototyping እና የተጠቃሚ ምርምርን ይማሩ። ተጠቃሚዎች የሚወዷቸውን ሙያዊ ዲዛይኖች ለመፍጠር እንደ Figma እና Adobe XD ያሉ መሳሪያዎችን ይቆጣጠሩ።',
        marketingDescription: 'የዲጂታል ማርኬቲንግ ስትራቴጂዎችን ይቆጣጠሩ እና የንግድ ስራዎን በመስመር ላይ ያሳድጉ።',
        marketingLongDescription: 'SEO፣ ማህበራዊ ሚዲያ ማርኬቲንግ፣ የይዘት ማርኬቲንግ፣ የኢሜይል ዘመቻዎች እና የተከፈለ ማስታወቂያን ጨምሮ አጠቃላይ የዲጂታል ማርኬቲንግ ስትራቴጂዎችን ይማሩ። ትንታኔዎችን፣ የልወጣ ማሻሻያን እና ውጤቶችን የሚያመጣ ሙሉ የዲጂታል ማርኬቲንግ ፈነልን እንዴት መገንባት እንደሚቻል ይረዱ።',
        certificateText: 'ሰርተፊኬት'
      },
      testimonials: {
        title: 'የእኛ ማህበረሰብ ምን ይላል',
        subtitle: 'በእኛ የመማሪያ ጉዞ ውስጥ ያሉ ተማሪዎች እና አስተማሪዎች ያሉትን ይስሙ',
        student1Text: 'ኮርሶቹ በሚያስደንቅ ሁኔታ በደንብ የተዋቀሩ ናቸው እና አስተማሪዎቹ ከፍተኛ ደረጃ ያላቸው ናቸው። በ3 ወራት ውስጥ ከአንድ ሙሉ ሴሚስተር የተማርኩትን በላይ ተምሬያለሁ!',
        instructor1Text: 'በዚህ መድረክ ላይ ማስተማር አስደናቂ ነው። የቀረቡት መሳሪያዎች አሳታፊ ይዘት መፍጠር እና ከተማሪዎች ጋር በዓለም ዙሪያ መገናኘት ቀላል ያደርገዋል።',
        student2Text: 'የመስመር ላይ ትምህርት ተለዋዋጭነት ከትምህርት ጥራት ጋር ተዳምሮ እያጠናሁ ሙያዬን እንድቀይር አስችሎኛል።',
        abebe: 'አበበ ከበደ',
        meron: 'ዶ/ር መሮን ታደሰ',
        hanan: 'ሀናን መሀመድ',
        csStudent: 'የኮምፒውተር ሳይንስ ተማሪ',
        seInstructor: 'የሶፍትዌር ኢንጂነሪንግ አስተማሪ',
        baStudent: 'የንግድ አስተዳደር ተማሪ'
      },
      footer: {
        copyright: '© 2026 AAU ኢ-ትምህርት። ሁሉም መብቶች የተጠበቁ ናቸው።',
        quickLinks: 'ፈጣን አገናኞች',
        followUs: 'ይከተሉን',
        description: 'በዓለም ዙሪያ ያሉ ተማሪዎችን በጥራት ትምህርት እና አዳዲስ ቴክኖሎጂዎች ማብቃት።',
        courses: 'ኮርሶች',
        stayUpdated: 'ከእኛ የቅርብ ጊዜ ኮርሶች እና ማስታወቂያዎች ጋር ተዘምኑ።'
      },
      about: {
        title: 'ስለ AAU ኢ-ትምህርት',
        mission: 'የእኛ ተልእኮ',
        missionText: 'በአዳዲስ ቴክኖሎጂዎች እና የባለሙያ ትምህርት በኩል ተደራሽ እና ከፍተኛ ጥራት ያለው ትምህርት መስጠት፣ ተማሪዎች የአካዳሚክ እና የሙያ ግባቸውን እንዲያሳኩ ማብቃት።',
        vision: 'የእኛ እይታ',
        visionText: 'በኢትዮጵያ እና ከዚያም በላይ ዋና የኢ-ትምህርት መድረክ መሆን፣ የዕድሜ ልክ ትምህርት እና የአካዳሚክ ብቃት ባህልን ማሳደግ።',
        description: 'በአዲስ አበባ ዩኒቨርሲቲ በአዳዲስ ቴክኖሎጂዎች እና የዓለም ደረጃ ትምህርት ትምህርትን መለወጥ።',
        historyTitle: 'የAAU ውርስ እና ፈጠራ',
        historyText1: 'በ1950 የተመሰረተው አዲስ አበባ ዩኒቨርሲቲ የኢትዮጵያ ቀዳሚ እና በጣም ታዋቂ የከፍተኛ ትምህርት ተቋም ነው። ከ70 ዓመታት በላይ የአካዳሚክ ብቃት ያለው AAU በአፍሪካ በትምህርት፣ በምርምር እና በፈጠራ ግንባር ቀደም ሆኖ ቆይቷል።',
        historyText2: 'የእኛ የኢ-ትምህርት መድረክ በAAU ተደራሽ እና ጥራት ያለው ትምህርት ቁርጠኝነት ውስጥ የሚቀጥለው ምዕራፍ ነው። የበለጸገ የአካዳሚክ ውርሳችንን ከዘመናዊ ቴክኖሎጂ ጋር በማጣመር፣ የዓለም ደረጃ ትምህርትን በሁሉም ቦታ ላሉ ተማሪዎች ተደራሽ እያደረግን ነው።',
        established: 'የተመሰረተበት 1950',
        location: 'አዲስ አበባ፣ ኢትዮጵያ',
        students: 'ተማሪዎች',
        instructors: 'አስተማሪዎች',
        statsTitle: 'በቁጥር የእኛ ተጽእኖ',
        contactTitle: 'ከAAU ኢ-ትምህርት ጋር ይገናኙ',
        addressText: 'አዲስ አበባ ዩኒቨርሲቲ\nዋና ካምፓስ፣ ስድስት ኪሎ\nአዲስ አበባ፣ ኢትዮጵያ'
      },
      contact: {
        title: 'ያግኙን',
        getInTouch: 'ይገናኙ',
        name: 'ስም',
        email: 'ኢሜይል',
        message: 'መልእክት',
        send: 'መልእክት ላክ',
        contactInfo: 'የመገናኛ መረጃ',
        phone: 'ስልክ',
        address: 'አድራሻ'
      },
      chatbot: {
        title: 'የAAU ረዳት',
        placeholder: 'መልእክትዎን ይጻፉ...',
        send: 'ላክ',
        welcome: 'ሰላም! እኔ የAAU ኢ-ትምህርት ረዳትዎ ነኝ። ዛሬ እንዴት ልረዳዎት እችላለሁ?',
        typing: 'ረዳቱ እየጻፈ ነው...',
        close: 'ውይይት ዝጋ'
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

// Save language changes to localStorage
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
});

export default i18n;