import { FiChevronDown } from 'react-icons/fi';

interface ProfileProps {
    collapsed: boolean;
    user: {
      firstName: string;
      lastName: string;
      email: string;
      avatarUrl: string;
    };
  }
  
// Profile Component
const Profile: React.FC<ProfileProps> = ({ collapsed, user }) => {
  const displayName = `${user.firstName.charAt(0)}.${user.lastName}`;
  return (
    <div
      className={`flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors ${
        collapsed ? "justify-center" : ""
      }`}
    >
      <img
        src={user.avatarUrl}
        alt={`${user.firstName} ${user.lastName}`}
        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
      />
      {!collapsed && (
        <>
          <div className="flex flex-col overflow-hidden flex-grow">
            <span className="font-medium text-gray-900 truncate text-sm">{displayName}</span>
            <span
              className="text-xs text-gray-500 truncate"
              title={user.email}
            >
              Community
            </span>
          </div>
          <FiChevronDown className="text-gray-500 flex-shrink-0" />
        </>
      )}
    </div>
  );
};

export default Profile;