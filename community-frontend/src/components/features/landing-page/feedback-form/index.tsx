// components/FeedbackForm.tsx
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { sectionVariants } from "../";
import { FaSave } from 'react-icons/fa';

import AnimatedInput from "@/components/ui/animated-input";
import TextFeedback from "./text-feedback";
import VoiceFeedback from "./voice-feedback";
import VideoFeedback from "./video-feedback";

import type {
  FeedbackMethod,
  FormState,
  VoiceFeedback as VoiceFeedbackType,
  VideoFeedback as VideoFeedbackType,
} from "@/types/feedback-types";

// Import backend integration
import { useCreateFeedback } from "@/hooks/useFeedback";
import { uploadToCloudinary } from "@/utility/logicFunctions";
import type { DocumentInput } from "@/api/feedback";
import { cn } from "@/utility/utility";

function FeedbackForm() {
  const [form, setForm] = useState<FormState>({
    name: "",
    message: "",
    feedbackMethod: 'text',
  });

  const [submitted, setSubmitted] = useState(false);
  const { t } = useTranslation();

  // Backend integration
  const createFeedback = useCreateFeedback();

  // Feedback state
  const [voiceFeedback, setVoiceFeedback] = useState<VoiceFeedbackType | null>(null);
  const [videoFeedback, setVideoFeedback] = useState<VideoFeedbackType | null>(null);

  // Cleanup blob URLs to prevent memory leaks
  const cleanupBlobUrls = useCallback(() => {
    if (voiceFeedback && voiceFeedback.url) {
      URL.revokeObjectURL(voiceFeedback.url);
    }
    if (videoFeedback && videoFeedback.url) {
      URL.revokeObjectURL(videoFeedback.url);
    }
  }, [voiceFeedback, videoFeedback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupBlobUrls();
    };
  }, [cleanupBlobUrls]);

  const handleFormChange = (updates: Partial<FormState>) => {
    setForm(prev => ({ ...prev, ...updates }));
  };

  const showErrorToast = (message: string) => {
    toast.error(message, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const handleSubmit = async () => {
    // Validate per method
    if (form.feedbackMethod === 'text' && !form.message.trim()) {
      showErrorToast(t('validation.message_required'));
      return;
    }

    if (form.feedbackMethod === 'voice' && !voiceFeedback) {
      showErrorToast('Please record a voice message.');
      return;
    }

    if (form.feedbackMethod === 'video' && !videoFeedback) {
      showErrorToast('Please record a video message.');
      return;
    }

    try {
      // Upload media files to Cloudinary if present
      const documentsToUpload = [voiceFeedback, videoFeedback].filter(Boolean) as (VoiceFeedbackType | VideoFeedbackType)[];
      const uploadedDocuments: DocumentInput[] = [];

      for (const item of documentsToUpload) {
        const fileType = item.blob.type.split('/')[0]; // 'audio' or 'video'
        const fileName = `${fileType}-feedback-${Date.now()}.webm`;
        const file = new File([item.blob], fileName, { type: item.blob.type });

        const toastId = toast.loading(`Uploading ${fileName}... 0%`);
        try {
          const res = await uploadToCloudinary(file, {
            onProgress: (p) => toast.update(toastId, { render: `Uploading ${fileName}... ${p}%` }),
          });

          const documentUrl = res.secureUrl || res.url;
          if (!documentUrl) {
            throw new Error('Upload succeeded but no URL was returned.');
          }

          toast.update(toastId, { render: `Uploaded ${fileName}`, type: 'success', isLoading: false, autoClose: 1200 });
          uploadedDocuments.push({
            documentName: fileName,
            size: file.size,
            type: file.type.split('/')[1],
            documentUrl: documentUrl,
            publicId: res.publicId,
            deleteToken: res.deleteToken,
          });
        } catch (e: any) {
          toast.update(toastId, { render: e?.message || `Failed uploading ${fileName}`, type: 'error', isLoading: false, autoClose: 2000 });
          throw e;
        }
      }

      // Submit to backend
      await createFeedback.mutateAsync({
        projectId: null, // No project selection in landing page
        responderName: form.name || null,
        mainMessage: form.message || null,
        feedbackType: 'suggestion', // Default type for landing page
        feedbackMethod: form.feedbackMethod,
        followUpNeeded: false, // Default to false for landing page
        documents: uploadedDocuments,
      });

      // Success handling
      setSubmitted(true);
      setForm({ name: "", message: "", feedbackMethod: 'text' });

      // Clean up blob URLs before clearing feedback
      cleanupBlobUrls();
      setVoiceFeedback(null);
      setVideoFeedback(null);

      toast.success(t('feedback.success_message'));
      setTimeout(() => setSubmitted(false), 3000);

    } catch (err) {
      const msg = (err as any)?.response?.data?.message || 'Failed to submit feedback';
      toast.error(msg);
    }
  };

  const feedbackMethods: { value: FeedbackMethod; label: string; icon: string; description: string }[] = [
    { value: 'text', label: t('feedback.feedback_method_text'), icon: '📝', description: t('feedback.feedback_method_text_desc') },
    { value: 'voice', label: t('feedback.feedback_method_voice'), icon: '🎤', description: t('feedback.feedback_method_voice_desc') },
    { value: 'video', label: t('feedback.feedback_method_video'), icon: '📹', description: t('feedback.feedback_method_video_desc') }
  ];

  return (
    <div className="w-full lg:col-span-2 rounded-2xl bg-gray-100 border border-gray-300">
      <div className="max-w-8xl mx-auto  px-3 sm:px-4 lg:p-8 py-6 sm:py-2 pb-4" id="feedback">
        {/* Header Section */}
        <div className="text-center py-2 lg:py-3">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light text-title">{t('feedback.feedback_title')}</h1>
        </div>

        <div className="gap-6 sm:gap-8 lg:gap-12 max-w-7xl mx-auto">
          {/* Right Side - Feedback Form */}
          <motion.div
            className="rounded-lg w-full p-2 flex flex-col justify-between space-y-4 sm:space-y-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={sectionVariants}
            custom={1}
          >
            {/* Single Form Content */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Name Field */}
              <div className="space-y-2">
                <AnimatedInput
                  label={t('feedback.feedback_name')}
                  value={form.name}
                  onChange={(e) => handleFormChange({ name: e.target.value })}
                  disableDarkMode={true}
                />
              </div>

              {/* Feedback Method */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3 mt-4">
                {feedbackMethods.map((method) => (
                  <div className="bg-white rounded-lg">
                    <button
                      key={method.value}
                      type="button"
                      onClick={() => handleFormChange({ feedbackMethod: method.value })}
                      className={cn(`w-full h-full p-3 border rounded-lg text-left transition-colors`, `${form.feedbackMethod === method.value ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'}`)}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-2xl mr-2 p-1 bg-primary/10 rounded-full">{method.icon}</span>
                        <div className="mt-1">
                          <div className="font-medium dark:text-gray-500 text-sm text-center">{method.label}</div>
                          <div className="text-xs sm:text-xs mt-1 text-gray-500 text-center">{method.description}</div>
                        </div>
                      </div>
                    </button>
                  </div>
                ))}
              </div>

              {/* Dynamic Input Area */}
              {form.feedbackMethod === 'text' && (
                <TextFeedback
                  form={form}
                  onFormChange={handleFormChange}
                  onSubmit={handleSubmit}
                  submitted={submitted}
                />
              )}

              {form.feedbackMethod === 'voice' && (
                <VoiceFeedback
                  voiceFeedback={voiceFeedback}
                  setVoiceFeedback={setVoiceFeedback}
                />
              )}

              {form.feedbackMethod === 'video' && (
                <div className="mt-6">
                  <VideoFeedback
                    videoFeedback={videoFeedback}
                    setVideoFeedback={setVideoFeedback}
                  />
                </div>
              )}
            </motion.div>

            {/* Submit */}
            <div className="flex justify-end sm:justify-end items-center">
              <button
                type="button"
                onClick={handleSubmit}
                className="flex items-center justify-center w-full sm:w-auto min-h-[44px] px-5 sm:px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium transition-colors disabled:opacity-50"
                disabled={submitted || createFeedback.isPending}
              >
                {createFeedback.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" />
                    {submitted ? t('feedback.thank_you') : t('button.submit')}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default FeedbackForm;