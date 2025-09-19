import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Breadcrumb from '@/components/ui/breadcrum';
import { useCreateCommunitySession } from '@/hooks/useCommunitySession';
import { useRolesList } from '@/hooks/useRoles';
import useAuth from '@/hooks/useAuth';
import { uploadToCloudinary } from '@/utility/logicFunctions';
import { FiChevronLeft, FiChevronRight, FiUpload, FiX } from 'react-icons/fi';
import { FaVideo, FaImage, FaFileAlt, FaMusic } from 'react-icons/fa';
import type { CommunitySessionType } from '@/api/community-sessions';

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
  title: string;
  shortDescription: string;
  type: CommunitySessionType;
  documentUrl: string;
  allowedRoles: string[];
}

const contentTypes = [
  { value: 'video' as CommunitySessionType, label: 'Video', icon: FaVideo, color: 'text-red-500' },
  { value: 'image' as CommunitySessionType, label: 'Image', icon: FaImage, color: 'text-blue-500' },
  { value: 'document' as CommunitySessionType, label: 'Document', icon: FaFileAlt, color: 'text-green-500' },
  { value: 'audio' as CommunitySessionType, label: 'Audio', icon: FaMusic, color: 'text-purple-500' },
];

const AddCommunitySessionPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [form, setForm] = useState<FormData>({
    title: '',
    shortDescription: '',
    type: 'video',
    documentUrl: '',
    allowedRoles: [],
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const createSession = useCreateCommunitySession();

  // Fetch roles and group by category for display
  const { data: rolesResp, isLoading: rolesLoading, isError: rolesError } = useRolesList({ page: 1, limit: 200 });

  const roleGroups = useMemo(() => {
    const list = rolesResp?.result ?? [];
    // Group by category (fallback to 'Other') and map to UI options
    const map = new Map<string, { title: string; options: { value: string; label: string }[] }>();
    const toLabel = (name: string) =>
      name
        .split('_')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    for (const r of list) {
      const cat = r.category?.trim() || 'Other';
      if (!map.has(cat)) {
        map.set(cat, { title: cat, options: [] });
      }
      map.get(cat)!.options.push({ value: r.id, label: toLabel(r.name) });
    }
    // Sort categories alphabetically; keep original if needed
    return Array.from(map.values()).map(g => ({
      title: g.title,
      options: g.options.sort((a, b) => a.label.localeCompare(b.label))
    }));
  }, [rolesResp]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (type: CommunitySessionType) => {
    setForm(prev => ({ ...prev, type }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
  };

  const handleRoleToggle = (roleValue: string) => {
    setForm(prev => ({
      ...prev,
      allowedRoles: prev.allowedRoles.includes(roleValue)
        ? prev.allowedRoles.filter(r => r !== roleValue)
        : [...prev.allowedRoles, roleValue]
    }));
  };

  // Toggle all roles within a category (group)
  const toggleGroupRoles = (roleValues: string[], selectAll: boolean) => {
    setForm(prev => {
      const current = new Set(prev.allowedRoles);
      if (selectAll) {
        roleValues.forEach(v => current.add(v));
      } else {
        roleValues.forEach(v => current.delete(v));
      }
      return { ...prev, allowedRoles: Array.from(current) };
    });
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!form.title.trim()) {
          toast.error('Title is required');
          return false;
        }
        if (!form.shortDescription.trim()) {
          toast.error('Description is required');
          return false;
        }
        if (!uploadedFile) {
          toast.error('Please upload a file');
          return false;
        }
        return true;
      case 2:
        if (form.allowedRoles.length === 0) {
          toast.error('Please select at least one role');
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
      // First upload the file to Cloudinary
      if (!uploadedFile) {
        toast.error('No file to upload');
        return;
      }
      if (!user?.id) {
        toast.error('User not authenticated');
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);

      const uploadResult = await uploadToCloudinary(uploadedFile, {
        folder: 'community-sessions',
        onProgress: (percent) => setUploadProgress(percent)
      });
      
      if (!uploadResult.secureUrl) {
        toast.error('Failed to upload file');
        return;
      }

      // Then create the community session with full document payload
      console.log(form.allowedRoles);
      await createSession.mutateAsync({
        title: form.title,
        shortDescription: form.shortDescription,
        type: form.type,
        allowedRoles: form.allowedRoles,
        document: {
          documentName: uploadedFile.name,
          size: uploadResult.bytes ?? uploadedFile.size,
          type: uploadedFile.type || uploadResult.format || null,
          addedAt: new Date().toISOString(),
          documentUrl: uploadResult.secureUrl,
          userId: user.id,
          publicId: uploadResult.publicId,
          deleteToken: uploadResult.deleteToken,
        },
      });

      navigate({ to: '/dashboard/community-sessions' });
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create community session');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

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
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Session Title *
        </label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
          placeholder="Enter session title..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Short Description *
        </label>
        <textarea
          name="shortDescription"
          value={form.shortDescription}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none"
          placeholder="Describe what this session is about..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Content Type *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {contentTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => handleTypeChange(type.value)}
                className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                  form.type === type.value
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Icon className={`mx-auto mb-2 text-2xl ${type.color}`} />
                <span className="block text-sm font-medium">{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Upload Resource *
        </label>
        {!uploadedFile ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
            <input
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              accept={
                form.type === 'video' ? 'video/*' :
                form.type === 'image' ? 'image/*' :
                form.type === 'audio' ? 'audio/*' :
                '.pdf,.doc,.docx,.txt'
              }
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <FiUpload className="mx-auto text-4xl text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-600 mb-2">
                Click to upload {form.type}
              </p>
              <p className="text-sm text-gray-500">
                {form.type === 'video' && 'MP4, AVI, MOV files'}
                {form.type === 'image' && 'JPG, PNG, GIF files'}
                {form.type === 'audio' && 'MP3, WAV, AAC files'}
                {form.type === 'document' && 'PDF, DOC, DOCX, TXT files'}
              </p>
            </label>
          </div>
        ) : (
          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  {(() => {
                    const typeConfig = contentTypes.find(t => t.value === form.type);
                    const Icon = typeConfig?.icon;
                    return Icon ? <Icon className="text-primary" /> : null;
                  })()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <FiX className="text-xl" />
              </button>
            </div>
          </div>
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
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Select Roles Who Can View This Session
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Choose which user roles should have access to this community session.
        </p>
      </div>

      <div className="space-y-6">
        {rolesLoading && (
          <div className="text-sm text-gray-500">Loading roles...</div>
        )}
        {rolesError && (
          <div className="text-sm text-red-600">Failed to load roles. Please try again.</div>
        )}
        {!rolesLoading && !rolesError && roleGroups.length === 0 && (
          <div className="text-sm text-gray-500">No roles found.</div>
        )}
        {roleGroups.map((group) => (
          <div key={group.title} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">{group.title}</h4>
              {(() => {
                const groupValues = group.options.map(o => o.value);
                const allSelected = groupValues.every(v => form.allowedRoles.includes(v));
                // const noneSelected = groupValues.every(v => !form.allowedRoles.includes(v));
                const buttonLabel = allSelected ? 'Clear all' : 'Select all';
                const nextSelectAll = !allSelected; // if all selected, clicking clears; else selects all
                return (
                  <button
                    type="button"
                    onClick={() => toggleGroupRoles(groupValues, nextSelectAll)}
                    className={`text-xs px-2 py-1 rounded border transition-colors ${allSelected ? 'text-red-600 border-red-300 hover:bg-red-50' : 'text-primary border-primary/40 hover:bg-primary/5'}`}
                    aria-label={`${buttonLabel} in ${group.title}`}
                  >
                    {buttonLabel}
                  </button>
                );
              })()}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {group.options.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={form.allowedRoles.includes(option.value)}
                    onChange={() => handleRoleToggle(option.value)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Selected roles:</strong> {form.allowedRoles.length} role(s) selected
        </p>
      </div>
    </motion.div>
  );

  const isLoading = createSession.isPending || isUploading;

  return (
    <div>
      <Breadcrumb 
        title="Add Community Session" 
        items={['Dashboard', 'Community Sessions', 'Add Session']} 
        className="absolute top-0 left-0 w-full"
      />
      
      <div className="pt-16 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg drop-shadow-xl p-8">
          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600">
                Step {currentStep} of 2
              </span>
              <span className="text-sm text-gray-500">
                {currentStep === 1 ? 'Session Details' : 'Role Selection'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
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
          <div className="flex justify-between pt-8 border-t border-gray-200">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isUploading ? `Uploading... ${uploadProgress}%` : createSession.isPending ? 'Creating...' : 'Create Session'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const Route = createFileRoute('/dashboard/community-sessions/add-new')({
  component: AddCommunitySessionPage,
});
