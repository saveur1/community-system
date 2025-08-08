import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowRight } from 'react-icons/fa';
import { GrLinkNext, GrLinkPrevious } from "react-icons/gr";
import { HiOutlineSpeakerphone } from 'react-icons/hi';

type Direction = 'left' | 'right';

const AnnouncementsCards = () => {
  // Mock announcements data
  const announcements = [
    {
      id: 1,
      title: "System Upgrade",
      content: "RICH has been upgraded based on your valuable feedback! We've added new features to make you be able to give feedback on anything.",
      link: "https://community-tool.onrender.com",
      bgColor: "bg-primary",
      date: "2023-10-15"
    },
    {
      id: 2,
      title: "Maintenance Notice",
      content: "There will be scheduled maintenance this weekend. The system will be unavailable from 2:00 AM to 4:00 AM on Saturday.",
      link: "https://status.example.com",
      bgColor: "bg-title",
      date: "2023-10-20"
    },
    {
      id: 3,
      title: "New Feature Released",
      content: "Check out our new dashboard analytics feature! Get insights into your usage patterns and performance metrics.",
      link: "https://features.example.com/analytics",
      bgColor: "bg-purple-600",
      date: "2023-10-25"
    },
    {
      id: 4,
      title: "Community Event",
      content: "Join our upcoming webinar on November 5th to learn about best practices and network with other users.",
      link: "https://events.example.com/webinar",
      bgColor: "bg-green-600",
      date: "2023-11-01"
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState('left');
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-slide effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isAutoPlaying) {
      interval = setInterval(() => {
        nextAnnouncement();
      }, 10000);
    }

    return () => clearInterval(interval);
  }, [currentIndex, isAutoPlaying]);

  const nextAnnouncement = () => {
    setDirection('left');
    setCurrentIndex((prevIndex) => 
      prevIndex === announcements.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevAnnouncement = () => {
    setDirection('right');
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? announcements.length - 1 : prevIndex - 1
    );
  };

  const goToAnnouncement = (index: number) => {
    setDirection(index > currentIndex ? 'left' : 'right');
    setCurrentIndex(index);
    // Pause auto-play briefly when user manually navigates
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const variants = {
    enter: (direction: Direction) => ({
      x: direction === 'left' ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: 'tween' as const, ease: 'easeInOut' as const, duration: 0.5 },
        opacity: { duration: 0.3 }
      }
    },
    exit: (direction: Direction) => ({
      x: direction === 'left' ? -1000 : 1000,
      opacity: 0,
      transition: {
        x: { type: 'tween' as const, ease: 'easeInOut' as const, duration: 0.5 },
        opacity: { duration: 0.2 }
      }
    })
  };

  return (
    <div className="max-w-8xl mx-auto p-8 border-t-2 my-12 border-gray-300 flex flex-col items-center justify-center gap-y-4 w-full">
      <div className="flex items-center justify-center gap-x-10 w-full">
        {/* Previous announcement button */}
        <button 
          onClick={prevAnnouncement}
          className="p-4 hover:bg-gray-100 rounded-full transition"
          aria-label="Previous announcement"
        >
          <GrLinkPrevious size={25} className="text-title" />
        </button>

        <div className="relative min-h-52 w-full max-w-4xl overflow-hidden">
          <AnimatePresence custom={direction} initial={false}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute top-0 left-0 w-full h-full"
            >
              <div className="bg-white rounded-lg overflow-hidden w-full h-full border border-gray-300 shadow-sm">
                {/* Header with icon */}
                <div className={`${announcements[currentIndex].bgColor} px-6 py-4 flex items-center`}>
                  <HiOutlineSpeakerphone className="text-white text-2xl mr-3" />
                  <h2 className="text-xl font-bold text-white">{announcements[currentIndex].title}</h2>
                </div>

                {/* Content */}
                <div className="p-6 h-64 overflow-y-auto">
                  <p className="text-gray-700 mb-4">
                    {announcements[currentIndex].content}
                  </p>

                  <div className="flex items-center text-success font-medium">
                    <a
                      href={announcements[currentIndex].link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center hover:underline"
                    >
                      Learn more
                      <FaArrowRight className="ml-2" />
                    </a>
                  </div>
                </div>

                {/* Footer with subtle background */}
                <div className="bg-gray-50 px-6 py-3 text-sm text-gray-500">
                  Last updated: {new Date(announcements[currentIndex].date).toLocaleDateString()}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Next announcement button */}
        <button 
          onClick={nextAnnouncement}
          className="p-4 hover:bg-gray-100 rounded-full transition"
          aria-label="Next announcement"
        >
          <GrLinkNext size={25} className="text-title"/>
        </button>
      </div>

      {/* Indicator dots - positioned below the card */}
      <div className="flex justify-center space-x-3 mt-4">
        {announcements.map((_, index) => (
          <button
            key={index}
            onClick={() => goToAnnouncement(index)}
            className={`w-3 h-3 rounded-full transition-colors ${index === currentIndex ? announcements[currentIndex].bgColor : 'bg-gray-300'}`}
            aria-label={`Go to announcement ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default AnnouncementsCards;