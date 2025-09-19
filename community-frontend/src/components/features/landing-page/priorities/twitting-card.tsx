import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaRetweet, FaComment, FaShare } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

type Direction = 'left' | 'right';

interface Tweet {
  id: string;
  username: string;
  handle: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
  retweets: number;
  replies: number;
  verified: boolean;
}

const TwitterCards = () => {
  // Mock tweets data - Replace with actual Twitter API integration
  const tweets: Tweet[] = [
    {
      id: "1",
      username: "Tech News Daily",
      handle: "@technewsdaily",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      content: "🚀 Breaking: New AI breakthrough announced at Stanford! Researchers have developed a model that can understand context 50% better than previous versions. This could revolutionize how we interact with technology. #AI #TechNews",
      timestamp: "2h",
      likes: 1247,
      retweets: 387,
      replies: 89,
      verified: true
    },
    {
      id: "2",
      username: "Design Inspiration",
      handle: "@designinspo",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b512fcbf?w=100&h=100&fit=crop&crop=face",
      content: "The secret to great design isn't just making things look pretty - it's about solving real problems for real people. Every pixel should have a purpose. ✨ What's your design philosophy?",
      timestamp: "4h",
      likes: 892,
      retweets: 234,
      replies: 156,
      verified: false
    },
    {
      id: "3",
      username: "Startup Founder",
      handle: "@startuplife",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      content: "Just closed our Series A! 🎉 Couldn't have done it without an amazing team and incredible investors who believed in our vision. Here's to building something that matters. The journey is just beginning!",
      timestamp: "6h",
      likes: 2156,
      retweets: 678,
      replies: 234,
      verified: true
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<Direction>('left');
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-slide effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isAutoPlaying && tweets.length > 1) {
      interval = setInterval(() => {
        nextTweet();
      }, 10000);
    }

    return () => clearInterval(interval);
  }, [currentIndex, isAutoPlaying, tweets.length]);

  const nextTweet = () => {
    setDirection('left');
    setCurrentIndex((prevIndex) =>
      prevIndex === tweets.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToTweet = (index: number) => {
    setDirection(index > currentIndex ? 'left' : 'right');
    setCurrentIndex(index);
    // Pause auto-play briefly when user manually navigates
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
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

  if (!tweets.length) {
    return (
      <div className="text-center text-gray-500 py-8">
        No tweets available
      </div>
    );
  }

  const currentTweet = tweets[currentIndex];

  return (
    <div
      className="relative max-w-4xl mx-auto bg-primary rounded-lg px-4 py-6 sm:py-8 my-8 sm:my-2 flex flex-col items-center justify-center gap-y-4 w-full"
      id="twitter-feed"
    >
      {/* Twitter/X Icon positioned at top center */}
      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-title rounded-full p-3 shadow-lg border-2 border-white">
        <FaXTwitter size={16} className="text-white" />
      </div>

      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-y-4 w-full">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 w-full mt-8">
          <div className="relative h-96 w-full max-w-xl sm:max-w-2xl md:max-w-3xl overflow-hidden">
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
                <div className="bg-white rounded-lg overflow-hidden w-full h-full border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
                  {/* Tweet Header */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-start space-x-3">
                      <img
                        src={currentTweet.avatar}
                        alt={`${currentTweet.username} avatar`}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-gray-900 text-sm">
                            {currentTweet.username}
                          </h3>
                          {currentTweet.verified && (
                            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <p className="text-gray-500 text-sm">{currentTweet.handle} • {currentTweet.timestamp}</p>
                      </div>
                    </div>
                  </div>

                  {/* Tweet Content */}
                  <div className="p-4 flex-1">
                    <p className="text-gray-800 leading-relaxed">
                      {currentTweet.content}
                    </p>
                  </div>

                  {/* Tweet Actions */}
                  <div className="absolute bottom-0 left-0 w-full px-4 py-3 border-2 rounded-b-lg border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-around">
                      <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors group">
                        <div className="p-2 rounded-full group-hover:bg-blue-50">
                          <FaComment size={14} />
                        </div>
                        <span className="text-sm">{formatNumber(currentTweet.replies)}</span>
                      </button>
                      
                      <button className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors group">
                        <div className="p-2 rounded-full group-hover:bg-green-50">
                          <FaRetweet size={14} />
                        </div>
                        <span className="text-sm">{formatNumber(currentTweet.retweets)}</span>
                      </button>
                      
                      <button className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors group">
                        <div className="p-2 rounded-full group-hover:bg-red-50">
                          <FaHeart size={14} />
                        </div>
                        <span className="text-sm">{formatNumber(currentTweet.likes)}</span>
                      </button>
                      
                      <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors group">
                        <div className="p-2 rounded-full group-hover:bg-blue-50">
                          <FaShare size={14} />
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Indicator dots - positioned below the card */}
        {tweets.length > 1 && (
          <div className="flex justify-center space-x-2 sm:space-x-3 mt-4">
            {tweets.map((_, index) => (
              <button
                key={index}
                onClick={() => goToTweet(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-white' : 'bg-white/40'
                }`}
                aria-label={`Go to tweet ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TwitterCards;