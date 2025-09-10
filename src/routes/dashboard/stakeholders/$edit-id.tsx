import { createFileRoute, useNavigate } from '@tanstack/react-router';
import React, { useEffect, useState, useMemo } from 'react';
import { FaUpload, FaTrash } from 'react-icons/fa';
import Breadcrumb from '@/components/ui/breadcrum';
import { useUpdateOrganization, useOrganization } from '@/hooks/useOrganizations';
import { uploadToCloudinary } from '@/utility/logicFunctions';
import { toast } from 'react-toastify';
import { usePermissionsList } from '@/hooks/usePermissions';
import { useRolesList } from '@/hooks/useRoles';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface StakeholderFormData {
  name: string;
  logo: string | null;
}

const EditStakeholderComponent: React.FC = () => {
  const navigate = useNavigate();
  // read route param (file-route supplies Route.useParams)
  const params = (Route as any).useParams?.() ?? {};
  const stakeholderId = String(params['edit-id'] ?? '');

  // fetch stakeholder
  const { data: stakeholderResp, isLoading: isFetching, isError: fetchError, refetch } = useOrganization(stakeholderId);
  const existing = stakeholderResp?.result ?? null;

  const updateStakeholder = useUpdateOrganization(stakeholderId);

  const [formData, setFormData] = useState<StakeholderFormData>({ name: '', logo: null });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // stepper & permissions
  const [currentStep, setCurrentStep] = useState(1);
  const { data: permissionsResp, isLoading: permissionsLoading, isError: permissionsError } = usePermissionsList();
  const { data: rolesResp } = useRolesList({ page: 1, limit: 200 });
  const [permissionIds, setPermissionIds] = useState<string[]>([]);

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

  // try prefill permissionIds from stakeholder's role (if roles API returns role with stakeholderId and permissions)
  useEffect(() => {
    if (!rolesResp?.result || !stakeholderId) return;
    const role = rolesResp.result.find((r: any) => String(r.stakeholderId) === stakeholderId);
    if (role) {
      // role may include permissions array or permissionIds
      const ids = (role.permissions?.map((p:any)=>p.id) ?? role?.permissions?.map(perm=>perm.id) ?? []);
      if (ids.length > 0) setPermissionIds(ids);
    }
  }, [rolesResp, stakeholderId]);

  // populate when data loads
  useEffect(() => {
    if (existing) {
      setFormData({
        name: existing.name ?? '',
        logo: existing.logo ?? null,
      });
      setLogoPreview(existing.logo ?? null);
    }
  }, [existing]);

  const handlePermissionToggle = (id: string) => {
    setPermissionIds(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  };

  const toggleGroupPermissions = (ids: string[], selectAll: boolean) => {
    setPermissionIds(prev => {
      const set = new Set(prev);
      if (selectAll) ids.forEach(i=>set.add(i)); else ids.forEach(i=>set.delete(i));
      return Array.from(set);
    });
  };

  const handleInputChange = (field: keyof StakeholderFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
      const url = result.secureUrl || result.url || null;
      setFormData(prev => ({ ...prev, logo: url }));
      setLogoPreview(url);
      toast.update(toastId, { render: 'Logo uploaded successfully!', type: 'success', isLoading: false, autoClose: 1500 });
    } catch (err: any) {
      toast.update(toastId, { render: err?.message || 'Failed to upload logo', type: 'error', isLoading: false, autoClose: 3000 });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size similar to add-new
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setLogoPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // upload
    handleLogoUpload(file);
  };

  const removeLogo = () => {
    setFormData(prev => ({ ...prev, logo: null }));
    setLogoFile(null);
    setLogoPreview(null);
  };

  // step validation/navigation and final submit
  const validateStep = (step: number) => {
    if (step === 1) {
      if (!formData.name.trim()) { toast.error('Please enter a stakeholder name'); return false; }
    }
    if (step === 2) {
      if (permissionIds.length === 0) { toast.error('Please select at least one permission'); return false; }
    }
    return true;
  };

  const nextStep = () => { if (validateStep(currentStep)) setCurrentStep(s => Math.min(2, s+1)); };
  const prevStep = () => setCurrentStep(s => Math.max(1, s-1));

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateStep(currentStep)) return;
    try {
      await updateStakeholder.mutateAsync({
        name: formData.name.trim(),
        logo: formData.logo,
        permissionIds,
      } as any);
      toast.success('Stakeholder updated successfully');
      navigate({ to: '/dashboard/stakeholders' });
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update stakeholder');
    }
  };

  const handleCancel = () => {
    navigate({ to: '/dashboard/stakeholders' });
  };

  return (
    <div className="w-full">
      <Breadcrumb
        items={['Dashboard', 'Stakeholders', 'Edit Stakeholder']}
        title="Edit Stakeholder"
        className="absolute top-0 px-6 left-0 w-full"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
        <div className="bg-white rounded-lg shadow-lg drop-shadow-2xl border border-gray-200">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Edit Stakeholder</h1>
              <p className="text-gray-600">Update stakeholder details</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {isFetching && <div className="text-sm text-gray-500">Loading stakeholder...</div>}
              {fetchError && <div className="text-sm text-red-600">Failed to load stakeholder. Try refreshing.</div>}

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Step {currentStep} of 2</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${(currentStep / 2) * 100}%` }} />
                </div>
              </div>

              {/* Step 1 */}
              {currentStep === 1 && (
                <>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Stakeholder Name <span className="text-red-500">*</span>
                    </label>
                    <input type="text" id="name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition-colors" placeholder="Enter stakeholder name" />
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
                            <p className="text-sm font-medium text-gray-900">{logoFile?.name || 'Current logo'}</p>
                            <p className="text-xs text-gray-500">{logoFile ? `${(logoFile.size / 1024 / 1024).toFixed(2)} MB` : 'Cloud hosted'}</p>
                          </div>
                          <button type="button" onClick={removeLogo} className="text-red-500 hover:text-red-700 p-2" disabled={isUploading}><FaTrash className="w-4 h-4" /></button>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Step 2: permissions */}
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

              <div className="flex justify-between pt-6 border-t border-gray-200">
                <button type="button" onClick={prevStep} disabled={currentStep === 1} className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"><FiChevronLeft className="mr-2" /> Previous</button>
                {currentStep < 2 ? <button type="button" onClick={nextStep} className="flex items-center px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">Next <FiChevronRight className="ml-2" /></button> : <div className="flex gap-3"><button type="button" onClick={handleCancel} className="px-6 py-2 border rounded-md">Cancel</button><button type="submit" disabled={updateStakeholder.isPending || isUploading} className="px-6 py-2 bg-primary text-white rounded-md">{updateStakeholder.isPending ? 'Updating...' : 'Update Stakeholder'}</button></div>}
              </div>
            </form>
           </div>
         </div>
       </div>
     </div>
   );
 };
 
 export const Route = createFileRoute('/dashboard/stakeholders/$edit-id')({
   component: EditStakeholderComponent,
 });
