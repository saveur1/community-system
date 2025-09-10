import { useState } from "react";
import {
    HiMenuAlt3,
    HiSearch,
    HiSun,
    HiMoon,
    HiX,
} from "react-icons/hi";
import { CustomDropdown, DropdownItem } from "@/components/ui/dropdown";
import useAuth from "@/hooks/useAuth";
import { User } from "@/api/auth";
import { spacer } from "@/utility/logicFunctions";
import NotificationsDropdown from "../notifications/notifications-dropdown";
import { useRouter } from "@tanstack/react-router";



// Profile component
type ProfileProps = {
    collapsed: boolean;
    user: User | null;
};

// Helper to get role abbreviation
const getRoleDisplay = (role: string) => {
    if (!role) return "User";
    const words = role.split(" ");
    if (words.length === 1) return words[0]; // Admin -> Admin
    return words.map(w => w.charAt(0).toUpperCase()).join(""); // Secretarial General -> SG
};

const Profile: React.FC<ProfileProps> = ({ collapsed, user }) => {
    if (!user) {
        return (
            <div className="flex items-center min-w-24 min-h-12 gap-2 px-2 py-1 bg-gray-100 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg cursor-pointer transition-colors animate-pulse">
            </div>
        );
    }
    const displayName = user?.name?.split(" ").length === 1
        ? user.name
        : (user?.name?.split(" ")?.[0]?.charAt(0) || 'U') + "." + (user?.name?.split(" ")?.[1] || '');

    const role = user?.roles?.[0]?.name || "User";
    const fullRole = spacer(role);       // e.g. "Generation Population"
    const shortRole = getRoleDisplay(fullRole); // e.g. "GP"
    return (
        <div className="flex items-center min-w-24 gap-2 px-2 py-1 bg-gray-100 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg cursor-pointer transition-colors">
            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-sm font-medium text-gray-700 dark:text-gray-200">
                {user?.name?.charAt(0) || 'U'}
            </div>
            {!collapsed && (
                <div className="flex items-center gap-1">
                    <div className="text-left">
                        <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">{displayName}</span>
                        {/* Role: full text on larger screens, acronym on small screens */}
                        <span
                            className="text-xs text-gray-500 dark:text-gray-400 block truncate capitalize"
                            title={role}
                        >
                            <span className="hidden sm:inline">{fullRole}</span>
                            <span className="sm:hidden">{shortRole}</span>
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
    const router = useRouter();

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
                <NotificationsDropdown />

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
                        <DropdownItem onClick={() => router.navigate({ to: "/dashboard/settings" })}>Settings</DropdownItem>
                        <DropdownItem onClick={() => router.navigate({ to: "/dashboard/notifications" })}>Notifications</DropdownItem>
                        <DropdownItem onClick={() => console.log('Help & Support')}>Help & Support</DropdownItem>
                        <div className="my-1 h-px bg-gray-200 dark:bg-gray-700" />
                        <DropdownItem destructive onClick={() => logout()}>Logout</DropdownItem>
                    </div>
                </CustomDropdown>
            </div>

            {/* Search popup for mobile */}
            {searchOpen && (
                <div className="fixed inset-0 z-30 bg-black/40 flex items-center justify-center p-4">
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