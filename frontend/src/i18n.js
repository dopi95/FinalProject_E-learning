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
        drEmily: 'Dr. Emily Rodriguez'
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
        missionText: 'To provide accessible, high-quality education through innovative technology and expert instruction.',
        vision: 'Our Vision',
        visionText: 'To become the leading e-learning platform that empowers learners worldwide to achieve their goals.',
        description: 'Transforming education through innovative technology and world-class instruction.',
        students: 'Students',
        instructors: 'Instructors',
        successRate: 'Success Rate'
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
        drEmily: 'ዶ/ር ኤሚሊ ሮድሪጌዝ'
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
        missionText: 'በአዳዲስ ቴክኖሎጂዎች እና የባለሙያ ትምህርት በኩል ተደራሽ እና ከፍተኛ ጥራት ያለው ትምህርት መስጠት።',
        vision: 'የእኛ እይታ',
        visionText: 'በዓለም ዙሪያ ያሉ ተማሪዎች ግባቸውን እንዲያሳኩ የሚያበረታታ ዋና የኢ-ትምህርት መድረክ መሆን።',
        description: 'በአዳዲስ ቴክኖሎጂዎች እና የዓለም ደረጃ ትምህርት ትምህርትን መለወጥ።',
        students: 'ተማሪዎች',
        instructors: 'አስተማሪዎች',
        successRate: 'የስኬት መጠን'
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
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;