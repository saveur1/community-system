import type { User } from "@/api/auth";
import { CustomDropdown, DropdownItem } from "@/components/ui/dropdown";
import useAuth from "@/hooks/useAuth";
import { spacer } from "@/utility/logicFunctions";
import { useRouter } from "@tanstack/react-router";

// ProfileDropdown Component
interface ProfileDropdownProps {
    user: User | null;
}

// Helper to get role abbreviation
const getRoleDisplay = (role: string) => {
    if (!role) return "User";
    const words = role.split(" ");
    if (words.length === 1) return words[0];
    return words.map(w => w.charAt(0).toUpperCase()).join("");
};

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
                    <DropdownItem onClick={() => router.navigate({ to: "/dashboard/profile" })}>
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

export default ProfileDropdown;