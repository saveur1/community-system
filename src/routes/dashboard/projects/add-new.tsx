import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useMemo, useState, FC, JSX } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronLeft, FaChevronRight, FaSave, FaTrash, FaUpload } from 'react-icons/fa';
import Breadcrumb from '@/components/ui/breadcrum';
import { toast } from 'react-toastify';
import { useCreateProject } from '@/hooks/useProjects';
import { useAuth } from '@/hooks/useAuth';
import { uploadToCloudinary } from '@/utility/logicFunctions';

// Types
interface ProgrammeForm {
  title: string;
  slug: string;
  description: string;
  targetGroup: string;
  resourceFiles: File[];
}

const AddProjectComponent: FC = (): JSX.Element => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createProject = useCreateProject();
  const [programme, setProgramme] = useState<ProgrammeForm>({
    title: '',
    slug: '',
    description: '',
    targetGroup: '',
    resourceFiles: [],
  });

  // Steps
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 2;

  // Auto-generate slug from title
  useEffect(() => {
    const slugified = programme.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    setProgramme(prev => ({ ...prev, slug: slugified }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programme.title]);

  const stepTitle = useMemo(() => {
    return currentStep === 1 ? 'Project Details' : 'Target Group & Resources';
  }, [currentStep]);

  // File uploads
  const onSelectFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    setProgramme(prev => ({ ...prev, resourceFiles: [...prev.resourceFiles, ...newFiles] }));
  };
  const removeFile = (idx: number) => {
    setProgramme(prev => ({
      ...prev,
      resourceFiles: prev.resourceFiles.filter((_, i) => i !== idx),
    }));
  };

  const handleSave = () => {
    if (!programme.title.trim()) {
      alert('Please enter a project title');
      return;
    }
    void (async () => {
      try {
        // 1) Upload selected files to Cloudinary, gather document payloads
        const uploads = [] as Array<{
          documentName: string;
          size?: number | null;
          type?: string | null;
          addedAt?: Date;
          documentUrl?: string | null;
          userId: string;
          publicId?: string | null;
          deleteToken?: string | null;
        }>;

        for (const f of programme.resourceFiles) {
          const toastId = toast.loading(`Uploading ${f.name}... 0%`);
          try {
            const res = await uploadToCloudinary(f, {
              onProgress: (p) => toast.update(toastId, { render: `Uploading ${f.name}... ${p}%` }),
            });
            toast.update(toastId, { render: `Uploaded ${f.name}`, type: 'success', isLoading: false, autoClose: 1200 });
            uploads.push({
              documentName: f.name,
              size: f.size,
              type: (f.name.includes('.') ? (f.name.split('.').pop() || '') : '').toLowerCase() || 'unknown',
              addedAt: new Date(),
              documentUrl: res.secureUrl || res.url,
              userId: user?.id as string,
              publicId: res.publicId,
              deleteToken: res.deleteToken,
            });
          } catch (e: any) {
            toast.update(toastId, { render: e?.message || `Failed uploading ${f.name}`, type: 'error', isLoading: false, autoClose: 2000 });
            throw e;
          }
        }

        // 2) Submit project with documents array
        await createProject.mutateAsync({
          name: programme.title,
          targetGroup: programme.targetGroup || null,
          documents: uploads,
        });

        toast.success('Project created successfully');
        navigate({ to: '/dashboard/projects' });
      } catch (err) {
        const msg = (err as any)?.response?.data?.message || 'Failed to create project';
        toast.error(msg);
      }
    })();
  };

  const handleCancel = () => navigate({ to: '/dashboard/projects' });

  return (
    <div className="pb-10">
      <Breadcrumb items={["Community", "Projects", "Add Project"]} title="Create New Project" className="absolute top-0 left-0 w-full px-6" />

      <div className="pt-20 max-w-5xl mx-auto">

        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6"
            >

              {/* <h3 className="text-lg font-semibold text-center text-title mb-4 px-2">{stepTitle}</h3> */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project Title *</label>
                  <input
                    type="text"
                    placeholder="e.g., Immunization"
                    value={programme.title}
                    onChange={(e) => setProgramme(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {/* Hidden, auto-generated slug display */}
                  <p className="text-xs text-gray-500 mt-1">Slug: {programme.slug || "—"}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    placeholder="Brief description of the project"
                    value={programme.description}
                    onChange={(e) => setProgramme(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center mt-4">
                <button onClick={() => navigate({ to: '/dashboard/projects' })} className='px-4 py-2 rounded-md border flex items-center gap-2'>
                  <FaChevronLeft className="opacity-70" /> Cancel
                </button>

                {/* Stepper */}
                <div className="flex items-center mt-2 justify-center gap-3 px-2">
                  {[1, 2].map((s) => (
                    <div key={s} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${currentStep === s ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'
                        }`}>
                        {s}
                      </div>
                      {s < totalSteps && <div className="w-10 h-1 bg-gray-200 rounded" />}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={!programme.title.trim()}
                  className="px-4 py-2 rounded-md bg-primary text-white flex items-center gap-2 disabled:opacity-50"
                >
                  Next <FaChevronRight />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {currentStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Group</label>
                  <input
                    type="text"
                    placeholder="e.g., Children under 5, Pregnant women, Adolescents"
                    value={programme.targetGroup}
                    onChange={(e) => setProgramme(prev => ({ ...prev, targetGroup: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Resources (Upload files)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
                    <input
                      id="resourceFiles"
                      type="file"
                      multiple
                      onChange={(e) => onSelectFiles(e.target.files)}
                      className="hidden"
                    />
                    <label htmlFor="resourceFiles" className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200">
                      <FaUpload /> Choose files
                    </label>
                    <p className="text-xs text-gray-500 mt-2">PDFs, images, docs, videos are allowed.</p>
                  </div>

                  {programme.resourceFiles.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-sm font-semibold text-gray-800 mb-2">Selected files</h4>
                      <ul className="space-y-2">
                        {programme.resourceFiles.map((f, i) => (
                          <li key={i} className="flex items-center justify-between text-sm bg-gray-50 border border-gray-200 rounded px-3 py-2">
                            <span className="truncate pr-3">{f.name} <span className="text-gray-400">({Math.round(f.size / 1024)} KB)</span></span>
                            <button onClick={() => removeFile(i)} className="text-rose-600 hover:text-rose-700 inline-flex items-center gap-2">
                              <FaTrash /> Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button onClick={() => setCurrentStep(1)} className="px-4 py-2 rounded-md border flex items-center gap-2">
                  <FaChevronLeft /> Back
                </button>

                {/* Stepper */}
                <div className="flex items-center justify-center gap-3 px-2">
                  {[1, 2].map((s) => (
                    <div key={s} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${currentStep === s ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'
                        }`}>
                        {s}
                      </div>
                      {s < totalSteps && <div className="w-10 h-1 bg-gray-200 rounded" />}
                    </div>
                  ))}
                </div>

                <button onClick={handleSave} className="px-4 py-2 rounded-md bg-primary text-white flex items-center gap-2">
                  <FaSave /> Submit Project
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export const Route = createFileRoute('/dashboard/projects/add-new')({
  component: AddProjectComponent,
});
