import { createFileRoute, useNavigate } from '@tanstack/react-router';
import React, { useState, useMemo } from 'react';
import { FaSave, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Breadcrumb from '@/components/ui/breadcrum';
import { useProjectsList } from '@/hooks/useProjects';
import { useCreateFeedback } from '@/hooks/useFeedback';
import type { DocumentInput } from '@/api/feedback';
import type { VoiceFeedback as VoiceFeedbackType, VideoFeedback as VideoFeedbackType } from '@/types/feedback-types';
import VoiceFeedback from '@/components/features/landing-page/feedback-form/voice-feedback';
import VideoFeedback from '@/components/features/landing-page/feedback-form/video-feedback';
import { uploadToCloudinary } from '@/utility/logicFunctions';
import { toast } from 'react-toastify';

interface FeedbackFormState {
    projectId: string;
    mainMessage: string;
    feedbackType: 'positive' | 'negative' | 'suggestion' | 'concern';
    feedbackMethod: 'text' | 'voice' | 'video';
    followUpNeeded: boolean;
    voiceFeedback: VoiceFeedbackType | null;
    videoFeedback: VideoFeedbackType | null;
    otherFeedbackOn: string;
}

const CreateFeedbackComponent: React.FC = () => {
    const navigate = useNavigate();
    const { data: projectsData } = useProjectsList({ limit: 100 }); // Fetch projects
    const createFeedback = useCreateFeedback();

    const [feedback, setFeedback] = useState<FeedbackFormState>({
        projectId: '',
        mainMessage: '',
        feedbackType: 'positive',
        feedbackMethod: 'text',
        followUpNeeded: false,
        voiceFeedback: null,
        videoFeedback: null,
        otherFeedbackOn: ''
    });

    // Step management
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 2;

    const selectedProjectName = useMemo(() => {
        if (feedback.projectId === 'other') {
            return feedback.otherFeedbackOn || 'Other';
        }
        return projectsData?.result?.find(p => p.id === feedback.projectId)?.name || 'Select a project';
    }, [feedback.projectId, feedback.otherFeedbackOn, projectsData]);

    const feedbackTypes = [
        { value: 'positive', label: 'Positive Experience', icon: '😊' },
        { value: 'negative', label: 'Negative Experience', icon: '😞' },
        { value: 'suggestion', label: 'Suggestion for Improvement', icon: '💡' },
        { value: 'concern', label: 'Health Concern', icon: '⚠️' }
    ];

    const feedbackMethods = [
        { value: 'text', label: 'Text Feedback', icon: '📝', description: 'Write your feedback' },
        { value: 'voice', label: 'Voice Feedback', icon: '🎤', description: 'Record audio message' },
        { value: 'video', label: 'Video Feedback', icon: '📹', description: 'Record video message' }
    ];

    const updateFeedback = <K extends keyof FeedbackFormState>(
        field: K,
        value: React.SetStateAction<FeedbackFormState[K]>
    ): void => {
        setFeedback(prev => ({
            ...prev,
            [field]: typeof value === 'function'
                ? (value as (prevState: FeedbackFormState[K]) => FeedbackFormState[K])(prev[field])
                : value
        }));
    };

    const nextStep = () => currentStep < totalSteps && setCurrentStep(currentStep + 1);
    const prevStep = () => currentStep > 1 && setCurrentStep(currentStep - 1);

    // Effect for cleaning up blob URLs
    React.useEffect(() => {
        return () => {
            if (feedback.voiceFeedback?.blob) {
                URL.revokeObjectURL(URL.createObjectURL(feedback.voiceFeedback.blob));
            }
            if (feedback.videoFeedback?.blob) {
                URL.revokeObjectURL(URL.createObjectURL(feedback.videoFeedback.blob));
            }
        };
    }, [feedback.voiceFeedback, feedback.videoFeedback]);

    const canProceedToNextStep = () => {
        switch (currentStep) {
            case 1:
                return feedback.projectId && feedback.feedbackMethod &&
                    (feedback.projectId !== 'other' || feedback.otherFeedbackOn.trim());
            case 2:
                return feedback.feedbackType && (feedback.mainMessage || feedback.voiceFeedback || feedback.videoFeedback);
            default:
                return true;
        }
    };

    const handleSubmit = async () => {
        if (!feedback.projectId || (!feedback.mainMessage && !feedback.voiceFeedback && !feedback.videoFeedback)) {
            toast.error('Please fill in all required fields.');
            return;
        }

        if (feedback.projectId === 'other' && !feedback.otherFeedbackOn.trim()) {
            toast.error('Please specify what you are providing feedback on.');
            return;
        }

        try {
            const documentsToUpload = [feedback.voiceFeedback, feedback.videoFeedback].filter(Boolean) as (VoiceFeedbackType | VideoFeedbackType)[];
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

            await createFeedback.mutateAsync({
                projectId: feedback.projectId === 'other' ? undefined : feedback.projectId,
                mainMessage: feedback.mainMessage || null,
                feedbackType: feedback.feedbackType,
                feedbackMethod: feedback.feedbackMethod,
                followUpNeeded: feedback.followUpNeeded,
                documents: uploadedDocuments,
                otherFeedbackOn: feedback.projectId === 'other' ? feedback.otherFeedbackOn : undefined,
            });

            toast.success('Feedback submitted successfully!');
            navigate({ to: '/dashboard/feedback' });

        } catch (err) {
            const msg = (err as any)?.response?.data?.message || 'Failed to submit feedback';
            toast.error(msg);
        }
    };

    const handleCancel = () => navigate({ to: '/dashboard/feedback' });

    const renderStepIndicator = () => (
        <div className="flex items-center justify-center mb-6 sm:mb-8">
            {[1, 2].map((step) => (
                <div key={step} className="flex items-center">
                    <div
                        className={`w-8 sm:w-10 h-8 sm:h-10 rounded-full flex items-center justify-center text-sm font-medium ${step === currentStep
                            ? 'bg-primary text-white'
                            : step < currentStep
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 text-gray-600'
                            }`}
                    >
                        {step < currentStep ? '✓' : step}
                    </div>
                    {step < 2 && (
                        <div
                            className={`w-12 sm:w-16 h-1 mx-1 sm:mx-2 ${step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                                }`}
                        />
                    )}
                </div>
            ))}
        </div>
    );

    const renderStep1 = () => (
        <motion.div
            key="step1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-title mb-2">
                    How would you like to share your feedback?
                </h2>
                <p className="text-gray-600 text-sm sm:text-base">
                    Choose your preferred method and select the project
                </p>
            </div>
            <div className="space-y-4">
                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-4">
                    Feedback Method <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {feedbackMethods.map((method) => (
                        <div
                            key={method.value}
                            onClick={() => updateFeedback('feedbackMethod', method.value as any)}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${feedback.feedbackMethod === method.value
                                ? 'border-primary bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <div className="text-center">
                                <div className="text-3xl sm:text-4xl mb-2">{method.icon}</div>
                                <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
                                    {method.label}
                                </h3>
                                <p className="text-sm text-gray-600">{method.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div>
                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-4">
                    Share feedback On <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                    {projectsData?.result?.map((project) => (
                        <label
                            key={project.id}
                            className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer transition-colors"
                        >
                            <input
                                type="radio"
                                name="projectId"
                                value={project.id}
                                checked={feedback.projectId === project.id}
                                onChange={(e) => updateFeedback('projectId', e.target.value)}
                                className="mr-3 text-primary focus:ring-primary scale-125 sm:scale-150"
                                aria-label={`Select project ${project.name}`}
                            />
                            <span className="text-gray-900 text-sm sm:text-base">{project.name}</span>
                        </label>
                    ))}
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer transition-colors">
                        <input
                            type="radio"
                            name="projectId"
                            value="other"
                            checked={feedback.projectId === 'other'}
                            onChange={(e) => updateFeedback('projectId', e.target.value)}
                            className="mr-3 text-primary focus:ring-primary scale-125 sm:scale-150"
                            aria-label="Select other project"
                        />
                        <span className="text-gray-900 text-sm sm:text-base">Other</span>
                    </label>
                    {feedback.projectId === 'other' && (
                        <div className="ml-6">
                            <input
                                type="text"
                                value={feedback.otherFeedbackOn}
                                onChange={(e) => updateFeedback('otherFeedbackOn', e.target.value)}
                                placeholder="Please specify..."
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary outline-none focus:border-primary transition-colors text-sm sm:text-base"
                            />
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );

    const renderStep2 = () => (
        <motion.div key="step2" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }} className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-title mb-2">Tell us about your experience</h2>
                <p className="text-gray-600">Share your feedback about the {selectedProjectName}</p>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">What type of feedback is this?</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {feedbackTypes.map((type) => (
                        <div key={type.value} onClick={() => updateFeedback('feedbackType', type.value as any)} className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${feedback.feedbackType === type.value ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                            <div className="flex items-center space-x-3">
                                <span className="text-2xl">{type.icon}</span>
                                <div><h3 className="font-semibold text-gray-900">{type.label}</h3></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {feedback.feedbackMethod === 'text' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Message <span className="text-red-500">*</span></label>
                    <textarea value={feedback.mainMessage} onChange={(e) => updateFeedback('mainMessage', e.target.value)} rows={6} className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary outline-none focus:border-primary transition-colors" placeholder="Please describe your feedback..." />
                </div>
            )}
            {feedback.feedbackMethod === 'voice' && (
                <VoiceFeedback
                    voiceFeedback={feedback.voiceFeedback}
                    setVoiceFeedback={(value) => updateFeedback('voiceFeedback', value)}
                />
            )}
            {feedback.feedbackMethod === 'video' && (
                <VideoFeedback
                    videoFeedback={feedback.videoFeedback}
                    setVideoFeedback={(value) => updateFeedback('videoFeedback', value)}
                />
            )}

            <div className="bg-gray-50 p-4 rounded-lg">
                <label className="flex items-start">
                    <input type="checkbox" checked={feedback.followUpNeeded} onChange={(e) => updateFeedback('followUpNeeded', e.target.checked)} className="mt-1 rounded border-gray-300 text-primary shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50" />
                    <div className="ml-3">
                        <span className="text-sm font-medium text-gray-900">Request Follow-up</span>
                        <p className="text-sm text-gray-600 mt-1">Check this if you would like someone to follow up on this feedback</p>
                    </div>
                </label>
            </div>
        </motion.div>
    );

    return (
        <div className="w-full">
            <Breadcrumb
                items={['dashboard', 'Feedback', 'Add New']}
                title="Add New Feedback"
                className="absolute w-full left-0 top-0 px-4 sm:px-6 pt-4"
            />
            <div className="max-w-4xl mx-auto sm:px-4 max-sm:px-2 lg:px-8 pt-20 pb-8 sm:pb-12 w-full">
                <div className="bg-white rounded-lg shadow-lg drop-shadow-2xl border border-gray-200">
                    <div className="p-6 sm:p-8 max-sm:px-3">
                        {renderStepIndicator()}
                        <AnimatePresence mode="wait">
                            {currentStep === 1 && renderStep1()}
                            {currentStep === 2 && renderStep2()}
                        </AnimatePresence>
                        <div className="flex justify-between items-center mt-6 sm:mt-8 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={currentStep === 1 ? handleCancel : prevStep}
                                className="flex items-center px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors text-sm sm:text-base"
                            >
                                <FaChevronLeft className="mr-2" />
                                {currentStep === 1 ? 'Cancel' : 'Back'}
                            </button>
                            <div className="text-sm text-gray-500">
                                Step {currentStep} of {totalSteps}
                            </div>
                            {currentStep < totalSteps ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    disabled={!canProceedToNextStep()}
                                    className="flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                                >
                                    Next <FaChevronRight className="ml-2" />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={createFeedback.isPending}
                                    className="flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium transition-colors disabled:opacity-50 text-sm sm:text-base"
                                >
                                    {createFeedback.isPending ? (
                                        'Submitting...'
                                    ) : (
                                        <>
                                            <FaSave className="mr-2" /> Submit Feedback
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const Route = createFileRoute('/dashboard/feedback/add-new')({
    component: CreateFeedbackComponent,
});