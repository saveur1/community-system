// Updated main SettingsPage component
import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Breadcrumb from '@/components/ui/breadcrum';
import { FiSettings } from 'react-icons/fi';
import { checkPermissions } from '@/utility/logicFunctions';
import useAuth from '@/hooks/useAuth';
import { AuthenticationTab } from '@/components/features/settings/authentication-tab';
import { RolesTab } from '@/components/features/settings/roles-tab';
import { WebsiteTab } from '@/components/features/settings/website-tab';
import { SystemLogsTab } from '@/components/features/settings/system-log-tab';

export const Route = createFileRoute('/dashboard/settings/')({
  component: SettingsPage,
});

type SettingsTab = 'Authentication' | 'Roles' | 'Website' | 'System Logs';

function SettingsPage() {
  const { user } = useAuth();
  const baseTabs = useMemo(() => ['Authentication'], []);
  const tabs = useMemo(() => {
    const t = [...baseTabs];
    if (checkPermissions(user, 'role:create')) {
      t.unshift('Website');
      t.unshift('Roles');
    }
    if (checkPermissions(user, 'system_log:read')) {
      t.push('System Logs');
    }
    return t as SettingsTab[];
  }, [user, baseTabs]);

  const [activeTab, setActiveTab] = useState<SettingsTab>('Roles');

  useEffect(() => {
    if (!tabs.includes(activeTab)) {
      setActiveTab(tabs[0] as SettingsTab);
    }
  }, [tabs, activeTab]);

  const renderTabContent = () => {
    const tabComponents = {
      'Authentication': <AuthenticationTab />,
      'Roles': <RolesTab />,
      'Website': <WebsiteTab />,
      'System Logs': <SystemLogsTab />,
    };

    return tabComponents[activeTab];
  };

  return (
    <div>
      <Breadcrumb
        title="Settings"
        items={[
          {title:"Dashboard",link: "/dashboard"},
          "Settings"
        ]}
        className="absolute top-0 left-0 w-full bg-white dark:bg-gray-900"
      />
      <div className="pt-20 max-w-8xl mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <FiSettings className="text-white w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-200">System Settings</h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">Manage roles, security, and system configuration</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex px-6">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative py-4 px-6 text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? 'text-primary dark:text-primary-200 border-b-2 border-primary dark:border-primary-200'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeSettingsTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary dark:bg-primary-200"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex">
            <div className="flex-1 p-6">
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