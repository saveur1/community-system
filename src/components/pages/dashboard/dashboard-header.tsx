import { HiBell, HiMenuAlt3, HiMoon, HiSearch, HiSun, HiX } from "react-icons/hi";
import Profile from "./header-profile";
import { useState } from "react";
import { CustomDropdown, DropdownItem } from "@/components/ui/dropdown";

interface HeaderProps {
    setMobileMenuOpen: (open: boolean) => void;
    toggleDarkMode?: () => void,
    isDarkMode: boolean
}

const Header = ({
    setMobileMenuOpen,
    toggleDarkMode,
    isDarkMode = false,
}: HeaderProps) => {
    const [searchOpen, setSearchOpen] = useState(false);

    const user = {
        firstName: "John",
        lastName: "Doe",
        email: "John.Doe@example.com",
        avatarUrl: "/images/avatar.svg",
    };

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
                {/* Notifications */}
                <button
                    className="relative py-3 px-3 cursor-pointer  bg-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    type="button"
                    aria-label="Notifications"
                >
                    <HiBell
                        className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                        5
                    </span>
                </button>

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
                        <DropdownItem destructive onClick={() => console.log('Logout')}>Logout</DropdownItem>
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