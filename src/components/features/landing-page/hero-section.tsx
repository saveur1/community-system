import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaUsers, FaAward } from 'react-icons/fa';
import { FiTrendingUp } from 'react-icons/fi';
import StatisticsCards from './our-impacts';

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
    enter: { 
      x: '100%', 
      zIndex: 2,
      opacity: 1
    },
    center: { 
      x: 0, 
      zIndex: 2,
      opacity: 1
    },
    exit: { 
      x: 0, 
      zIndex: 1,
      opacity: 0
    }
  };



  return (
    <div className="relative min-h-[calc(100vh-72px)] bg-gradient-to-br from-blue-50 via-white to-green-50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      </div>

      {/* Main Hero Content */}
      <div className="relative z-10"
        style={{ backgroundImage: 'url(/images/home_bg.svg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="max-w-8xl mx-auto px-10 ">
          <motion.div
            className="grid lg:grid-cols-2 gap-12 pt-10 min-h-[65vh]"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Left Side - Content */}
            <div className="space-y-8">
              <motion.div variants={itemVariants} className="space-y-6">
                <h1 className="text-5xl lg:text-6xl font-bold leading-none">
                  <span className="text-gray-800">Community</span>
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-green-600">
                    Listening
                  </span>
                </h1>

                <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                  Amplifying community voices through faith-based collaboration.
                  Join our interfaith network promoting health, unity, and sustainable
                  development across Rwanda.
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  className="px-8 py-4 bg-gradient-to-r cursor-pointer from-primary to-primary-dark text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-shadow"
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
              <div className="relative w-full h-[350px] rounded-2xl border border-gray-200 overflow-hidden shadow-2xl">
                <AnimatePresence>
                  <motion.img
                    key={currentSlide}
                    src={slideImages[currentSlide].url}
                    alt={slideImages[currentSlide].alt}
                    className="absolute inset-0 w-full h-full object-cover"
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                  />
                </AnimatePresence>

                {/* Slide Indicators */}
                <div className="absolute z-10 bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {slideImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide
                          ? 'bg-title scale-110'
                          : 'bg-title/50 hover:bg-title/70'
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
            </motion.div>
          </motion.div>
        </div>
      </div>

      <StatisticsCards />
    </div>
  );
};

export default HealthHeroSection;