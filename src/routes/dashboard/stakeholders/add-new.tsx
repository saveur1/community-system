import { createFileRoute, useNavigate } from '@tanstack/react-router';
import React, { useState } from 'react';
import { FaSave, FaUpload, FaTrash } from 'react-icons/fa';
import Breadcrumb from '@/components/ui/breadcrum';
import { useCreateStakeholder } from '@/hooks/useStakeholders';
import { uploadToCloudinary } from '@/utility/logicFunctions';
import { toast } from 'react-toastify';

interface StakeholderFormData {
  name: string;
  logo: string | null;
}

const CreateStakeholderComponent: React.FC = () => {
  const navigate = useNavigate();
  const createStakeholder = useCreateStakeholder();

  const [formData, setFormData] = useState<StakeholderFormData>({
    name: '',
    logo: null,
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Please enter a stakeholder name');
      return;
    }

    try {
      await createStakeholder.mutateAsync({
        name: formData.name.trim(),
        logo: formData.logo,
      });

      toast.success('Stakeholder created successfully!');
      navigate({ to: '/dashboard/stakeholders' });
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to create stakeholder';
      toast.error(msg);
    }
  };

  const handleCancel = () => {
    navigate({ to: '/dashboard/stakeholders' });
  };

  return (
    <div className="w-full">
      <Breadcrumb 
        items={['Dashboard', 'Stakeholders', 'Add New']} 
        title="Add New Stakeholder" 
        className='absolute top-0 px-6 left-0 w-full' 
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
        <div className="bg-white rounded-lg shadow-lg drop-shadow-2xl border border-gray-200">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Create New Stakeholder</h1>
              <p className="text-gray-600">Add a new stakeholder to your organization</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Stakeholder Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Stakeholder Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  placeholder="Enter stakeholder name"
                  required
                />
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo
                </label>
                <div className="space-y-4">
                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                    <div className="space-y-2">
                      <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
                      <div>
                        <label htmlFor="logo-upload" className="cursor-pointer">
                          <span className="text-primary hover:text-primary-dark font-medium">
                            Click to upload
                          </span>
                          <span className="text-gray-500"> or drag and drop</span>
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG, GIF up to 5MB
                        </p>
                      </div>
                    </div>
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </div>

                  {/* Preview */}
                  {(logoPreview || formData.logo) && (
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <img
                        src={logoPreview || formData.logo || ''}
                        alt="Logo preview"
                        className="w-16 h-16 rounded-lg object-cover border"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {logoFile?.name || 'Uploaded logo'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {logoFile ? `${(logoFile.size / 1024 / 1024).toFixed(2)} MB` : 'Cloudinary hosted'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="text-red-500 hover:text-red-700 p-2"
                        disabled={isUploading}
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Upload Progress */}
                  {isUploading && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-sm text-blue-600">Uploading logo...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createStakeholder.isPending || isUploading}
                  className="flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createStakeholder.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-2" />
                      Create Stakeholder
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Route = createFileRoute('/dashboard/stakeholders/add-new')({
  component: CreateStakeholderComponent,
}); 