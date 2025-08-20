import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineChatAlt,
  HiOutlineClipboardList,
  HiOutlineClock,
  HiOutlineShieldCheck,
} from 'react-icons/hi';

// Notification types
type NotificationType = 'survey' | 'feedback' | 'immunization' | 'system';

interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    time: string;
    read: boolean;
    link?: string;
}

// Mock notifications data generator
const generateMockNotifications = (page: number, limit: number = 10): Notification[] => {
  const types: NotificationType[] = ['survey', 'feedback', 'immunization', 'system'];
  const titles = {
    survey: ['New Survey Available', 'Survey Reminder', 'Monthly Health Survey', 'Community Feedback Survey'],
    feedback: ['Feedback Received', 'New Community Response', 'Feedback Update', 'Response to Your Visit'],
    immunization: ['Immunization Update', 'Vaccine Schedule Change', 'New Vaccine Available', 'Immunization Reminder'],
    system: ['System Maintenance', 'Update Available', 'Security Alert', 'Scheduled Downtime']
  };
  
  const messages = {
    survey: ['A new survey is ready for your review.', 'Please complete the pending survey.', 'Your input is needed for community health.'],
    feedback: ['You have new feedback to review.', 'Community members have responded.', 'New responses require attention.'],
    immunization: ['New schedule updates are available.', 'Important vaccine information updated.', 'Check the latest immunization guidelines.'],
    system: ['Scheduled maintenance this weekend.', 'System will be updated tonight.', 'Please save your work before maintenance.']
  };

  const notifications: Notification[] = [];
  
  for (let i = 0; i < limit; i++) {
    const notificationIndex = (page - 1) * limit + i + 1;
    const type = types[Math.floor(Math.random() * types.length)];
    const titleOptions = titles[type];
    const messageOptions = messages[type];
    
    const hoursAgo = Math.floor(Math.random() * 168) + 1; // Random hours in past week
    const timeString = hoursAgo < 1 ? 'Just now' : 
                      hoursAgo < 24 ? `${hoursAgo} hours ago` : 
                      `${Math.floor(hoursAgo / 24)} days ago`;
    
    notifications.push({
      id: `notification-${notificationIndex}`,
      type,
      title: titleOptions[Math.floor(Math.random() * titleOptions.length)],
      message: messageOptions[Math.floor(Math.random() * messageOptions.length)],
      time: timeString,
      read: Math.random() > 0.6, // 40% chance of being unread
      link: `/dashboard/${type}/${notificationIndex}`
    });
  }
  
  return notifications;
};

// Initial mock notifications
const initialNotifications = generateMockNotifications(1, 10);

// Notification icon mapping
const notificationIcons = {
    survey: <HiOutlineClipboardList className="w-6 h-6 text-blue-500" />,
    feedback: <HiOutlineChatAlt className="w-6 h-6 text-green-500" />,
    immunization: <HiOutlineShieldCheck className="w-6 h-6 text-purple-500" />,
    system: <HiOutlineClock className="w-6 h-6 text-yellow-500" />
};

export const Route = createFileRoute('/dashboard/notifications/')({
  component: NotificationsPage,
});

function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const observerRef = useRef<HTMLDivElement>(null);

  // Simulate API call to load more notifications
  const loadMoreNotifications = async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const nextPage = page + 1;
    const newNotifications = generateMockNotifications(nextPage, 10);
    
    // Simulate end of data after page 5 (50 total notifications)
    if (nextPage >= 5) {
      setHasMore(false);
    }
    
    setNotifications(prev => [...prev, ...newNotifications]);
    setPage(nextPage);
    setLoading(false);
  };

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMoreNotifications();
        }
      },
      { threshold: 0.1 }
    );

    const currentObserverRef = observerRef.current;
    if (currentObserverRef) {
      observer.observe(currentObserverRef);
    }

    return () => {
      if (currentObserverRef) {
        observer.unobserve(currentObserverRef);
      }
    };
  }, [hasMore, loading, page]);

  const handleNotificationClick = (notification: Notification) => {
    if (isDragging) return;
    
    // Mark as read when clicked
    if (!notification.read) {
      setNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      );
    }
    
    // Navigate to the notification link
    if (notification.link) {
      console.log('Navigate to:', notification.link);
      // In real app, you would use navigation here
      // navigate(notification.link);
    }
  };

  const handleDismiss = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };
  
  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleDragStart = (id: string) => {
    setIsDragging(id);
  };

  const handleDragEnd = (id: string) => {
    setTimeout(() => setIsDragging(null), 100); // Small delay to prevent click after drag
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
      <header className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl font-bold text-title dark:text-white">Notifications</h1>
        <button 
          onClick={handleMarkAllAsRead}
          className="text-sm cursor-pointer underline text-primary font-medium hover:text-primary-dark dark:text-primary-dark dark:hover:text-primary transition-colors"
        >
          Mark all as read
        </button>
      </header>
      
      <div className="space-y-4">
        <AnimatePresence>
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <motion.div
                key={notification.id}
                layout
                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: -300, transition: { duration: 0.3 } }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragStart={() => handleDragStart(notification.id)}
                onDragEnd={(event, info) => {
                  handleDragEnd(notification.id);
                  if (info.offset.x < -100) {
                    handleDismiss(notification.id);
                  }
                }}
                onClick={() => handleNotificationClick(notification)}
                className={`relative rounded-lg shadow-lg overflow-hidden transition-all duration-200 ${
                  isDragging === notification.id 
                    ? 'cursor-grabbing' 
                    : 'cursor-pointer hover:shadow-xl hover:-translate-y-1'
                } ${ 
                  notification.read ? 'bg-white dark:bg-gray-800' : 'bg-blue-50 dark:bg-gray-900/50'
                }`}
              >
                <div className="p-5 flex items-start space-x-4">
                  <div className="flex-shrink-0 pt-1">
                    {notificationIcons[notification.type]}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{notification.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{notification.message}</p>
                    <div className="mt-3 text-xs text-gray-400 dark:text-gray-500 flex items-center">
                      <HiOutlineClock className="w-4 h-4 mr-1.5" />
                      {notification.time}
                    </div>
                  </div>
                </div>
                {!notification.read && (
                  <div className="absolute top-3 right-3 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                )}
                {/* Drag hint */}
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-30 text-gray-500 italic text-xs">
                  ← Swipe to dismiss
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
            >
              <p className="text-lg text-gray-500 dark:text-gray-400">You're all caught up!</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">No new notifications.</p>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Loading indicator and observer target */}
        <div ref={observerRef} className="flex justify-center py-4">
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center space-x-2 text-gray-500 dark:text-gray-400"
            >
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              <span>Loading more notifications...</span>
            </motion.div>
          )}
          {!hasMore && notifications.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-500 dark:text-gray-400"
            >
              <p>You've reached the end of notifications</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}