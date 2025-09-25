// components/settings/AuthenticationTab.tsx
import React, { useState } from 'react';
import useAuth from '@/hooks/useAuth';

interface AuthenticationTabProps {}

export const AuthenticationTab: React.FC<AuthenticationTabProps> = () => {
  const { changePassword, isChangingPassword } = useAuth();
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.oldPassword || !formData.newPassword) {
      return;
    }

    try {
      await changePassword(formData);
      // Clear form on success
      setFormData({
        oldPassword: '',
        newPassword: '',
      });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">Authentication Settings</h3>

      <div className="mt-4 p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-6">Change Password</h3>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Current Password
            </label>
            <input
              type="password"
              id="oldPassword"
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary focus:border-transparent"
              placeholder="Enter current password"
              required
              disabled={isChangingPassword}
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary focus:border-transparent"
              placeholder="Enter new password"
              required
              disabled={isChangingPassword}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isChangingPassword || !formData.oldPassword || !formData.newPassword}
              className="w-full md:w-auto px-6 py-2 bg-primary dark:bg-primary/80 text-white rounded-lg hover:bg-primary-dark dark:hover:bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isChangingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};