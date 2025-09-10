import { CustomDropdown } from "@/components/ui/dropdown"
import { HiBell, HiOutlineChatAlt, HiOutlineClipboardList, HiOutlineClock, HiOutlineShieldCheck } from "react-icons/hi"

const NotificationsDropdown = () => {
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

    // Mock notifications data
    const mockNotifications: Notification[] = [
        {
            id: '1',
            type: 'survey',
            title: 'New Survey Available',
            message: 'A new survey about immunization services is ready for your review.',
            time: '10 min ago',
            read: false,
            link: '/dashboard/surveys/1'
        },
        {
            id: '2',
            type: 'feedback',
            title: 'Feedback Received',
            message: 'You have received new feedback on your recent community visit.',
            time: '45 min ago',
            read: false,
            link: '/dashboard/feedback/2'
        },
        {
            id: '3',
            type: 'immunization',
            title: 'Immunization Update',
            message: 'New immunization schedule updates are available for your region.',
            time: '2 hours ago',
            read: true,
            link: '/dashboard/immunizations'
        },
        {
            id: '4',
            type: 'system',
            title: 'System Maintenance',
            message: 'Scheduled maintenance this weekend. System will be down for 2 hours.',
            time: '1 day ago',
            read: true,
            link: '/dashboard/settings'
        }
    ];

    // Notification icon mapping
    const notificationIcons = {
        survey: <HiOutlineClipboardList className="w-5 h-5 text-blue-500" />,
        feedback: <HiOutlineChatAlt className="w-5 h-5 text-green-500" />,
        immunization: <HiOutlineShieldCheck className="w-5 h-5 text-purple-500" />,
        system: <HiOutlineClock className="w-5 h-5 text-yellow-500" />
    };

    return (
        <CustomDropdown
            trigger={
                <button
                    className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    type="button"
                    aria-label="Notifications"
                >
                    <HiBell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                        {mockNotifications.filter(n => !n.read).length}
                    </span>
                </button>
            }
            position="bottom-right"
            className="max-sm:hidden"
            dropdownClassName="w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg ring-1 ring-black/10 overflow-hidden"
            closeOnClick={false}
        >
            <div className="py-1">
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Notifications</h3>
                    <button className="text-sm text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300">
                        Mark all as read
                    </button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                    {mockNotifications.length > 0 ? (
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {mockNotifications.map((notification) => (
                                <a
                                    key={notification.id}
                                    href={notification.link}
                                    className={`block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${!notification.read ? 'bg-blue-50 dark:bg-gray-700' : ''}`}
                                >
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 pt-0.5">
                                            {notificationIcons[notification.type]}
                                        </div>
                                        <div className="ml-3 flex-1">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {notification.title}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <div className="mt-1 text-xs text-gray-400 dark:text-gray-500 flex items-center">
                                                <HiOutlineClock className="w-3 h-3 mr-1" />
                                                {notification.time}
                                            </div>
                                        </div>
                                        {!notification.read && (
                                            <span className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-blue-500"></span>
                                        )}
                                    </div>
                                </a>
                            ))}
                        </div>
                    ) : (
                        <div className="px-4 py-6 text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">No new notifications</p>
                        </div>
                    )}
                </div>
                <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 text-center">
                    <a
                        href="/dashboard/notifications"
                        className="text-sm font-medium text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
                    >
                        View all notifications
                    </a>
                </div>
            </div>
        </CustomDropdown>
    )
}

export default NotificationsDropdown;