import { createFileRoute, useNavigate } from '@tanstack/react-router';
import React, { useEffect, useMemo, useState } from 'react';
import { FaSave, FaChevronLeft, FaTrash } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Breadcrumb from '@/components/ui/breadcrum';
import { CustomDropdown, DropdownItem } from '@/components/ui/dropdown';
import { useProjectsList } from '@/hooks/useProjects';
import { useGetFeedbackById, useUpdateFeedback } from '@/hooks/useFeedback';
import type { DocumentInput, FeedbackEntity } from '@/api/feedback';
import type { VoiceFeedback as VoiceFeedbackType, VideoFeedback as VideoFeedbackType } from '@/types/feedback-types';
import VoiceFeedback from '@/components/features/landing-page/feedback-form/voice-feedback';
import VideoFeedback from '@/components/features/landing-page/feedback-form/video-feedback';
import { uploadToCloudinary } from '@/utility/logicFunctions';
import { toast } from 'react-toastify';

interface EditFeedbackState {
  projectId: string;
  mainMessage: string;
  feedbackType: 'positive' | 'negative' | 'suggestion' | 'concern' | null;
  feedbackMethod: 'text' | 'voice' | 'video';
  followUpNeeded: boolean;
  voiceFeedback: VoiceFeedbackType | null;
  videoFeedback: VideoFeedbackType | null;
  existingDocuments: DocumentInput[]; // from server
}

const FEEDBACK_TYPES = [
  { value: 'positive', label: 'Positive Experience', icon: '😊' },
  { value: 'negative', label: 'Negative Experience', icon: '😞' },
  { value: 'suggestion', label: 'Suggestion for Improvement', icon: '💡' },
  { value: 'concern', label: 'Health Concern', icon: '⚠️' },
];

function fromEntityToState(entity: FeedbackEntity): EditFeedbackState {
  const voiceDoc = (entity.documents || []).find(d => (d.type?.includes('audio') || d.type === 'audio' || d.type === 'mpeg' || d.type === 'webm'));
  const videoDoc = (entity.documents || []).find(d => (d.type?.includes('video') || d.type === 'mp4' || d.type === 'webm'));

  return {
    projectId: entity.projectId || '',
    mainMessage: entity.mainMessage || '',
    feedbackType: entity.feedbackType,
    feedbackMethod: entity.feedbackMethod,
    followUpNeeded: !!entity.followUpNeeded,
    voiceFeedback: null, // only set when user records a replacement
    videoFeedback: null,
    existingDocuments: [voiceDoc, videoDoc].filter(Boolean) as DocumentInput[],
  };
}

