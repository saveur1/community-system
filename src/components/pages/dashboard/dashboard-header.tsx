import { useState } from "react";
import {
    HiMenuAlt3,
    HiBell,
    HiSearch,
    HiSun,
    HiMoon,
    HiX,
    HiOutlineChatAlt,
    HiOutlineClipboardList,
    HiOutlineShieldCheck,
    HiOutlineClock
} from "react-icons/hi";
import { CustomDropdown, DropdownItem } from "@/components/ui/dropdown";
import useAuth from "@/hooks/useAuth";
import { User } from "@/api/auth";
import { spacer } from "@/utility/logicFunctions";

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

// Profile component
type ProfileProps = {
    collapsed: boolean;
    user: User | null;
};

const Profile: React.FC<ProfileProps> = ({ collapsed, user }) => {
    if (!user) {
        return (
            <div className="flex items-center min-w-24 min-h-12 gap-2 px-2 py-1 bg-gray-100 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg cursor-pointer transition-colors animate-pulse">
            </div>
        );
    }
    const displayName = user?.name?.split(" ")?.[0]?.charAt(0) + "." + user?.name?.split(" ")?.[1];

    return (
        <div className="flex items-center min-w-24 gap-2 px-2 py-1 bg-gray-100 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg cursor-pointer transition-colors">
            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-sm font-medium text-gray-700 dark:text-gray-200">
                {user?.name?.charAt(0) || 'U'}
            </div>
            {!collapsed && (
                <div className="flex items-center gap-1">
                    <div className="text-left">
                        <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">{displayName}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 block truncate capitalize" title={user?.email}>
                            {spacer(user?.roles?.[0]?.name || 'User')}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

interface HeaderProps {
    setMobileMenuOpen: (open: boolean) => void;
    toggleDarkMode?: () => void,
    isDarkMode: boolean
}

const Header: React.FC<HeaderProps> = ({
    setMobileMenuOpen,
    toggleDarkMode,
    isDarkMode = false,
}) => {
    const [searchOpen, setSearchOpen] = useState(false);

    // Use the useAuth hook which will handle user data fetching if needed
    const { user, logout } = useAuth();

    return (
        <header className="flex bg-white dark:bg-gray-800 border-b border-gray-200 items-center w-full justify-between px-6 py-4">
            <div className="flex items-center gap-4 w-1/3">

                {/* Mobile menu button */}
                <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="lg:hidden p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    type="button"
                    aria-label="Open menu"
                >
                    <HiMenuAlt3 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>

                {/* Search input for medium+ screens */}
                <div className="relative hidden sm:block w-full">
                    <input
                        type="text"
                        placeholder="Search surveys..."
                        className="pl-10 pr-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:border-transparent focus:ring-primary min-w-64 w-full"
                    />
                    <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                </div>

                {/* Search icon for small screens */}
                <button
                    onClick={() => setSearchOpen(true)}
                    className="sm:hidden px-3 bg-gray-100 py-3 mr-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    type="button"
                    aria-label="Search"
                >
                    <HiSearch className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
            </div>

            <div className="flex items-center gap-3">
                {/* Notifications Dropdown */}
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

                {/* Theme Toggle */}
                <button
                    onClick={toggleDarkMode}
                    className="py-3 px-3 cursor-pointer rounded-lg bg-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    type="button"
                    aria-label="Toggle theme"
                >
                    {isDarkMode ? (
                        <HiSun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    ) : (
                        <HiMoon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    )}
                </button>

                {/* Right Profile with dropdown */}
                <CustomDropdown
                    trigger={<Profile collapsed={false} user={user} />}
                    position="bottom-right"
                    dropdownClassName="min-w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg overflow-hidden"
                    className=""
                >
                    <div className="py-2">
                        <DropdownItem onClick={() => console.log('Profile')}>Profile</DropdownItem>
                        <DropdownItem onClick={() => console.log('Settings')}>Settings</DropdownItem>
                        <DropdownItem onClick={() => console.log('Notifications')}>Notifications</DropdownItem>
                        <DropdownItem onClick={() => console.log('Help & Support')}>Help & Support</DropdownItem>
                        <div className="my-1 h-px bg-gray-200 dark:bg-gray-700" />
                        <DropdownItem destructive onClick={() => logout()}>Logout</DropdownItem>
                    </div>
                </CustomDropdown>
            </div>

            {/* Search popup for mobile */}
            {searchOpen && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 pt-10 w-full max-w-sm relative">
                        <button
                            onClick={() => setSearchOpen(false)}
                            className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                            aria-label="Close search"
                        >
                            <HiX className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </button>
                        <input
                            type="text"
                            placeholder="Search surveys..."
                            autoFocus
                            className="w-full pl-3 pr-4 py-2 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:border-transparent focus:ring-primary"
                        />
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;