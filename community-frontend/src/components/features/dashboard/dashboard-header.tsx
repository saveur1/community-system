import { useState } from "react";
import {
    HiMenuAlt3,
    HiSearch,
    HiSun,
    HiMoon,
    HiX,
    HiDesktopComputer,
    HiCheck,
} from "react-icons/hi";
import { CustomDropdown, DropdownItem } from "@/components/ui/dropdown";
import useAuth from "@/hooks/useAuth";
import type { User } from "@/api/auth";
import { spacer } from "@/utility/logicFunctions";
import NotificationsDropdown from "../notifications/notifications-dropdown";
import { useRouter } from "@tanstack/react-router";
import { useTheme, type ThemeMode } from "@/providers/theme-provider";

// Helper to get role abbreviation
const getRoleDisplay = (role: string) => {
    if (!role) return "User";
    const words = role.split(" ");
    if (words.length === 1) return words[0];
    return words.map(w => w.charAt(0).toUpperCase()).join("");
};

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

// ThemeSelector Component
const ThemeSelector: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const themeOptions = [
    {
      mode: 'system' as ThemeMode,
      label: 'System',
      icon: <HiDesktopComputer className="w-4 h-4" />,
      description: 'Use system preference',
    },
    {
      mode: 'light' as ThemeMode,
      label: 'Light',
      icon: <HiSun className="w-4 h-4" />,
      description: 'Light theme',
    },
    {
      mode: 'dark' as ThemeMode,
      label: 'Dark',
      icon: <HiMoon className="w-4 h-4" />,
      description: 'Dark theme',
    },
  ];

  const getCurrentThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <HiSun className="w-5 h-5 text-gray-600 dark:text-gray-200" />;
      case 'dark':
        return <HiMoon className="w-5 h-5 text-gray-600 dark:text-gray-200" />;
      default:
        return (
          <HiDesktopComputer className="w-5 h-5 text-gray-600 dark:text-gray-200" />
        );
    }
  };

  return (
    <CustomDropdown
      trigger={
        <button
          className="p-3 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
          type="button"
          aria-label="Change theme"
        >
          {getCurrentThemeIcon()}
        </button>
      }
      position="bottom-right"
      dropdownClassName="w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg ring-1 ring-black/10 dark:ring-gray-500/40 overflow-hidden"
      closeOnClick={true}
    >
      <div className="py-1">
        <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-600">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            Theme
          </h3>
        </div>
        {themeOptions.map((option) => (
          <button
            key={option.mode}
            onClick={() => toggleTheme(option.mode)}
            className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/70 transition-colors flex items-center justify-between"
          >
            <div className="flex items-center">
              <span className="text-gray-500 dark:text-gray-400 mr-3">
                {option.icon}
              </span>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {option.label}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {option.description}
                </p>
              </div>
            </div>
            {theme === option.mode && (
              <HiCheck className="w-4 h-4 text-primary-600 dark:text-white" />
            )}
          </button>
        ))}
      </div>
    </CustomDropdown>
  );
};

// ProfileDropdown Component
interface ProfileDropdownProps {
    user: User | null;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ user }) => {
    const router = useRouter();
    const { logout } = useAuth();

    const displayName = user?.name?.split(" ").length === 1
        ? user.name
        : (user?.name?.split(" ")?.[0]?.charAt(0) || 'U') + "." + (user?.name?.split(" ")?.[1] || '');
    const role = user?.roles?.[0]?.name || "User";
    const fullRole = spacer(role);
    const shortRole = getRoleDisplay(fullRole);

    const Profile: React.FC<{ collapsed: boolean; user: User | null }> = ({ collapsed, user }) => {
        if (!user) {
            return (
                <div className="flex items-center min-w-24 min-h-12 gap-2 px-2 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg cursor-pointer transition-colors animate-pulse">
                </div>
            );
        }
        return (
            <div className="flex items-center min-w-24 gap-2 px-2 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg cursor-pointer transition-colors">
                <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-sm font-medium text-gray-700 dark:text-gray-200">
                    {user?.name?.charAt(0) || 'U'}
                </div>
                {!collapsed && (
                    <div className="flex items-center gap-1">
                        <div className="text-left">
                            <span className="font-medium text-gray-900 dark:text-white text-sm">{displayName}</span>
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

    return (
        <CustomDropdown
            trigger={<Profile collapsed={false} user={user} />}
            position="bottom-right"
            dropdownClassName="min-w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg ring-1 ring-black/10 dark:ring-gray-500/40 overflow-hidden"
            className=""
        >
            <div className="py-1">
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user?.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user?.email || 'user@example.com'}
                    </p>
                </div>
                <div className="py-1">
                    <DropdownItem onClick={() => console.log('Profile')}>
                        Profile
                    </DropdownItem>
                    <DropdownItem onClick={() => router.navigate({ to: "/dashboard/settings" })}>
                        Settings
                    </DropdownItem>
                    <DropdownItem onClick={() => router.navigate({ to: "/dashboard/notifications" })}>
                        Notifications
                    </DropdownItem>
                    <DropdownItem onClick={() => console.log('Help & Support')}>
                        Help & Support
                    </DropdownItem>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-600 py-1">
                    <DropdownItem destructive onClick={() => logout()}>
                        Logout
                    </DropdownItem>
                </div>
            </div>
        </CustomDropdown>
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