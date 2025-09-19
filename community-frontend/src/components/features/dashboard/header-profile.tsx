import type { User } from '@/api/auth';
import { FiChevronDown } from 'react-icons/fi';

interface ProfileProps {
    collapsed: boolean;
    user: User | null;
  }
  
// Profile Component
const Profile: React.FC<ProfileProps> = ({ collapsed, user }) => {
  const displayName = user?.name?.split(" ")?.[0]?.charAt(0) + "." + user?.name?.split(" ")?.[1];
  return (
    <div
      className={`flex items-center gap-2 px-2 py-1 bg-gray-100 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors ${
        collapsed ? "justify-center" : ""
      }`}
    >
      <img
        src={user?.profile || "/images/avatar.svg"}
        alt={`${user?.name}`}
        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
      />
      {!collapsed && (
        <>
          <div className="flex flex-col overflow-hidden flex-grow">
            <span className="font-medium text-gray-900 truncate text-sm">{displayName}</span>
            <span
              className="text-xs text-gray-500 truncate"
              title={user?.email}
            >
              {user?.roles[0].name}
            </span>
          </div>
          <FiChevronDown className="text-gray-500 flex-shrink-0" />
        </>
      )}
    </div>
  );
};

export default Profile;