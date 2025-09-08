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
}

const RealEstateHero: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Property images for slideshow
  const slideImages: SlideImage[] = [
    {
      id: 1,
      url: "/images/trainees.png",
      alt: "Community health workers in Rwanda"
    },
    {
      id: 2,
      url: "/images/gbv_supported.png",
      alt: "Gender based violence"
    },
    {
      id: 3,
      url: "/images/ecd_program.png",
      alt: "ECD Program for children"
    },
    {
      id: 4,
      url: "/images/community.png",
      alt: "Community reached"
    }
  ];

  // Auto-advance slideshow every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideImages.length);
    }, 3000);

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
    <div className="h-[calc(100vh-64px)] bg-gray-50 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(56,189,248,0.1),transparent_50%)]"></div>
      </div>
        <div className="relative bg-gradient-to-r from-transparent from-[68rem] to-primary to-[0rem]">
          <img src="/images/hero_left_bg.svg" alt="left bgg" className="absolute h-full object-cover"/>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="relative z-10 h-[calc(100vh-64px)] w-full flex max-w-8xl mx-auto px-4">
            {/* Left side - Image slideshow */}
            <div className="w-3/5 relative z-20">
              {/* Main image frame */}
              <div className="flex items-center gap-x-3 h-full">
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
                        transition={{ duration: 0.8, ease: 'easeInOut' }}
                      />
                    </AnimatePresence>
                  </div>
                </div>

                {/* Thumbnail strip */}
                <div className="flex flex-col gap-3 justify-center relative -mr-16 items-center w-48">
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

              {/* Slide indicators */}
              <div className="absolute bottom-12 left-8 flex gap-2">
                {slideImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide
                      ? 'bg-white scale-125'
                      : 'bg-white/50 hover:bg-white/80'
                      }`}
                  />
                ))}
              </div>
            </div>

            {/* Right side - Content */}
            <div className="w-2/5 bg-primary flex flex-col pl-16 items-end justify-center relative z-10 overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>

              <motion.div
                className="space-y-8 text-center"
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
                  <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                    Give feedback now
                  </span>
                </motion.div>

                {/* Main heading */}
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h1 className="text-6xl font-bold text-white leading-tight">
                    Community
                    <br />
                    Listening
                  </h1>
                  <p className="text-2xl text-white/90 font-light">FOR YOU</p>
                </motion.div>

                {/* Description */}
                <motion.p
                  className="text-white/90 text-lg leading-relaxed max-w-md ml-auto"
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
                  <div className="flex gap-4 justify-center">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-colors cursor-pointer">
                      <FaInstagram className="w-5 h-5 text-white" />
                    </div>
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-colors cursor-pointer">
                      <FaFacebookF className="w-5 h-5 text-white" />
                    </div>
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-colors cursor-pointer">
                      <FaTwitter className="w-5 h-5 text-white" />
                    </div>
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-colors cursor-pointer">
                      <FaWhatsapp className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
      </div>
    </div>
  );
};

export default RealEstateHero;