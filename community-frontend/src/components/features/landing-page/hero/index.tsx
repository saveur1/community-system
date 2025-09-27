import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaWhatsapp,
} from 'react-icons/fa';

interface SlideImage {
  id: number;
  url: string;
  alt: string;
  statistics: {
    title: string;
    label: string;
    value: string;
  };
}

const HeroSection: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Property images for slideshow
  const slideImages: SlideImage[] = [
    {
      id: 1,
      url: "/images/religious_trainees.jpg",
      alt: "Community health workers in Rwanda",
      statistics: {
        title: "Training Impact",
        label: "Community health workers", 
        value: "450+ trained"
      }
    },
    {
      id: 2,
      url: "/images/gbc_support.jpg",
      alt: "Gender based violence",
      statistics: {
        title: "GBV Support",
        label: "Gender based victims supported",
        value: "2,720+"
      }
    },
    {
      id: 3,
      url: "/images/ecd_children.jpg",
      alt: "ECD Program for children",
      statistics: {
        title: "ECD Program",
        label: "Children enrolled in ECD", 
        value: "5,854 children"
      }
    },
    {
      id: 4,
      url: "/images/counciljpg.jpg",
      alt: "Community reached",
      statistics: {
        title: "Community Outreach",
        label: "Community members", 
        value: "2M+ members"
      }
    }
  ];

  // Auto-advance slideshow every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideImages.length);
    }, 10000);

    return () => clearInterval(timer);
  }, [slideImages.length]);

  const getVisibleThumbnails = () => {
    const thumbnails = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentSlide + i + 1) % slideImages.length;
      thumbnails.push(slideImages[index]);
    }
    return thumbnails;
  };

  const handleThumbnailClick = (thumbnailIndex: number) => {
    const actualIndex = (currentSlide + thumbnailIndex + 1) % slideImages.length;
    setCurrentSlide(actualIndex);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] md:h-[calc(100vh-64px)] bg-gray-50 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(56,189,248,0.1),transparent_50%)]"></div>
      </div>
      
      <div className="relative bg-gradient-to-r from-transparent md:from-[68rem] to-primary md:to-[0rem] max-md:bg-primary">
        {/* Left background - hidden on mobile */}
        <img
          src="/images/hero_left_bg.svg"
          alt="left bg"
          className="absolute h-full object-cover hidden lg:block"
        />
        
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-16 h-16 md:w-32 md:h-32 bg-white/10 rounded-full -translate-y-8 md:-translate-y-16 translate-x-8 md:translate-x-16"></div>
        
        <div className="relative z-10 min-h-[calc(100vh-64px)] md:h-[calc(100vh-64px)] w-full flex flex-col md:flex-row px-4 py-8 md:py-0">
          
          {/* Left side - Image slideshow (hidden on small screens, shown on medium+) */}
          <div className="hidden md:flex md:w-3/5 lg:w-3/5 relative z-20">
            {/* Main image frame */}
            <div className="flex items-center gap-x-3 h-full w-full">
              <div className="relative w-full h-[calc(100vh-20vh)] overflow-hidden bg-gray-200 border border-gray-200">
                <div className="relative w-full h-[calc(100vh-20vh)]">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentSlide}
                      src={slideImages[currentSlide].url}
                      alt={slideImages[currentSlide].alt}
                      className="absolute inset-0 w-full h-full object-cover"
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      transition={{ duration: 1.2, ease: 'easeInOut' }}
                    />
                  </AnimatePresence>
                  
                  {/* Statistics Card */}
                  <motion.div
                  key={slideImages[currentSlide].statistics.title}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.6 }}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-primary backdrop-blur-md text-white px-8 py-6 rounded-2xl shadow-2xl w-11/12 sm:w-4/5 lg:w-3/5"
                >
                  <h3 className="text-xl sm:text-2xl font-semibold mb-4">
                    {slideImages[currentSlide].statistics.title}
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                      <div
                        key={slideImages[currentSlide].statistics.title}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white/10 rounded-xl p-3"
                      >
                        <span className="text-sm sm:text-base text-blue-100">
                          {slideImages[currentSlide].statistics.label}
                        </span>
                        <span className="text-lg sm:text-xl font-bold">
                          {slideImages[currentSlide].statistics.value}
                        </span>
                      </div>
                  </div>
                </motion.div>
                </div>
              </div>

              {/* Thumbnail strip - hidden on small screens, shown on large screens */}
              <div className="hidden lg:flex flex-col gap-3 justify-center relative -mr-16 items-center w-48">
                {getVisibleThumbnails().map((image, index) => (
                  <div
                    key={`${image.id}-${index}`}
                    className="w-48 h-44 overflow-hidden cursor-pointer border-2 border-white/50 hover:border-white transition-all duration-300 shadow-lg"
                    onClick={() => handleThumbnailClick(index)}
                  >
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Slide indicators - only shown on medium+ screens */}
            <div className="absolute bottom-12 left-8 flex gap-2">
              {slideImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all bg-white duration-300 ${index === currentSlide
                    ? 'scale-125'
                    : 'hover:bg-white/80'
                    }`}
                />
              ))}
            </div>
          </div>

          {/* Right side - Content */}
          <div className="w-full md:w-2/5 lg:w-2/5 bg-primary flex flex-col px-4 md:pl-16 items-center md:items-end justify-center relative z-10 overflow-hidden min-h-[60vh] md:min-h-0">
            {/* Decorative elements */}
            <div className="absolute bottom-0 left-0 w-16 h-16 md:w-24 md:h-24 bg-white/10 rounded-full translate-y-8 md:translate-y-12 -translate-x-8 md:-translate-x-12"></div>

            <motion.div
              className="space-y-6 md:space-y-8 text-center max-w-lg"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, staggerChildren: 0.2 }}
            >
              {/* Special offer badge */}
              <motion.div
                className="inline-block"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <span className="bg-white/20 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium backdrop-blur-sm">
                  Give feedback now
                </span>
              </motion.div>

              {/* Main heading */}
              <motion.div
                className="space-y-2 md:space-y-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h1 className="text-4xl sm:text-5xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                  Community
                  <br />
                  Listening
                </h1>
                <p className="text-xl md:text-2xl text-white/90 font-light">FOR YOU</p>
              </motion.div>

              {/* Description */}
              <motion.p
                className="text-white/90 text-base md:text-lg leading-relaxed max-w-sm md:max-w-md mx-auto md:ml-auto md:mr-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                Amplifying community voices through faith-based collaboration.
                Join our interfaith network promoting health, unity, and sustainable
                development across Rwanda.
              </motion.p>

              {/* Social links and website */}
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
              >
                <div className="flex gap-3 md:gap-4 justify-center">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-colors cursor-pointer">
                    <FaInstagram className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-colors cursor-pointer">
                    <FaFacebookF className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-colors cursor-pointer">
                    <FaTwitter className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-colors cursor-pointer">
                    <FaWhatsapp className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                </div>
              </motion.div>

              {/* Mobile slide indicators - only shown on small screens */}
              <motion.div
                className="flex md:hidden gap-2 justify-center pt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
              >
                {slideImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentSlide
                      ? 'bg-white scale-125'
                      : 'bg-white/50'
                      }`}
                  />
                ))}
              </motion.div>
            </motion.div>
          </div>

          {/* Mobile Image Section - Only shown on small screens below the content */}
          <div className="block md:hidden w-full mt-8 px-4">
            <motion.div
              className="relative w-full h-64 sm:h-80 overflow-hidden bg-gray-200 border border-gray-200 rounded-lg shadow-lg"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentSlide}
                  src={slideImages[currentSlide].url}
                  alt={slideImages[currentSlide].alt}
                  className="absolute inset-0 w-full h-full object-cover"
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                />
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;