import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Breadcrumb from '@/components/ui/breadcrum';
import { FaUser, FaPencilAlt, FaEdit, FaTrash, FaUserShield, FaUserTimes, FaUserCheck } from 'react-icons/fa';
import { CustomDropdown, DropdownItem } from '@/components/ui/dropdown';
import { UserDetailsTab } from '@/components/features/profile/user-details-tab';
import { SurveysTab } from '@/components/features/profile/surveys-tab';
import { FeedbacksTab } from '@/components/features/profile/feedbacks-tab';
import { ActivitiesTab } from '@/components/features/profile/activities-tab';
import { useUser } from '@/hooks/useUsers';

export const Route = createFileRoute('/dashboard/accounts/$account-id')({
  component: AccountDetailsPage,
});

type AccountTab = 'Details' | 'Surveys' | 'Feedbacks' | 'Activities';

function AccountDetailsPage() {
  const { 'account-id': accountId } = Route.useParams();
  const { data: userData, isLoading } = useUser(accountId);
  const user = userData?.result;
  
  const [activeTab, setActiveTab] = useState<AccountTab>('Details');

  const tabs: AccountTab[] = ['Details', 'Surveys', 'Feedbacks', 'Activities'];

  const renderTabContent = () => {
    const tabComponents = {
      'Details': <UserDetailsTab user={user} />,
      'Surveys': <SurveysTab user={user} />,
      'Feedbacks': <FeedbacksTab user={user} />,
      'Activities': <ActivitiesTab user={user} />,
    };
    return tabComponents[activeTab];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 dark:text-gray-300">Loading account details...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 dark:text-gray-300">Account not found</div>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb
        title="Account Details"
        items={[
          { title: "Dashboard", link: "/dashboard" },
          { title: "Accounts", link: "/dashboard/accounts" },
          user.name
        ]}
        className="absolute top-0 left-0 w-full bg-white dark:bg-gray-900"
      />
      <div className="pt-20 max-w-8xl mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen px-4 sm:px-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {/* Account Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                    {user.profile ? (
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
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-200">{user.name}</h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">{user.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : user.status === 'inactive'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {user.status || 'Unknown'}
                    </span>
                    <span className="px-2 py-1 text-xs rounded-full bg-primary/20 text-primary dark:bg-primary-dark dark:text-white">
                      {user.userType || 'Community'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* User Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                <button className="w-full sm:w-auto px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors flex items-center justify-center gap-2">
                  <FaEdit className="w-4 h-4" />
                  <span>Edit Account</span>
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
                      layoutId="activeAccountTab"
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
            <div className="flex-1 p-4 sm:p-6">
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
