import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineChatAlt,
  HiOutlineClipboardList,
  HiOutlineClock,
  HiOutlineUsers,
  HiOutlineTrash,
} from 'react-icons/hi';
import { 
  useInfiniteNotifications, 
  useLoadMoreNotifications, 
  useUpdateNotification, 
  useMarkAllAsRead,
  useDeleteNotification 
} from '@/hooks/useNotifications';
import { useNavigate } from '@tanstack/react-router';

// Notification types
type NotificationType = 'survey' | 'feedback' | 'community_session' | 'system';

// Notification interface matching backend
interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  icon?: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

// Notification icon mapping
const notificationIcons = {
    survey: <HiOutlineClipboardList className="w-6 h-6 text-blue-500" />,
    feedback: <HiOutlineChatAlt className="w-6 h-6 text-green-500" />,
    community_session: <HiOutlineUsers className="w-6 h-6 text-purple-500" />,
    system: <HiOutlineClock className="w-6 h-6 text-yellow-500" />
};

// Format time helper
const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  return `${Math.floor(diffInHours / 24)} days ago`;
};

export const Route = createFileRoute('/dashboard/notifications/')({
  component: NotificationsPage,
});

function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | NotificationType>('all');
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const observerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // API hooks
  const { data: notificationsData, isLoading: isLoadingNotifications } = useInfiniteNotifications({
    limit: 20,
    type: filter === 'all' ? undefined : filter
  });
  
  const { mutate: loadMore, isPending: isLoadingMore } = useLoadMoreNotifications();
  const { mutate: updateNotification } = useUpdateNotification();
  const { mutate: markAllRead, isPending: isMarkingAllRead } = useMarkAllAsRead();
  const { mutate: deleteNotification } = useDeleteNotification();

  // Extract notifications from paginated data
  console.log(notificationsData);
  const allNotifications: NotificationItem[] = notificationsData?.pages?.flatMap(page => page.result || []) || [];
  const hasMore = notificationsData?.pages?.[notificationsData.pages.length - 1]?.hasMore || false;
  const currentPage = notificationsData?.pageParams?.length || 0;

  // Load more notifications
  const loadMoreNotifications = () => {
    if (isLoadingMore || !hasMore) return;
    
    loadMore({
      filters: { 
        limit: 20,
        type: filter === 'all' ? undefined : filter
      },
      nextPage: currentPage + 1
    });
  };

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMoreNotifications();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore]);

  // Handle notification click
  const handleNotificationClick = (notification: NotificationItem) => {
    // Mark as read if unread
    if (!notification.isRead) {
      updateNotification({
        notificationId: notification.id,
        data: { isRead: true }
      });
    }
    
    // Navigate to link if available
    if (notification.link) {
      navigate({ to: notification.link });
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = () => {
    markAllRead();
  };

  // Delete notification
  const handleDeleteNotification = (notificationId: string) => {
    deleteNotification(notificationId);
  };

  // Handle drag start
  const handleDragStart = (id: string) => {
    setIsDragging(id);
  };

  const handleDragEnd = () => {
    setTimeout(() => setIsDragging(null), 100); // Small delay to prevent click after drag
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
      <header className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl font-bold text-title dark:text-white">Notifications</h1>
        <div className="flex items-center gap-4">
          {/* Filter buttons */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | NotificationType)}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">All</option>
            <option value="survey">Surveys</option>
            <option value="feedback">Feedback</option>
            <option value="community_session">Sessions</option>
            <option value="system">System</option>
          </select>
          
          <button 
            onClick={handleMarkAllAsRead}
            disabled={isMarkingAllRead}
            className="text-sm cursor-pointer underline text-primary font-medium hover:text-primary-dark dark:text-primary-dark dark:hover:text-primary transition-colors disabled:opacity-50"
          >
            {isMarkingAllRead ? 'Marking...' : 'Mark all as read'}
          </button>
        </div>
      </header>
      
      <div className="space-y-4">
        {isLoadingNotifications ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <AnimatePresence>
            {allNotifications.length > 0 ? (
              allNotifications.map((notification) => (
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
                    handleDragEnd();
                    if (info.offset.x < -100) {
                      handleDeleteNotification(notification.id);
                    }
                  }}
                  onClick={() => handleNotificationClick(notification)}
                  className={`relative rounded-lg shadow-lg overflow-hidden transition-all duration-200 ${
                    isDragging === notification.id 
                      ? 'cursor-grabbing' 
                      : 'cursor-pointer hover:shadow-xl hover:-translate-y-1'
                  } ${ 
                    notification.isRead ? 'bg-white dark:bg-gray-800' : 'bg-blue-50 dark:bg-gray-900/50'
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
                        {formatTime(notification.createdAt)}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNotification(notification.id);
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete notification"
                      >
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {!notification.isRead && (
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
        )}
        
        {/* Loading indicator and observer target */}
        <div ref={observerRef} className="flex justify-center py-4">
          {isLoadingMore && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center space-x-2 text-gray-500 dark:text-gray-400"
            >
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              <span>Loading more notifications...</span>
            </motion.div>
          )}
          {!hasMore && allNotifications.length > 0 && (
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