import React from 'react';
import { FiMail, FiPhone, FiMapPin, FiUser } from 'react-icons/fi';
import { MdVerified, MdPending } from 'react-icons/md';
import { FaIdCard } from 'react-icons/fa';
import type { User } from '@/api/auth';
import { spacer } from '@/utility/logicFunctions';

interface UserDetailsTabProps {
  user?: User | null;
}

export const UserDetailsTab: React.FC<UserDetailsTabProps> = ({ user }) => {
  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">No user data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <FiUser className="mr-2" />
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center space-x-3">
            <FiMail className="text-gray-400 w-5 h-5" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
              <p className="text-gray-900 dark:text-gray-100">{user.email}</p>
              {user.emailVerified ? (
                <span className="flex items-center text-xs text-green-600">
                  <MdVerified className="w-3 h-3 mr-1" />
                  Verified
                </span>
              ) : (
                <span className="flex items-center text-xs text-yellow-600">
                  <MdPending className="w-3 h-3 mr-1" />
                  Unverified
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <FiPhone className="text-gray-400 w-5 h-5" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
              <p className="text-gray-900 dark:text-gray-100">{user.phone || 'Not provided'}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <FiMapPin className="text-gray-400 w-5 h-5" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
              <p className="text-gray-900 dark:text-gray-100">{user.address || 'Not provided'}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <MdVerified className="text-gray-400 w-5 h-5" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  user.verified 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }`}>
                  {user.verified ? 'Verified' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Location Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <FaIdCard className="mr-2" />
          Location Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">National ID</p>
            <p className="text-gray-900 dark:text-gray-100">{user.nationalId || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">District</p>
            <p className="text-gray-900 dark:text-gray-100">{user.district || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Sector</p>
            <p className="text-gray-900 dark:text-gray-100">{user.sector || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Cell</p>
            <p className="text-gray-900 dark:text-gray-100">{user.cell || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Village</p>
            <p className="text-gray-900 dark:text-gray-100">{user.village || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Language</p>
            <p className="text-gray-900 dark:text-gray-100">{user.preferredLanguage || 'Not specified'}</p>
          </div>
        </div>
      </div>

      {/* Roles */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Roles</h3>
        <div className="space-y-2">
          {user.roles?.map((role) => (
            <div key={role.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">{spacer(role.name)}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{role.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
