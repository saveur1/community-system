import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaUsers, FaAward } from 'react-icons/fa';
import { FiTrendingUp } from 'react-icons/fi';

interface StatCard {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: string;
}

interface SlideImage {
  id: number;
  url: string;
  alt: string;
}

const HealthHeroSection: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Community and interfaith collaboration images
  const slideImages: SlideImage[] = [
    {
      id: 1,
      url: "/images/gathering.jpg",
      alt: "Community health workers in Rwanda"
    },
    {
      id: 2,
      url: "/images/malaria.jpg",
      alt: "Interfaith dialogue and collaboration"
    },
    {
      id: 3,
      url: "/images/child.jpg",
      alt: "Community listening and engagement"
    },
    {
      id: 4,
      url: "/images/counciljpg.jpg",
      alt: "Religious leaders promoting health"
    }
  ];

  // Statistics data from RICH organization
  const statsData: StatCard[] = [
    {
      icon: <FaUsers className="w-8 h-8" />,
      value: "2M+",
      label: "Community Members Reached",
      color: "bg-blue-500"
    },
    {
      icon: <FaHeart className="w-8 h-8" />,
      value: "2,480",
      label: "GBV Victims Supported",
      color: "bg-red-500"
    },
    {
      icon: <FaAward className="w-8 h-8" />,
      value: "21+",
      label: "Years of Impact",
      color: "bg-green-500"
    },
    {
      icon: <FiTrendingUp className="w-8 h-8" />,
      value: "4,064",
      label: "Religious Volunteers",
      color: "bg-purple-500"
    }
  ];

  // Auto-advance slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideImages.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [slideImages.length]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" as const }
    }
  };

  const slideVariants = {
    enter: { x: 300, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -300, opacity: 0 }
  };

  const statsVariants = {
    hidden: { y: 100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        delay: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-72px)] bg-gradient-to-br from-blue-50 via-white to-green-50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      </div>

      {/* Main Hero Content */}
      <div className="relative z-10 max-w-8xl mx-auto px-10">
        <motion.div
          className="grid lg:grid-cols-2 gap-12 items-center min-h-[70vh]"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Left Side - Content */}
          <div className="space-y-8">
            <motion.div variants={itemVariants} className="space-y-6">
              <motion.div
                className="inline-block px-4 py-2 bg-blue-100 text-primary rounded-full text-sm font-medium"
                whileHover={{ scale: 1.05 }}
              >
                🤝 Rwanda Interfaith Council on Health
              </motion.div>
              
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                <span className="text-gray-800">Community</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-green-600">
                  Listening
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                Amplifying community voices through faith-based collaboration. 
                Join our interfaith network promoting health, unity, and sustainable 
                development across Rwanda.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
              <motion.button
                className="px-8 py-4 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-shadow"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                Share Your Voice
              </motion.button>
              
              <motion.button
                className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-full hover:border-primary hover:text-primary transition-colors"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                Learn About RICH
              </motion.button>
            </motion.div>
          </div>

          {/* Right Side - Image Slideshow */}
          <motion.div
            variants={itemVariants}
            className="relative"
          >
            <div className="relative w-full h-[400px] rounded-2xl border border-gray-200 overflow-hidden shadow-2xl">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentSlide}
                  src={slideImages[currentSlide].url}
                  alt={slideImages[currentSlide].alt}
                  className="absolute inset-0 w-full h-full object-cover"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                />
              </AnimatePresence>
              
              {/* Slide Indicators */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {slideImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentSlide
                        ? 'bg-white scale-110'
                        : 'bg-white/50 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div
              className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full opacity-20"
              animate={{
                y: [0, -20, 0],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            <motion.div
              className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full opacity-10"
              animate={{
                y: [0, 20, 0],
                rotate: [360, 180, 0]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Statistics Cards - Bottom */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-gray-200"
        variants={statsVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-8xl mx-auto px-4 py-2">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {statsData.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="flex items-center space-x-4 p-4 rounded-xl hover:bg-white/50 transition-colors group cursor-pointer"
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <div className={`${stat.color} text-white p-3 rounded-full group-hover:scale-110 transition-transform`}>
                  {stat.icon}
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HealthHeroSection;