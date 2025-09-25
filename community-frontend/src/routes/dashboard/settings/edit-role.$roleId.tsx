import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Breadcrumb from '@/components/ui/breadcrum';
import { useUpdateRole, useRole, useRolesList } from '@/hooks/useRoles';
import { usePermissionsList } from '@/hooks/usePermissions';
import { FiChevronLeft, FiChevronRight, FiShield } from 'react-icons/fi';

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 }
};

const springTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30
};

interface FormData {
  name: string;
  description: string;
  category: string;
  permissionIds: string[];
}

const EditRolePage = () => {
  const navigate = useNavigate();
  const { roleId } = Route.useParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<FormData>({
    name: '',
    description: '',
    category: '',
    permissionIds: [],
  });

  // Fetch the role to edit
  const { data: roleResp, isLoading: roleLoading, error: roleError } = useRole(roleId);
  const updateRole = useUpdateRole(roleId);

  // Fetch existing roles to get unique categories
  const { data: rolesResp, isLoading: rolesLoading } = useRolesList();
  
  // Fetch all permissions
  const { data: permissionsResp, isLoading: permissionsLoading } = usePermissionsList();

  // Pre-fill form when role data is loaded
  useEffect(() => {
    if (roleResp?.result) {
      const role = roleResp.result;
      setForm({
        name: role.name || '',
        description: role.description || '',
        category: role.category || '',
        permissionIds: role.permissions?.map(p => p.id) || [],
      });
    }
  }, [roleResp]);

  // Extract unique categories from existing roles
  const existingCategories = useMemo(() => {
    const roles = rolesResp?.result ?? [];
    const categories = roles
      .map(role => role.category)
      .filter((category): category is string => !!category?.trim())
      .map(category => category.trim());
    
    return [...new Set(categories)].sort();
  }, [rolesResp]);

  // Group permissions by their group name (part before the colon)
  const permissionGroups = useMemo(() => {
    const permissions = permissionsResp?.result ?? [];
    const groups = new Map<string, Array<{ id: string; name: string; action: string }>>();

    permissions.forEach(permission => {
      const [groupName, action] = permission.name.split(':');
      if (!groupName || !action) return;

      if (!groups.has(groupName)) {
        groups.set(groupName, []);
      }
      
      groups.get(groupName)!.push({
        id: permission.id,
        name: permission.name,
        action: action
      });
    });

    // Convert to array and sort
    return Array.from(groups.entries()).map(([groupName, permissions]) => ({
      groupName,
      permissions: permissions.sort((a, b) => a.action.localeCompare(b.action))
    })).sort((a, b) => a.groupName.localeCompare(b.groupName));
  }, [permissionsResp]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCategorySelect = (category: string) => {
    setForm(prev => ({ ...prev, category }));
  };

  const handlePermissionToggle = (permissionId: string) => {
    setForm(prev => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(permissionId)
        ? prev.permissionIds.filter(id => id !== permissionId)
        : [...prev.permissionIds, permissionId]
    }));
  };

  // Toggle all permissions within a group
  const toggleGroupPermissions = (permissionIds: string[], selectAll: boolean) => {
    setForm(prev => {
      const current = new Set(prev.permissionIds);
      if (selectAll) {
        permissionIds.forEach(id => current.add(id));
      } else {
        permissionIds.forEach(id => current.delete(id));
      }
      return { ...prev, permissionIds: Array.from(current) };
    });
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!form.name.trim()) {
          toast.error('Role name is required');
          return false;
        }
        if (!form.description.trim()) {
          toast.error('Description is required');
          return false;
        }
        return true;
      case 2:
        if (form.permissionIds.length === 0) {
          toast.error('Please select at least one permission');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;

    try {
      await updateRole.mutateAsync({
        name: form.name,
        description: form.description,
        category: form.category || null,
        permissionIds: form.permissionIds,
      });

      navigate({ to: '/dashboard/settings' });
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update role');
    }
  };

  // Show loading state
  if (roleLoading) {
    return (
      <div>
        <Breadcrumb 
          title="Edit Role" 
          items={[
            {title: 'Dashboard', link: '/dashboard'},
            {title: 'Settings', link: '/dashboard/settings'},
            'Edit Role'
          ]} 
          className="absolute top-0 left-0 w-full"
        />
        
        <div className="pt-16 max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg drop-shadow-xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400">Loading role...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (roleError) {
    return (
      <div>
        <Breadcrumb 
          title="Edit Role" 
          items={[
            {title: 'Dashboard', link: '/dashboard'},
            {title: 'Settings', link: '/dashboard/settings'},
            'Edit Role'
          ]} 
          className="absolute top-0 left-0 w-full"
        />
        
        <div className="pt-16 max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg drop-shadow-xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="text-center py-12">
              <div className="text-red-600 dark:text-red-400">Error loading role: {roleError.message}</div>
              <button 
                onClick={() => navigate({ to: '/dashboard/settings' })}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                Back to Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderStep1 = () => (
    <motion.div
      key="step1"
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={sectionVariants}
      transition={springTransition}
      className="space-y-6"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Role Name *
        </label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          placeholder="Enter role name..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description *
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          placeholder="Describe what this role is for..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Category (Optional)
        </label>
        
        {rolesLoading ? (
          <div className="text-sm text-gray-500 dark:text-gray-400">Loading categories...</div>
        ) : (
          <>
            {existingCategories.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Select from existing categories:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {existingCategories.map((category) => (
                    <label
                      key={category}
                      className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-600"
                    >
                      <input
                        type="radio"
                        name="categorySelect"
                        checked={form.category === category}
                        onChange={() => handleCategorySelect(category)}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{category}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Or enter a new category:</p>
              <input
                type="text"
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Enter new category..."
              />
            </div>
          </>
        )}
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      key="step2"
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={sectionVariants}
      transition={springTransition}
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Select Permissions for This Role
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Choose which permissions this role should have. Permissions are grouped by functionality.
        </p>
      </div>

      <div className="space-y-6">
        {permissionsLoading && (
          <div className="text-sm text-gray-500 dark:text-gray-400">Loading permissions...</div>
        )}
        
        {!permissionsLoading && permissionGroups.length === 0 && (
          <div className="text-sm text-gray-500 dark:text-gray-400">No permissions found.</div>
        )}
        
        {permissionGroups.map((group) => (
          <div key={group.groupName} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 capitalize flex items-center">
                <FiShield className="mr-2 text-primary" />
                {group.groupName.replace('_', ' ')}
              </h4>
              {(() => {
                const groupPermissionIds = group.permissions.map(p => p.id);
                const allSelected = groupPermissionIds.every(id => form.permissionIds.includes(id));
                const buttonLabel = allSelected ? 'Clear all' : 'Select all';
                const nextSelectAll = !allSelected;
                
                return (
                  <button
                    type="button"
                    onClick={() => toggleGroupPermissions(groupPermissionIds, nextSelectAll)}
                    className={`text-xs px-2 py-1 rounded border transition-colors ${
                      allSelected 
                        ? 'text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20' 
                        : 'text-primary border-primary/40 hover:bg-primary/5 dark:hover:bg-primary/10'
                    }`}
                  >
                    {buttonLabel}
                  </button>
                );
              })()}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {group.permissions.map((permission) => (
                <label
                  key={permission.id}
                  className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={form.permissionIds.includes(permission.id)}
                    onChange={() => handlePermissionToggle(permission.id)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                    {permission.action}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>Selected permissions:</strong> {form.permissionIds.length} permission(s) selected
        </p>
      </div>
    </motion.div>
  );

  const isLoading = updateRole.isPending;
  const roleName = roleResp?.result?.name || 'Role';

  return (
    <div>
      <Breadcrumb 
        title={`Edit ${roleName}`} 
        items={[
          {title: 'Dashboard', link: '/dashboard'},
          {title: 'Settings', link: '/dashboard/settings'},
          `Edit Role ${roleName}`
        ]}  
        className="absolute top-0 left-0 w-full"
      />
      
      <div className="pt-20 max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg drop-shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Step {currentStep} of 2
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {currentStep === 1 ? 'Role Details' : 'Permission Selection'}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 2) * 100}%` }}
              />
            </div>
          </div>

          {/* Form content */}
          <div className="relative min-h-[500px]">
            <AnimatePresence mode="wait">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
            </AnimatePresence>
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between pt-8 border-t border-gray-200 dark:border-gray-600">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FiChevronLeft className="mr-2" />
              Previous
            </button>

            {currentStep < 2 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                Next
                <FiChevronRight className="ml-2" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:bg-gray-400 dark:disabled:bg-gray-600"
              >
                {isLoading ? 'Updating...' : 'Update Role'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const Route = createFileRoute('/dashboard/settings/edit-role/$roleId')({
  component: EditRolePage,
});
