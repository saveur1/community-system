// components/settings/RolesTab.tsx
import React, { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { 
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiSearch,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import { spacer } from '@/utility/logicFunctions';
import { useDeleteRole, useRolesList } from '@/hooks/useRoles';
import Modal, { ModalBody, ModalFooter, ModalButton } from '@/components/ui/modal';

interface RolesTabProps {}

export const RolesTab: React.FC<RolesTabProps> = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; roleId: string; roleName: string }>({ 
    isOpen: false, 
    roleId: '', 
    roleName: '' 
  });

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
    setCurrentPage(1);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">Role Management</h3>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <div className="relative w-full sm:w-64">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search roles..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary"
              />
            </div>
            <Link
              to="/dashboard/settings/add-role"
              className="px-4 py-2 bg-primary dark:bg-primary/80 text-white rounded-lg hover:bg-primary-dark dark:hover:bg-primary transition-colors flex items-center justify-center gap-2"
            >
              <FiPlus className="w-4 h-4" />
              Add Role
            </Link>
          </div>
        </div>

        {rolesError && (
          <div className="p-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-700 rounded-lg text-red-700 dark:text-red-200">
            Error loading roles: {rolesError.message}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-500 dark:text-gray-300">Role Name</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-500 dark:text-gray-300 hidden md:table-cell">Description</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-500 dark:text-gray-300 hidden md:table-cell">Permissions</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-500 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {rolesLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">
                      Loading roles...
                    </td>
                  </tr>
                ) : roles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">
                      {searchTerm ? `No roles found matching "${searchTerm}"` : 'No roles found'}
                    </td>
                  </tr>
                ) : (
                  roles.map((role) => (
                    <tr key={role.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="py-4 px-6 font-medium text-gray-900 dark:text-gray-200 capitalize">{spacer(role.name)}</td>
                      <td className="py-4 px-6 text-gray-500 dark:text-gray-400 hidden md:table-cell">{role.description || 'No description'}</td>
                      <td className="py-4 px-6 text-gray-500 dark:text-gray-400 hidden md:table-cell">
                        {role.permissions?.length || 0} permissions
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <Link 
                            to="/dashboard/settings/edit-role/$roleId"
                            params={{ roleId: role.id }}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            title="Edit role"
                          >
                            <FiEdit3 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          </Link>
                          <button 
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            title="Delete role"
                            onClick={() => handleDeleteRole(role.id, role.name)}
                            disabled={deleteRole.isPending}
                          >
                            <FiTrash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 px-4 sm:px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalRoles)} of {totalRoles} roles
              </span>
              <div className="flex items-center space-x-2 overflow-x-auto">
                <button 
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <FiChevronLeft className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  if (pageNum > totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      className={`px-3 py-1 rounded ${
                        currentPage === pageNum 
                          ? 'bg-primary dark:bg-primary/80 text-white' 
                          : 'hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                      }`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button 
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <FiChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={cancelDeleteRole}
        title="Delete Role"
        size="sm"
      >
        <ModalBody>
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 mb-4">
              <FiTrash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-2">
              Delete Role
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
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
            className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Cancel
          </ModalButton>
          <ModalButton
            variant="danger"
            onClick={confirmDeleteRole}
            loading={deleteRole.isPending}
            disabled={deleteRole.isPending}
            className="bg-red-600 dark:bg-red-700 text-white hover:bg-red-700 dark:hover:bg-red-600"
          >
            Delete Role
          </ModalButton>
        </ModalFooter>
      </Modal>
    </>
  );
};