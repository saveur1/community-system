import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SlideImage {
  id: number;
  url: string;
  alt: string;
}

interface HeroSlideshowProps {
  itemVariants: any;
  slideVariants: any;
  slideImages: SlideImage[];
  currentSlide: number;
  setCurrentSlide: React.Dispatch<React.SetStateAction<number>>;
}

const HeroSlideshow: React.FC<HeroSlideshowProps> = ({
  itemVariants,
  slideVariants,
  slideImages,
  currentSlide,
  setCurrentSlide
}) => {
  return (
    <motion.div variants={itemVariants} className="relative max-lg:mt-5" >
      <div className="relative w-full h-[350px] bg-gray-400 rounded-2xl border border-gray-200 overflow-hidden shadow-2xl">
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
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          />
        </AnimatePresence>

        <div className="absolute z-10 bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {slideImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-title scale-110' : 'bg-title/50 hover:bg-title/70'
              }`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default HeroSlideshow;
