import { CustomDropdown } from "@/components/ui/dropdown";
import {
    HiOutlineChatAlt,
    HiOutlineClipboardList,
    HiOutlineClock,
    HiOutlineUsers,
} from "react-icons/hi";
import {
    useRecentNotifications,
    useUnreadCount,
    useUpdateNotification,
    useMarkAllAsRead,
} from "@/hooks/useNotifications";
import { useNavigate } from "@tanstack/react-router";
import { FaBell } from "react-icons/fa";

const NotificationsDropdown = () => {
    const navigate = useNavigate();

    const { data: notificationsData, isLoading: notificationsLoading } =
        useRecentNotifications(5);
    const { data: unreadCountData } = useUnreadCount();
    const updateNotification = useUpdateNotification();
    const markAllAsReadMutation = useMarkAllAsRead();

    const notifications = notificationsData?.data?.result || [];
    const unreadCount = unreadCountData?.data?.result?.count || 0;

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor(
            (now.getTime() - date.getTime()) / (1000 * 60)
        );

        if (diffInMinutes < 1) return "Just now";
        if (diffInMinutes < 60) return `${diffInMinutes} min ago`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24)
            return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;

        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
    };

    const handleNotificationClick = async (notification: any) => {
        if (!notification.isRead) {
            updateNotification.mutate({
                notificationId: notification.id,
                data: { isRead: true },
            });
        }
        if (notification.link) {
            navigate({ to: notification.link });
        }
    };

    const handleMarkAllAsRead = () => {
        markAllAsReadMutation.mutate();
    };

    const notificationIcons = {
        survey: <HiOutlineClipboardList className="w-5 h-5 text-blue-500" />,
        feedback: <HiOutlineChatAlt className="w-5 h-5 text-green-500" />,
        community_session: <HiOutlineUsers className="w-5 h-5 text-purple-500" />,
        system: <HiOutlineClock className="w-5 h-5 text-yellow-500" />,
    };

    return (
        <CustomDropdown
            trigger={
                <button
                    className="relative p-3 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                    type="button"
                    aria-label="Notifications"
                >
                    <FaBell className="w-5 h-5 text-gray-600 dark:text-gray-200" />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                    )}
                </button>
            }
            position="bottom-right"
            className="max-sm:hidden"
            dropdownClassName="w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg ring-1 dark:ring-gray-500/40 ring-black/10 overflow-hidden"
            closeOnClick={false}
        >
            <div className="py-1">
                {/* Header */}
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Notifications
                    </h3>
                    <button
                        onClick={handleMarkAllAsRead}
                        disabled={markAllAsReadMutation.isPending || unreadCount === 0}
                        className="text-sm text-primary-600 hover:text-primary-800 dark:text-gray-300 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {markAllAsReadMutation.isPending
                            ? "Marking..."
                            : "Mark all as read"}
                    </button>
                </div>

                {/* Notifications list */}
                <div className="max-h-96 overflow-y-auto">
                    {notificationsLoading ? (
                        <div className="px-4 py-6 text-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                Loading notifications...
                            </p>
                        </div>
                    ) : notifications.length > 0 ? (
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {notifications.map((notification: any) => (
                                <button
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`w-full text-left px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/70 ${!notification.isRead
                                            ? "bg-blue-50 dark:bg-gray-700/80"
                                            : ""
                                        }`}
                                >
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 pt-0.5">
                                            {notificationIcons[
                                                notification.type as keyof typeof notificationIcons
                                            ] || notificationIcons.system}
                                        </div>
                                        <div className="ml-3 flex-1">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {notification.title}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-300 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <div className="mt-1 text-xs text-gray-400 dark:text-gray-500 flex items-center">
                                                <HiOutlineClock className="w-3 h-3 mr-1" />
                                                {formatTime(notification.createdAt)}
                                            </div>
                                        </div>
                                        {!notification.isRead && (
                                            <span className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-blue-500"></span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="px-4 py-6 text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                No new notifications
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-600 text-center">
                    <button
                        onClick={() => navigate({ to: "/dashboard/notifications" })}
                        className="text-sm font-medium text-primary-600 hover:text-primary-800 hover:underline dark:text-primary-400 dark:hover:text-primary-300 disabled:hover:no-underline disabled:text-gray-400 disabled:cursor-not-allowed"
                        disabled={notificationsLoading || notifications.length === 0}
                    >
                        View all notifications
                    </button>
                </div>
            </div>
        </CustomDropdown>
    );
};

export default NotificationsDropdown;
