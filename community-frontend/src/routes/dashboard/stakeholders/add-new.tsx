import { createFileRoute, useNavigate } from '@tanstack/react-router';
import React, { useState, useMemo, useEffect } from 'react';
import { FaUpload, FaTrash } from 'react-icons/fa';
import Breadcrumb from '@/components/ui/breadcrum';
import { useCreateOrganization } from '@/hooks/useOrganizations';
import { useUsersList, useCreateUser } from '@/hooks/useUsers';
import { uploadToCloudinary } from '@/utility/logicFunctions';
import { toast } from 'react-toastify';
import { usePermissionsList } from '@/hooks/usePermissions';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface StakeholderFormData {
  name: string;
  logo: string | null;
  description?: string;
  email?: string;
}

const CreateStakeholderComponent: React.FC = () => {
  const navigate = useNavigate();
  const createOrganization = useCreateOrganization();

  // Step state
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState<StakeholderFormData>({
    name: '',
    logo: null,
    description: '',
    email: '',
  });

  // permissions state
  const [permissionIds, setPermissionIds] = useState<string[]>([]);
  const { data: permissionsResp, isLoading: permissionsLoading, isError: permissionsError } = usePermissionsList();

  const permissionGroups = useMemo(() => {
    const list = permissionsResp?.result ?? [];
    const groups = new Map<string, { title: string; options: { value: string; label: string }[] }>();
    for (const p of list) {
      const [groupName, action] = (p.name || '').split(':');
      const cat = groupName?.trim() || 'Other';
      if (!groups.has(cat)) groups.set(cat, { title: cat, options: [] });
      groups.get(cat)!.options.push({ value: p.id, label: action ?? p.name });
    }
    return Array.from(groups.values()).map(g => ({ title: g.title, options: g.options.sort((a,b)=>a.label.localeCompare(b.label)) }));
  }, [permissionsResp]);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Users for owner dropdown - keeping for add user functionality
  const usersQuery = useUsersList({ page: 1, limit: 1000 });
  const [addUserOpen, setAddUserOpen] = useState(false);
  const createUser = useCreateUser();

  // refetch users after new user created
  useEffect(() => {
    if (createUser.isSuccess) {
      usersQuery.refetch();
      setAddUserOpen(false);
    }
  }, [createUser.isSuccess]);

  const handleInputChange = (field: keyof StakeholderFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLogoUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    const toastId = toast.loading('Uploading logo... 0%');

    try {
      const result = await uploadToCloudinary(file, {
        onProgress: (percent) => {
          toast.update(toastId, { render: `Uploading logo... ${percent}%` });
        },
      });

      setFormData(prev => ({
        ...prev,
        logo: result.secureUrl || result.url,
      }));

      toast.update(toastId, {
        render: 'Logo uploaded successfully!',
        type: 'success',
        isLoading: false,
        autoClose: 2000
      });
    } catch (error: any) {
      toast.update(toastId, {
        render: error?.message || 'Failed to upload logo',
        type: 'error',
        isLoading: false,
        autoClose: 3000
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setLogoFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary
    handleLogoUpload(file);
  };

  const removeLogo = () => {
    setFormData(prev => ({ ...prev, logo: null }));
    setLogoFile(null);
    setLogoPreview(null);
  };

  // Email validation helper
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // step validation and navigation
  const validateStep = (step: number) => {
    if (step === 1) {
      if (!formData.name.trim()) {
        toast.error('Please enter an organization name');
        return false;
      }
      if (!formData.email?.trim()) {
        toast.error('Please enter a contact email');
        return false;
      }
      if (!isValidEmail(formData.email.trim())) {
        toast.error('Please enter a valid email address');
        return false;
      }
    }
    if (step === 2) {
      if (permissionIds.length === 0) {
        toast.error('Please select at least one permission');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) setCurrentStep(s => Math.min(2, s + 1));
  };
  const prevStep = () => setCurrentStep(s => Math.max(1, s - 1));

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    // final submit - use createOrganization
    await createOrganization.mutateAsync({
      name: formData.name.trim(),
      description: formData.description || null,
      logo: formData.logo,
      ownerEmail: formData.email?.trim() || null,
      permissionIds,
      type: 'stakeholder',
    } as any);
  };

  const handlePermissionToggle = (id: string) => {
    setPermissionIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleGroupPermissions = (ids: string[], selectAll: boolean) => {
    setPermissionIds(prev => {
      const set = new Set(prev);
      if (selectAll) ids.forEach(i => set.add(i));
      else ids.forEach(i => set.delete(i));
      return Array.from(set);
    });
  };

  const handleCancel = () => navigate({ to: '/dashboard/stakeholders' });

  // Render UI as a two-step wizard
  return (
    <div className="w-full">
      <Breadcrumb
        items={['Dashboard', 'Organizations', 'Add New']}
        title="Add New Organization"
        className='absolute top-0 px-6 left-0 w-full'
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
        <div className="bg-white rounded-lg shadow-lg drop-shadow-2xl border border-gray-200">
          <div className="p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Create New Organization</h1>
              <p className="text-gray-600">Add a new organization and select permissions for its role</p>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Step {currentStep} of 2</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${(currentStep / 2) * 100}%` }} />
              </div>
            </div>

            <div className="min-h-[280px]">
              {currentStep === 1 && (
                <div className="space-y-6">
                  {/* Step 1: form fields */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Organization Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                      placeholder="Enter organization name"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition-colors resize-none"
                      placeholder="Short description of the organization (optional)"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                      placeholder="Enter contact email address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                        <div className="space-y-2">
                          <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
                          <div>
                            <label htmlFor="logo-upload" className="cursor-pointer">
                              <span className="text-primary hover:text-primary-dark font-medium">Click to upload</span>
                              <span className="text-gray-500"> or drag and drop</span>
                            </label>
                            <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                          </div>
                        </div>
                        <input id="logo-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={isUploading} />
                      </div>

                      {(logoPreview || formData.logo) && (
                        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                          <img src={logoPreview || formData.logo || ''} alt="Logo preview" className="w-16 h-16 rounded-lg object-cover border border-gray-300" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{logoFile?.name || 'Uploaded logo'}</p>
                            <p className="text-xs text-gray-500">{logoFile ? `${(logoFile.size / 1024 / 1024).toFixed(2)} MB` : 'Cloudinary hosted'}</p>
                          </div>
                          <button type="button" onClick={removeLogo} className="text-red-500 hover:text-red-700 p-2" disabled={isUploading}><FaTrash className="w-4 h-4" /></button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Permissions for Stakeholder Role</h3>
                    <p className="text-sm text-gray-600 mb-4">Choose which permissions the stakeholder role should have.</p>
                  </div>
                  <div className="space-y-4">
                    {permissionsLoading && <div className="text-sm text-gray-500">Loading permissions...</div>}
                    {permissionsError && <div className="text-sm text-red-600">Failed to load permissions</div>}
                    {!permissionsLoading && !permissionsError && permissionGroups.length === 0 && <div className="text-sm text-gray-500">No permissions found.</div>}
                    {permissionGroups.map(group => (
                      <div key={group.title} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">{group.title}</h4>
                          {(() => {
                            const groupValues = group.options.map(o => o.value);
                            const allSelected = groupValues.every(v => permissionIds.includes(v));
                            const nextSelectAll = !allSelected;
                            return (
                              <button type="button" onClick={() => toggleGroupPermissions(groupValues, nextSelectAll)} className={`text-xs px-2 py-1 rounded border transition-colors ${allSelected ? 'text-red-600 border-red-300 hover:bg-red-50' : 'text-primary border-primary/40 hover:bg-primary/5'}`}>
                                {allSelected ? 'Clear all' : 'Select all'}
                              </button>
                            );
                          })()}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {group.options.map(option => (
                            <label key={option.value} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors">
                              <input type="checkbox" checked={permissionIds.includes(option.value)} onChange={() => handlePermissionToggle(option.value)} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                              <span className="text-sm text-gray-700">{option.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <button type="button" onClick={prevStep} disabled={currentStep === 1} className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50">
                <FiChevronLeft className="mr-2" /> Previous
              </button>

              {currentStep < 2 ? (
                <button type="button" onClick={nextStep} className="flex items-center px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">Next <FiChevronRight className="ml-2" /></button>
              ) : (
                <div className="flex gap-3">
                  <button type="button" onClick={handleCancel} className="px-6 py-2 border rounded-md">Cancel</button>
                  <button type="button" onClick={handleSubmit} disabled={createOrganization.isPending || isUploading} className="px-6 py-2 bg-primary text-white rounded-md">{createOrganization.isPending ? 'Creating...' : 'Create Organization'}</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add User Modal - kept for potential future use */}
      <div>
        {addUserOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setAddUserOpen(false)} />
            <div className="bg-white rounded-lg shadow-lg z-10 p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Add User</h3>
              <div className="space-y-3">
                <input placeholder="Full name" className="w-full px-3 py-2 border rounded" id="new-user-name" />
                <input placeholder="Email" className="w-full px-3 py-2 border rounded" id="new-user-email" />
                <div className="flex justify-end gap-2">
                  <button className="px-3 py-2 border rounded" onClick={() => setAddUserOpen(false)}>Cancel</button>
                  <button
                    className="px-3 py-2 bg-primary text-white rounded"
                    onClick={async () => {
                      const name = (document.getElementById('new-user-name') as HTMLInputElement).value;
                      const email = (document.getElementById('new-user-email') as HTMLInputElement).value;
                      if (!name.trim() || !email.trim()) {
                        toast.error('Name and email are required');
                        return;
                      }
                      try {
                        await createUser.mutateAsync({ name: name.trim(), email: email.trim(), phone: '', status: 'active' } as any);
                      } catch (err) {
                        // error toast handled by hook
                      }
                    }}
                  >
                    {createUser.isPending ? 'Adding...' : 'Add user'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export const Route = createFileRoute('/dashboard/stakeholders/add-new')({
  component: CreateStakeholderComponent,
});