const EditFeedbackComponent: React.FC = () => {
  const params = Route.useParams();
  const feedbackId = params['edit-id'];
  const navigate = useNavigate();
  const [isChangingVideo, setIsChangingVideo] = useState(false);
  const [isChangingVoice, setIsChangingVoice] = useState(false);

  const { data: projectsData } = useProjectsList({ limit: 100 });
  const { data, isLoading } = useGetFeedbackById(feedbackId);
  const updateFeedback = useUpdateFeedback();

  const [form, setForm] = useState<EditFeedbackState | null>(null);

  useEffect(() => {
    if (data?.result) {
      const state = fromEntityToState(data.result);
      setForm(state);
    }
  }, [data]);

  const selectedProjectName = useMemo(() => {
    if (!form) return 'Select a project';
    return projectsData?.result?.find(p => p.id === form.projectId)?.name || 'Select a project';
  }, [form?.projectId, projectsData, form]);

  const updateField = <K extends keyof EditFeedbackState>(field: K, value: EditFeedbackState[K]) => {
    setForm(prev => prev ? { ...prev, [field]: value } as EditFeedbackState : prev);
  };

  const handleSubmit = async () => {
    if (!form) return;

    try {
      // Build documents payload based on method and replacements
      let documents: DocumentInput[] | undefined = undefined;

      if (form.feedbackMethod === 'voice') {
        if (form.voiceFeedback?.blob) {
          const fileName = `audio-feedback-${Date.now()}.webm`;
          const file = new File([form.voiceFeedback.blob], fileName, { type: form.voiceFeedback.blob.type });
          const toastId = toast.loading(`Uploading ${fileName}... 0%`);
          try {
            const res = await uploadToCloudinary(file, { onProgress: (p) => toast.update(toastId, { render: `Uploading ${fileName}... ${p}%` }) });
            const documentUrl = res.secureUrl || res.url;
            if (!documentUrl) throw new Error('Upload succeeded but no URL was returned.');
            toast.update(toastId, { render: `Uploaded ${fileName}`, type: 'success', isLoading: false, autoClose: 1200 });
            documents = [{
              documentName: fileName,
              size: file.size,
              type: file.type.split('/')[1],
              documentUrl,
              publicId: res.publicId,
              deleteToken: res.deleteToken,
            }];
          } catch (e: any) {
            toast.update(toastId, { render: e?.message || `Failed uploading ${fileName}`, type: 'error', isLoading: false, autoClose: 2000 });
            throw e;
          }
        } else {
          // keep existing voice doc if present
          const existingVoice = form.existingDocuments.find(d => d.type?.includes('audio') || d.type === 'audio' || d.type === 'mpeg' || d.type === 'webm');
          if (existingVoice) documents = [{
            documentName: existingVoice.documentName,
            documentUrl: existingVoice.documentUrl,
            type: existingVoice.type,
            size: existingVoice.size,
            publicId: existingVoice.publicId,
            deleteToken: existingVoice.deleteToken,
          }];
        }
      }

      if (form.feedbackMethod === 'video') {
        if (form.videoFeedback?.blob) {
          const fileName = `video-feedback-${Date.now()}.webm`;
          const file = new File([form.videoFeedback.blob], fileName, { type: form.videoFeedback.blob.type });
          const toastId = toast.loading(`Uploading ${fileName}... 0%`);
          try {
            const res = await uploadToCloudinary(file, { onProgress: (p) => toast.update(toastId, { render: `Uploading ${fileName}... ${p}%` }) });
            const documentUrl = res.secureUrl || res.url;
            if (!documentUrl) throw new Error('Upload succeeded but no URL was returned.');
            toast.update(toastId, { render: `Uploaded ${fileName}`, type: 'success', isLoading: false, autoClose: 1200 });
            documents = [{
              documentName: fileName,
              size: file.size,
              type: file.type.split('/')[1],
              documentUrl,
              publicId: res.publicId,
              deleteToken: res.deleteToken,
            }];
          } catch (e: any) {
            toast.update(toastId, { render: e?.message || `Failed uploading ${fileName}`, type: 'error', isLoading: false, autoClose: 2000 });
            throw e;
          }
        } else {
          // keep existing video doc if present
          const existingVideo = form.existingDocuments.find(d => d.type?.includes('video') || d.type === 'mp4' || d.type === 'webm');
          if (existingVideo) documents = [{
            documentName: existingVideo.documentName,
            documentUrl: existingVideo.documentUrl,
            type: existingVideo.type,
            size: existingVideo.size,
            publicId: existingVideo.publicId,
            deleteToken: existingVideo.deleteToken,
          }];
        }
      }

      // Construct update payload
      const payload: any = {
        projectId: form.projectId || null,
        feedbackType: form.feedbackType,
        followUpNeeded: form.followUpNeeded,
      };

      if (form.feedbackMethod === 'text') {
        payload.mainMessage = form.mainMessage || undefined;
      } else {
        payload.documents = documents || [];
        // Clear mainMessage for non-text if empty
        payload.mainMessage = form.mainMessage || undefined;
      }

      await updateFeedback.mutateAsync({ id: String(feedbackId), data: payload });
      toast.success('Feedback updated successfully');
      navigate({ to: '/dashboard/feedback' });
    } catch (err) {
      const msg = (err as any)?.response?.data?.message || 'Failed to update feedback';
      toast.error(msg);
    }
  };

  const handleCancel = () => navigate({ to: '/dashboard/feedback' });

  const renderForm = () => {
    if (!form) return null;

    return (
      <div className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
          Editing is restricted to the existing method: <span className="font-semibold capitalize">{form.feedbackMethod}</span>.
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
          <CustomDropdown
            trigger={
              <div className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white cursor-pointer flex justify-between items-center hover:border-primary transition-colors">
                <span className={form.projectId ? 'text-gray-900' : 'text-gray-500'}>{selectedProjectName}</span>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            }
            dropdownClassName="w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {projectsData?.result?.map((project) => (
              <DropdownItem key={project.id} onClick={() => updateField('projectId', project.id)} className="hover:bg-blue-50 py-3">
                {project.name}
              </DropdownItem>
            ))}
          </CustomDropdown>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">Feedback Type</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FEEDBACK_TYPES.map((type) => (
              <div
                key={type.value}
                onClick={() => updateField('feedbackType', type.value as any)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${form.feedbackType === type.value ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{type.icon}</span>
                  <div><h3 className="font-semibold text-gray-900">{type.label}</h3></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {form.feedbackMethod === 'text' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Message</label>
            <textarea
              value={form.mainMessage || ''}
              onChange={(e) => updateField('mainMessage', e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary outline-none focus:border-primary transition-colors"
              placeholder="Please describe your feedback..."
            />
          </div>
        )}

        {form.feedbackMethod === 'voice' && (
          <div className="space-y-3">
            {form.existingDocuments?.length > 0 && !isChangingVoice && (
              <div className="flex flex-col items-center justify-center gap-2">
                <audio controls className="w-full">
                  <source src={form.existingDocuments[0]?.documentUrl} />
                </audio>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors shadow-md"
                  onClick={() => setIsChangingVoice(true)}
                >
                  <FaTrash />
                  <span>Remove</span>
                </motion.button>
              </div>
            )}
            {isChangingVoice && <VoiceFeedback
              voiceFeedback={form.voiceFeedback}
              setVoiceFeedback={(updater) => {
                const next = typeof updater === 'function'
                  ? (updater as (prev: VoiceFeedbackType | null) => VoiceFeedbackType | null)(form.voiceFeedback)
                  : updater;
                updateField('voiceFeedback', next);
              }}
            />}
            <p className="text-xs text-gray-500">Record a new voice note to replace the existing one.</p>
          </div>
        )}

        {form.feedbackMethod === 'video' && (
          <div className="space-y-3">
            {form.existingDocuments?.length > 0 && !isChangingVideo && (
              <div className="flex flex-col items-center justify-center gap-2">
                <video controls className="w-full max-w-2xl rounded">
                  <source src={form.existingDocuments[0]?.documentUrl} />
                </video>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors shadow-md"
                  onClick={() => setIsChangingVideo(true)}
                >
                  <FaTrash />
                  <span>Remove</span>
                </motion.button>
              </div>
            )}
            {isChangingVideo && <VideoFeedback
              videoFeedback={form.videoFeedback}
              setVideoFeedback={(updater) => {
                const next = typeof updater === 'function'
                  ? (updater as (prev: VideoFeedbackType | null) => VideoFeedbackType | null)(form.videoFeedback)
                  : updater;
                updateField('videoFeedback', next);
              }}
            />}
            <p className="text-xs text-gray-500">Record a new video to replace the existing one.</p>
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-lg">
          <label className="flex items-start">
            <input
              type="checkbox"
              checked={!!form.followUpNeeded}
              onChange={(e) => updateField('followUpNeeded', e.target.checked)}
              className="mt-1 rounded border-gray-300 text-primary shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            />
            <div className="ml-3">
              <span className="text-sm font-medium text-gray-900">Request Follow-up</span>
              <p className="text-sm text-gray-600 mt-1">Check this if you would like someone to follow up on this feedback</p>
            </div>
          </label>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      <Breadcrumb items={['dashboard', 'Feedback', 'Edit']} title="Edit Feedback" className='absolute top-0 px-6 left-0 w-full' />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
        <div className="bg-white rounded-lg shadow-lg drop-shadow-2xl border border-gray-200">
          <div className="p-8">
            <AnimatePresence mode="wait">
              {isLoading || !form ? (
                <div className="text-gray-500">Loading...</div>
              ) : (
                <motion.div key="form" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}>
                  {renderForm()}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => handleCancel()}
                className="flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                <FaChevronLeft className="mr-2" />
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={updateFeedback.isPending}
                className="flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium transition-colors disabled:opacity-50"
              >
                {updateFeedback.isPending ? 'Saving...' : (<><FaSave className="mr-2" /> Save Changes</>)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Route = createFileRoute('/dashboard/feedback/edit/$edit-id')({
  component: EditFeedbackComponent,
});
