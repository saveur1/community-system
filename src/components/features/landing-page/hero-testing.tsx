import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  background: string;
}

interface FlyingTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  wordDelay?: number;
}

const FlyingText: React.FC<FlyingTextProps> = ({ text, className, style, delay = 0, wordDelay = 200 }) => {
  const [visibleWords, setVisibleWords] = useState<number[]>([]);
  const words = text.split(' ');

  useEffect(() => {
    setVisibleWords([]);
    let timeouts: NodeJS.Timeout[] = [];

    words.forEach((_, index) => {
      const timeout = setTimeout(() => {
        setVisibleWords(prev => [...prev, index]);
      }, delay + index * wordDelay);
      timeouts.push(timeout);
    });

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [text, delay, wordDelay]);

  return (
    <div className={className} style={style}>
      {words.map((word, index) => (
        <motion.span
          key={`${text}-${index}`}
          initial={{ y: 50, opacity: 0 }}
          animate={visibleWords.includes(index) ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1.0] }}
          className="inline-block mr-2"
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
};

const WavoSlideshow = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const slides: Slide[] = [
    {
      id: 1,
      title: "Early Childhood",
      subtitle: "Growing Strong Families",
      description: "19 model ECD centers | 5,800+ children enrolled | 3,400+ households supported",
      background: "/images/child.jpg"
    },
    {
      id: 2,
      title: "Maternal & Youth Health",
      subtitle: "Empowering Women & Youth",
      description: "2,000+ volunteers | 1M+ people reached | 1,480 GBV victims reintegrated",
      background: "/images/gathering.jpg"
    },
    {
      id: 3,
      title: "Disease Prevention",
      subtitle: "Fighting for Healthier Communities",
      description: "1M+ reached with messages | 135 hospitals partnered | 280 volunteers in IVM",
      background: "/images/malaria.jpg"
    },
    {
      id: 4,
      title: "Mental Health",
      subtitle: "Healing Minds & Families",
      description: "1,240 GBV victims counselled | 100 families supported | 100K+ reached by sermons",
      background: "/images/schools.jpg"
    }
  ];

  const nextSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide(prev => (prev + 1) % slides.length);
    setTimeout(() => setIsAnimating(false), 2500);
  };

  const prevSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
    setTimeout(() => setIsAnimating(false), 2500);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 9000);
    return () => clearInterval(interval);
  }, [isAnimating]);

  return (
    <div className="relative h-[calc(100vh-80px)] w-full overflow-hidden bg-black">
      {/* Background */}
      <div className="absolute inset-0 w-full h-full">
        {slides.map((slide, index) => {
          const isActive = index === currentSlide;
          const isPrevious = index === (currentSlide - 1 + slides.length) % slides.length;
          if (!isActive && !isPrevious) return null;
          return (
            <motion.div
              key={`bg-${slide.id}`}
              className="absolute inset-0 w-full h-full"
              initial={isActive && !isPrevious ? { x: '100%' } : { x: 0 }}
              animate={{ x: 0 }}
              transition={{ duration: 1.0, ease: [0.25, 0.1, 0.25, 1.0] }}
              style={{ zIndex: isActive ? 20 : 10 }}
            >
              <div
                className="w-full h-full bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${slide.background})`
                }}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Text */}
      <div className="absolute inset-0 flex items-center justify-center z-40">
        <div className="text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={`text-${currentSlide}`}
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <FlyingText text={slides[currentSlide].title} className="text-5xl lg:text-7xl font-light text-white leading-none" delay={100} />
              <FlyingText text={slides[currentSlide].subtitle} className="text-3xl lg:text-5xl font-light text-white mt-4" style={{ WebkitTextStroke: '1px white', WebkitTextFillColor: 'transparent' }} delay={400} />
              <FlyingText text={slides[currentSlide].description} className="text-sm tracking-widest text-white mt-6 font-light" delay={700} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <button onClick={prevSlide} className="absolute left-6 top-1/2 transform -translate-y-1/2 z-40 text-white hover:text-gray-300" disabled={isAnimating}>
        <FiChevronLeft size={40} />
      </button>
      <button onClick={nextSlide} className="absolute right-6 top-1/2 transform -translate-y-1/2 z-40 text-white hover:text-gray-300" disabled={isAnimating}>
        <FiChevronRight size={40} />
      </button>

      {/* Counter */}
      <div className="absolute bottom-6 left-6 z-40 text-white text-sm">
        <span className="font-light">{String(currentSlide + 1).padStart(2, '0')}</span>
        <span className="mx-2">/</span>
        <span className="font-light">{String(slides.length).padStart(2, '0')}</span>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-40 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (!isAnimating) {
                setIsAnimating(true);
                setCurrentSlide(index);
                setTimeout(() => setIsAnimating(false), 2500);
              }
            }}
            className={`w-3 h-3 rounded-full ${index === currentSlide ? 'bg-white' : 'bg-white/30 hover:bg-white/50'}`}
            disabled={isAnimating}
          />
        ))}
      </div>

      {/* Progress */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-40">
        <motion.div className="h-full bg-primary" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 7, ease: 'linear' }} key={currentSlide} />
      </div>
    </div>
  );
};

export default WavoSlideshow;