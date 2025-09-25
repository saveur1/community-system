import { useState, useMemo, useEffect } from 'react';
import Modal, { ModalBody, ModalFooter, ModalButton } from '@/components/ui/modal';
import { useRolesList } from '@/hooks/useRoles';
import { useUpdateUserRoles } from '@/hooks/useUsers';
import { spacer } from '@/utility/logicFunctions';
import type { Account } from '@/types/account';

interface ChangeRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account | null;
}

export function ChangeRoleModal({ isOpen, onClose, account }: ChangeRoleModalProps) {
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const { data: rolesData, isLoading: rolesLoading, error: rolesError } = useRolesList({});
  const { mutate: updateUserRoles, isPending } = useUpdateUserRoles(account?.id || '');

  // Group roles by category
  const roleGroups = useMemo(() => {
    const list = rolesData?.result ?? [];
    const map = new Map<string, { title: string; options: { value: string; label: string }[] }>();
    
    for (const role of list) {
      const category = role.category?.trim() || 'Other';
      if (!map.has(category)) {
        map.set(category, { title: category, options: [] });
      }
      map.get(category)!.options.push({ 
        value: role.id, 
        label: spacer(role.name) 
      });
    }
    
    return Array.from(map.values());
  }, [rolesData]);

  // Set initial selected role when account changes
  useEffect(() => {
    if (account?.role && rolesData?.result) {
      const currentRole = rolesData.result.find(role => spacer(role.name) === account.role);
      if (currentRole) {
        setSelectedRoleId(currentRole.id);
      }
    }
  }, [account, rolesData]);

  const handleRoleChange = (roleId: string) => {
    setSelectedRoleId(roleId);
  };

  const handleSubmit = () => {
    if (!selectedRoleId || !account) return;

    updateUserRoles(
      { roleIds: [selectedRoleId] },
      {
        onSuccess: () => {
          onClose();
          setSelectedRoleId('');
        },
      }
    );
  };

  const handleClose = () => {
    onClose();
    setSelectedRoleId('');
  };

  // Find current role name for display
  const currentRoleName = useMemo(() => {
    if (!selectedRoleId || !rolesData?.result) return '';
    const role = rolesData.result.find(r => r.id === selectedRoleId);
    return role ? spacer(role.name) : '';
  }, [selectedRoleId, rolesData]);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title="Change User Role"
      size="lg" 
      closeOnOverlayClick={false}
    >
      <ModalBody>
        {account && (
          <div className="space-y-4">
            {/* User Info */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                  {account.profile ? (
                    <img src={account.profile} alt={account.name} className="h-12 w-12 rounded-full" />
                  ) : (
                    <span className="text-lg font-medium text-gray-600 dark:text-gray-300">
                      {account.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{account.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Current role: {account.role}</p>
                </div>
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Select New Role:</h4>
              
              {rolesLoading && (
                <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  Loading roles...
                </div>
              )}
              
              {rolesError && (
                <div className="text-sm text-red-600 dark:text-red-400 text-center py-4">
                  Failed to load roles
                </div>
              )}
              
              {!rolesLoading && !rolesError && roleGroups.length === 0 && (
                <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  No roles found
                </div>
              )}

              <div className="space-y-4">
                {roleGroups.map(group => (
                  <div key={group.title} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-3">{group.title}</h5>
                    <div className="space-y-2">
                      {group.options.map(option => (
                        <label 
                          key={option.value} 
                          className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                        >
                          <input
                            type="radio"
                            name="roleSelect"
                            value={option.value}
                            checked={selectedRoleId === option.value}
                            onChange={() => handleRoleChange(option.value)}
                            className="h-4 w-4 text-primary focus:ring-primary dark:focus:ring-primary-dark border-gray-300 dark:border-gray-600"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {selectedRoleId && currentRoleName && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Selected role:</strong> {currentRoleName}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </ModalBody>
      
      <ModalFooter>
        <ModalButton variant="secondary" onClick={handleClose} disabled={isPending}>
          Cancel
        </ModalButton>
        <ModalButton 
          variant="primary" 
          onClick={handleSubmit}
          disabled={!selectedRoleId || isPending || selectedRoleId === rolesData?.result?.find(r => spacer(r.name) === account?.role)?.id}
        >
          {isPending ? 'Updating...' : 'Update Role'}
        </ModalButton>
      </ModalFooter>
    </Modal>
  );
}
