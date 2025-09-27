import { useState } from "react";
import {
    HiMenuAlt3,
    HiSearch,
    HiX,
} from "react-icons/hi";
import useAuth from "@/hooks/useAuth";
import NotificationsDropdown from "../notifications/notifications-dropdown";
import ThemeSelector from "./theme-selector";
import ProfileDropdown from "./profile-dropdown";

// MobileMenuButton Component
interface MobileMenuButtonProps {
    setMobileMenuOpen: (open: boolean) => void;
}

const MobileMenuButton: React.FC<MobileMenuButtonProps> = ({ setMobileMenuOpen }) => {
    return (
        <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            type="button"
            aria-label="Open menu"
        >
            <HiMenuAlt3 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
    );
};

// SearchBar Component
interface SearchBarProps {
    searchOpen: boolean;
    setSearchOpen: (open: boolean) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchOpen, setSearchOpen }) => {
    return (
        <>
            <div className="relative hidden sm:block w-full">
                <input
                    type="text"
                    placeholder="Search surveys..."
                    className="pl-10 pr-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:border-transparent focus:ring-primary-600 dark:focus:ring-primary-400 min-w-64 w-full placeholder:text-gray-500 dark:placeholder:text-gray-400"
                />
                <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400" />
            </div>
            <button
                onClick={() => setSearchOpen(true)}
                className="sm:hidden px-3 bg-gray-100 dark:bg-gray-700 py-3 mr-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                type="button"
                aria-label="Search"
            >
                <HiSearch className="w-5 h-5 text-gray-600 dark:text-gray-200" />
            </button>
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
                            className="w-full pl-3 pr-4 py-2 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:border-transparent focus:ring-primary-600 dark:focus:ring-primary-400 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                        />
                    </div>
                </div>
            )}
        </>
    );
};

// Main Header Component
interface HeaderProps {
    setMobileMenuOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({
    setMobileMenuOpen,
}) => {
    const [searchOpen, setSearchOpen] = useState(false);
    const { user } = useAuth();

    return (
        <header className="flex bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600 items-center w-full justify-between px-6 py-4">
            <div className="flex items-center gap-4 w-1/3">
                <MobileMenuButton setMobileMenuOpen={setMobileMenuOpen} />
                <SearchBar searchOpen={searchOpen} setSearchOpen={setSearchOpen} />
            </div>
            <div className="flex items-center gap-3">
                <NotificationsDropdown />
                <ThemeSelector />
                <ProfileDropdown user={user} />
            </div>
        </header>
    );
};

export default Header;