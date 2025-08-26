import React, { useState, useEffect } from 'react';
import { motion, type Variants } from 'framer-motion';
import StatisticsCards from '../our-impacts';
import HeroSlideshow from './HeroSlideshow';
import HeroContentLeft from './hero-content-left';

interface SlideImage {
  id: number;
  url: string;
  alt: string;
}

const HealthHeroSection: React.FC = () => {
  const handleScroll = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };
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

  const itemVariants: Variants = {
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
      <div className="relative w-full h-full max-sm:bg-primary/10 max-sm:pb-5 max-lg:pb-10">
        {/* Responsive background images */}
        <div aria-hidden className="pointer-events-none select-none absolute inset-0 z-0 w-full">
          {/* Left background: covers content on small screens */}
          <img
            src="/images/left_home_bg.svg"
            alt=""
            className="absolute left-0 top-0 h-full w-full lg:w-1/2 object-cover opacity-20 sm:opacity-100"
          />
          {/* Right background: hidden on small screens */}
          <div className="hidden absolute right-0 top-0 h-full w-[20%] lg:flex justify-end">
            <img
              src="/images/right_home_bg.svg"
              alt=""
              className="object-contain"
            />
          </div>
        </div>
        <div className="relative z-10 max-w-8xl mx-auto px-10 max-sm:px-4">
          <motion.div
            className="grid lg:grid-cols-2 items-center gap-2 max-lg:pt-10 min-h-[60vh]"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Left Side - Content */}
            <HeroContentLeft handleScroll={handleScroll} itemVariants={itemVariants} />

            {/* Right Side - Image Slideshow */}
            <HeroSlideshow
              itemVariants={itemVariants}
              slideVariants={slideVariants}
              slideImages={slideImages}
              currentSlide={currentSlide}
              setCurrentSlide={setCurrentSlide}
            />
          </motion.div>
        </div>
      </div>

      <StatisticsCards />
    </div>
  );
};

export default HealthHeroSection;