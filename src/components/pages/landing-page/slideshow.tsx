import { useEffect, useRef, useState } from "react";
import { motion, type Variants } from "framer-motion";
const slides = [
    {
      img: "/images/whatisworking.png",
      desc: "Faith leaders and communities unite to improve health outcomes across Rwanda."
    },
    {
      img: "/images/betterservices.png",
      desc: "Digital tools empower real-time feedback and data-driven decisions."
    },
    {
      img: "/images/reportask.png",
      desc: "Every voice matters: inclusive health feedback for a brighter future."
    }
  ];
  
  const sectionVariants: Variants = {
    hidden: (dir = 1) => ({ opacity: 0, x: dir > 0 ? 80 : -80 }),
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, type: "spring" } }
  };

// Animated Slideshow Subcomponent
function AnimatedSlideshow() {
    const [index, setIndex] = useState(0);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const numSlides = slides.length;
  
    useEffect(() => {
      timeoutRef.current && clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setIndex((prev) => (prev + 1) % numSlides);
      }, 10000);
      return () => {timeoutRef.current && clearTimeout(timeoutRef.current);}
    }, [index, numSlides]);
  
    return (
      <motion.div
        className="w-full max-w-sm sm:max-w-md lg:max-w-xl p-2 sm:p-4 flex flex-col items-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
        custom={1}
        aria-label="Slideshow"
      >
        <div className="relative w-full aspect-[4/3] flex items-center justify-end overflow-hidden mb-3 sm:mb-4">
          <motion.img
            key={slides[index].img}
            src={slides[index].img}
            width={500}
            height={300}
            alt="Slideshow visual"
            className="object-cover w-full h-full"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.7 }}
          />
        </div>
        <div className="flex gap-1 mb-2 sm:mb-3" aria-label="Slide indicators">
          {slides.map((_, i) => (
            <span
              key={i}
              className={`inline-block w-2 h-2 rounded-full ${i === index ? "bg-primary" : "bg-primary/30"}`}
              aria-current={i === index ? "true" : undefined}
            />
          ))}
        </div>
        <motion.p
          key={slides[index].desc}
          className="text-sm sm:text-base lg:text-lg text-title text-right w-2/3 sm:text-right italic px-2 sm:px-0 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          {slides[index].desc}
        </motion.p>
      </motion.div>
    );
  }

  export default AnimatedSlideshow;