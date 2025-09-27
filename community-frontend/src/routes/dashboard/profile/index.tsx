import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Breadcrumb from '@/components/ui/breadcrum';
import { FaUser, FaPencilAlt, FaEdit, FaTrash, FaUserShield, FaUserTimes, FaUserCheck } from 'react-icons/fa';
import { CustomDropdown, DropdownItem } from '@/components/ui/dropdown';
import useAuth from '@/hooks/useAuth';
import { UserDetailsTab } from '@/components/features/profile/user-details-tab';
import { SurveysTab } from '@/components/features/profile/surveys-tab';
import { FeedbacksTab } from '@/components/features/profile/feedbacks-tab';
import { ActivitiesTab } from '@/components/features/profile/activities-tab';

export const Route = createFileRoute('/dashboard/profile/')({
  component: ProfilePage,
});

type ProfileTab = 'Details' | 'Surveys' | 'Feedbacks' | 'Activities';

function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>('Details');

  const tabs: ProfileTab[] = ['Details', 'Surveys', 'Feedbacks', 'Activities'];

  const renderTabContent = () => {
    const tabComponents = {
      'Details': <UserDetailsTab user={user} />,
      'Surveys': <SurveysTab />,
      'Feedbacks': <FeedbacksTab />,
      'Activities': <ActivitiesTab />,
    };
    return tabComponents[activeTab];
  };

  return (
    <div>
      <Breadcrumb
        title="Profile"
        items={[
          {title:"Dashboard",link: "/dashboard"},
          "Profile"
        ]}
        className="absolute top-0 left-0 w-full bg-white dark:bg-gray-900"
      />
      <div className="pt-20 max-w-8xl mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen px-4 sm:px-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {/* Profile Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                    {user?.profile ? (
                      <img src={user.profile} alt="Profile" className="w-16 h-16 rounded-full object-cover" />
                    ) : (
                      <FaUser className="text-white w-8 h-8" />
                    )}
                  </div>
                  <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-600 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors">
                    <FaPencilAlt className="text-white w-3 h-3" />
                  </button>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-200">{user?.name || 'User Profile'}</h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">{user?.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user?.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {user?.status || 'Unknown'}
                    </span>
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {user?.userType || 'Community'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* User Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                <button className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2">
                  <FaEdit className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
                
                <CustomDropdown
                  trigger={
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors self-end sm:self-auto">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                  }
                  position="bottom-right"
                  dropdownClassName="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[180px]"
                >
                  <DropdownItem icon={<FaUserCheck />}>Grant Access</DropdownItem>
                  <DropdownItem icon={<FaUserTimes />}>Deny Access</DropdownItem>
                  <DropdownItem icon={<FaUserShield />}>Change Role</DropdownItem>
                  <DropdownItem icon={<FaTrash />} destructive>Delete User</DropdownItem>
                </CustomDropdown>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex px-4 sm:px-6 overflow-x-auto whitespace-nowrap">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative py-3 sm:py-4 px-4 sm:px-6 text-sm font-medium transition-colors flex-shrink-0 ${
                    activeTab === tab
                      ? 'text-primary dark:text-primary-200 border-b-2 border-primary dark:border-primary-200'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeProfileTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary dark:bg-primary-200"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="flex">
            <div className="flex-1 p-6 sm:p-6 p-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderTabContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
