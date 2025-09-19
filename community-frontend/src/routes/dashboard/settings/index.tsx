import { createFileRoute, Link } from '@tanstack/react-router';
import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Breadcrumb from '@/components/ui/breadcrum';
import Modal, { ModalBody, ModalFooter, ModalButton } from '@/components/ui/modal';
import { useRolesList, useDeleteRole } from '@/hooks/useRoles';
import { 
  FiSettings, 
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiSearch,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import { checkPermissions, spacer } from '@/utility/logicFunctions';
import useAuth from '@/hooks/useAuth';
// system logs hook
import { useSystemLogsList, useDeleteSystemLog } from '@/hooks/useSystemLogs';

export const Route = createFileRoute('/dashboard/settings/')({
  component: SettingsPage,
});

type SettingsTab = 'Authentication' | 'Roles' | 'Website' | 'Notifications' | 'System Logs';

function SettingsPage() {
  const { user } = useAuth();
  const baseTabs = useMemo(() => ['Authentication', 'Notifications'], []);
  const tabs = useMemo(() => {
    const t = [...baseTabs];
    if (checkPermissions(user, 'role:create')) {
      t.unshift('Website');
      t.unshift('Roles');
    }
    // show system logs tab if user can read logs
    if (checkPermissions(user, 'system_log:read')) {
      // place before Notifications
      const idx = t.indexOf('Notifications');
      if (idx >= 0) t.splice(idx, 0, 'System Logs');
      else t.push('System Logs');
    }
    return t as SettingsTab[];
  }, [user, baseTabs]);


  
  const [activeTab, setActiveTab] = useState<SettingsTab>('Roles');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; roleId: string; roleName: string }>({ 
    isOpen: false, 
    roleId: '', 
    roleName: '' 
  });
  // System logs state
  const [logsSearch, setLogsSearch] = useState('');
  const [logsPage, setLogsPage] = useState(1);
  const [logsPageSize] = useState(10);
  const { data: logsResponse, isLoading: logsLoading } = useSystemLogsList({
    page: logsPage,
    limit: logsPageSize,
    action: logsSearch || undefined,
  });
  const deleteLog = useDeleteSystemLog();

  // Ensure active tab is valid based on permissions
  useEffect(() => {
    if (!tabs.includes(activeTab)) {
      setActiveTab(tabs[0] as SettingsTab);
    }
  }, [tabs, activeTab]);

  // Fetch roles with search and pagination
  const { data: rolesResponse, isLoading: rolesLoading, error: rolesError } = useRolesList({
    page: currentPage,
    limit: pageSize,
    search: searchTerm || undefined
  });

  const deleteRole = useDeleteRole();

  const roles = rolesResponse?.result || [];
  const totalRoles = rolesResponse?.total || 0;
  const totalPages = rolesResponse?.totalPages || 1;

  const handleDeleteRole = (roleId: string, roleName: string) => {
    setDeleteModal({ isOpen: true, roleId, roleName });
  };

  const confirmDeleteRole = async () => {
    try {
      await deleteRole.mutateAsync(deleteModal.roleId);
      setDeleteModal({ isOpen: false, roleId: '', roleName: '' });
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const cancelDeleteRole = () => {
    setDeleteModal({ isOpen: false, roleId: '', roleName: '' });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };
  // logs search handler
  const handleLogsSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogsSearch(e.target.value);
    setLogsPage(1);
  };

  const renderRolesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Role Management</h3>
        <div className="flex items-center gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search roles..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Link to="/dashboard/settings/add-role" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2">
            <FiPlus className="w-4 h-4" />
            Add Role
          </Link>
        </div>
      </div>

      {rolesError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          Error loading roles: {rolesError.message}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Role Name</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Description</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Permissions</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rolesLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    Loading roles...
                  </td>
                </tr>
              ) : roles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    {searchTerm ? `No roles found matching "${searchTerm}"` : 'No roles found'}
                  </td>
                </tr>
              ) : (
                roles.map((role) => (
                  <tr key={role.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6 font-medium text-gray-900 capitalize">{spacer(role.name)}</td>
                    <td className="py-4 px-6 text-gray-500">{role.description || 'No description'}</td>
          
                    <td className="py-4 px-6 text-gray-500">
                      {role.permissions?.length || 0} permissions
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <Link 
                          to="/dashboard/settings/edit-role/$roleId"
                          params={{ roleId: role.id }}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                          title="Edit role"
                        >
                          <FiEdit3 className="w-4 h-4 text-gray-500" />
                        </Link>
                        <button 
                          className="p-2 hover:bg-gray-100 rounded-lg"
                          title="Delete role"
                          onClick={() => handleDeleteRole(role.id, role.name)}
                          disabled={deleteRole.isPending}
                        >
                          <FiTrash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t border-gray-200">
            <span className="text-sm text-gray-500">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalRoles)} of {totalRoles} roles
            </span>
            <div className="flex items-center space-x-2">
              <button 
                className="p-2 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <FiChevronLeft className="w-4 h-4 text-gray-500" />
              </button>
              
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                if (pageNum > totalPages) return null;
                
                return (
                  <button
                    key={pageNum}
                    className={`px-3 py-1 rounded ${
                      currentPage === pageNum 
                        ? 'bg-primary text-white' 
                        : 'hover:bg-gray-200 text-gray-700'
                    }`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button 
                className="p-2 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                <FiChevronRight className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderAuthenticationTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Authentication Settings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border p-6 border-gray-200 rounded-lg bg-white">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900">SMS Authentication</h4>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          <p className="text-sm text-gray-600">Send verification codes via SMS</p>
        </div>

        <div className="p-6 border border-gray-200 rounded-lg bg-white">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900">Email Authentication</h4>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          <p className="text-sm text-gray-600">Send verification codes via email</p>
        </div>
      </div>

      <div className="mt-8 p-6 border border-gray-200 rounded-lg bg-white">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Change Password</h3>
        <form className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter current password"
              required
            />
          </div>
          
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter new password"
              required
            />
          </div>
          
          <div>
            <button
              type="submit"
              className="w-full md:w-auto px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderWebsiteTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Website Content Management</h3>
      
      <div className="space-y-6">
        <div className="p-6 border border-gray-200 rounded-lg bg-white">
          <h4 className="font-semibold text-gray-900 mb-4">Hero Section Slideshow</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {[
              { url: "/images/gathering.jpg", alt: "Community health workers" },
              { url: "/images/malaria.jpg", alt: "Interfaith dialogue" },
              { url: "/images/child.jpg", alt: "Community listening" },
              { url: "/images/counciljpg.jpg", alt: "Religious leaders" }
            ].map((img, i) => (
              <div key={i} className="relative group">
                <img src={img.url} alt={img.alt} className="w-full h-24 object-cover rounded-lg" />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <button className="text-white p-2 hover:bg-white hover:bg-opacity-20 rounded">
                    <FiEdit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
            Upload New Images
          </button>
        </div>

        <div className="p-6 border border-gray-200 rounded-lg bg-white">
          <h4 className="font-semibold text-gray-900 mb-4">Impact Statistics</h4>
          <div className="space-y-4">
            {[
              { label: "Community Members Reached", value: "2M+", color: "blue" },
              { label: "Children Enrolled in ECD Programs", value: "5,854+", color: "pink" },
              { label: "Mothers Reached Through ANC", value: "2,720+", color: "green" }
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg">
                <div className={`w-4 h-4 bg-${stat.color}-500 rounded`}></div>
                <input 
                  type="text" 
                  defaultValue={stat.label} 
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input 
                  type="text" 
                  defaultValue={stat.value} 
                  className="w-20 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            ))}
          </div>
          <button className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
      
      <div className="space-y-6">
        <div className="p-6 border border-gray-200 rounded-lg bg-white">
          <h4 className="font-semibold text-gray-900 mb-4">Email Notifications</h4>
          <div className="space-y-4">
            {[
              { label: "New user registrations", description: "Get notified when new users join the platform", enabled: true },
              { label: "Community session uploads", description: "Notifications for new community sessions", enabled: true },
              { label: "System maintenance alerts", description: "Important system updates and maintenance", enabled: true },
              { label: "Weekly activity reports", description: "Summary of platform activity", enabled: false },
              { label: "Security alerts", description: "Login attempts and security events", enabled: true }
            ].map((notif, i) => (
              <div key={i} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <h5 className="font-medium text-gray-900">{notif.label}</h5>
                  <p className="text-sm text-gray-600">{notif.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked={notif.enabled} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border border-gray-200 rounded-lg bg-white">
          <h4 className="font-semibold text-gray-900 mb-4">Push Notifications</h4>
          <div className="space-y-4">
            {[
              { label: "Real-time comments", description: "New comments on community sessions", enabled: true },
              { label: "Urgent announcements", description: "Critical system announcements", enabled: true },
              { label: "Survey reminders", description: "Reminders for pending surveys", enabled: false }
            ].map((notif, i) => (
              <div key={i} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <h5 className="font-medium text-gray-900">{notif.label}</h5>
                  <p className="text-sm text-gray-600">{notif.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked={notif.enabled} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border border-gray-200 rounded-lg bg-white">
          <h4 className="font-semibold text-gray-900 mb-4">Notification Frequency</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Digest Frequency</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                <option>Immediate</option>
                <option>Daily</option>
                <option>Weekly</option>
                <option>Never</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quiet Hours</label>
              <div className="flex gap-2">
                <input type="time" defaultValue="22:00" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                <span className="self-center text-gray-500">to</span>
                <input type="time" defaultValue="08:00" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemLogsTab = () => {
    const logs = logsResponse?.result ?? [];
    const totalLogs = logsResponse?.meta?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil((logsResponse?.meta?.total ?? 0) / logsPageSize));

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">System Logs</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                value={logsSearch}
                onChange={handleLogsSearchChange}
                placeholder="Search action (e.g. created user)..."
                className="pl-4 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Action</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Resource</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">User</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Meta</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Created</th>
                  <th className="text-right py-3 px-6 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {logsLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">Loading logs...</td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">No logs found</td>
                  </tr>
                ) : (
                  logs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="py-4 px-6 text-sm text-gray-700 capitalize">{spacer(log.action)}</td>
                      <td className="py-4 px-6 text-sm text-gray-700">
                        <div className="capitalize">{log.resourceType || '-'}</div>
                        <div className="text-xs text-gray-500">{log.resourceId ?? ''}</div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-700">{log.userId ?? '-'}</td>
                      <td className="py-4 px-6 text-sm text-gray-700">
                        <div className="line-clamp-1 text-xs text-gray-500">{log.meta ? JSON.stringify(log.meta) : '-'}</div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-700">{new Date(log.createdAt || '').toLocaleString()}</td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="p-2 hover:bg-gray-100 rounded-lg text-red-500"
                            title="Delete log"
                            onClick={async () => {
                              if (!confirm('Delete this system log?')) return;
                              await deleteLog.mutateAsync(log.id);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t border-gray-200 text-sm">
              <div className="text-gray-600">Showing {logs.length} of {totalLogs}</div>
              <div className="flex items-center gap-2">
                <button
                  disabled={logsPage <= 1}
                  onClick={() => setLogsPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 border rounded disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="px-2">{logsPage} / {totalPages}</span>
                <button
                  disabled={logsPage >= totalPages}
                  onClick={() => setLogsPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 border rounded disabled:opacity-50"
                >
                  Next
                </button>
                <select value={logsPageSize} onChange={(_) => { /* page size fixed for simplicity */ }} className="ml-2 border rounded px-2 py-1" disabled>
                  <option value={10}>10</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    const tabComponents = {
      'Authentication': renderAuthenticationTab,
      'Roles': renderRolesTab,
      'Website': renderWebsiteTab,
      'Notifications': renderNotificationsTab,
      'System Logs': renderSystemLogsTab,
    };

    return tabComponents[activeTab]();
  };

  return (
    <div>
      <Breadcrumb title="Settings" items={["Dashboard", "Settings"]} className="absolute top-0 left-0 w-full" />
      <div className="pt-16 max-w-8xl mx-auto bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <FiSettings className="text-white w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
                  <p className="text-gray-600 mt-1">Manage roles, security, and system configuration</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex px-6">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative py-4 px-6 text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeSettingsTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={cancelDeleteRole}
        title="Delete Role"
        size="sm"
      >
        <ModalBody>
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <FiTrash2 className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Delete Role
            </h3>
            <p className="text-sm text-gray-500">
              Are you sure you want to delete the role <strong>"{deleteModal.roleName}"</strong>? 
              This action cannot be undone and will fail if the role is assigned to any user.
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <ModalButton
            variant="secondary"
            onClick={cancelDeleteRole}
            disabled={deleteRole.isPending}
          >
            Cancel
          </ModalButton>
          <ModalButton
            variant="danger"
            onClick={confirmDeleteRole}
            loading={deleteRole.isPending}
            disabled={deleteRole.isPending}
          >
            Delete Role
          </ModalButton>
        </ModalFooter>
      </Modal>
    </div>
  );
}
