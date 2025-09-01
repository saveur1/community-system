import { createFileRoute, useNavigate } from '@tanstack/react-router';
import React, { useState, useRef, useMemo } from 'react';
import { FaSave, FaMicrophone, FaVideo, FaStop, FaTrash, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Breadcrumb from '@/components/ui/breadcrum';
import { CustomDropdown, DropdownItem } from '@/components/ui/dropdown';
import { useProjectsList } from '@/hooks/useProjects';
import { useCreateFeedback } from '@/hooks/useFeedback';
import { DocumentInput } from '@/api/feedback';
import { VoiceFeedback as VoiceFeedbackType, VideoFeedback as VideoFeedbackType } from '@/types/feedback-types';
import VoiceFeedback from '@/components/features/landing-page/feedback-form/voice-feedback';
import VideoFeedback from '@/components/features/landing-page/feedback-form/video-feedback';
import { useAuth } from '@/hooks/useAuth';
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
}

const CreateFeedbackComponent: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { data: projectsData } = useProjectsList({ limit: 100 }); // Fetch projects
    const createFeedback = useCreateFeedback();

    const [feedback, setFeedback] = useState<FeedbackFormState>({
        projectId: '',
        mainMessage: '',
        feedbackType: 'positive',
        feedbackMethod: 'text',
        followUpNeeded: false,
        voiceFeedback: null,
        videoFeedback: null
    });

    // Step management
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 2;


    const selectedProjectName = useMemo(() => {
        return projectsData?.result?.find(p => p.id === feedback.projectId)?.name || 'Select a project';
    }, [feedback.projectId, projectsData]);

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
            case 1: return feedback.projectId && feedback.feedbackMethod;
            case 2: return feedback.feedbackType && (feedback.mainMessage || feedback.voiceFeedback || feedback.videoFeedback);
            default: return true;
        }
    };

    const handleSubmit = async () => {
        if (!feedback.projectId || (!feedback.mainMessage && !feedback.voiceFeedback && !feedback.videoFeedback)) {
            toast.error('Please fill in all required fields.');
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
                projectId: feedback.projectId,
                mainMessage: feedback.mainMessage || null,
                feedbackType: feedback.feedbackType,
                feedbackMethod: feedback.feedbackMethod,
                followUpNeeded: feedback.followUpNeeded,
                documents: uploadedDocuments,
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
        <div className="flex items-center justify-center mb-8">
            {[1, 2].map((step) => (
                <div key={step} className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                        step === currentStep ? 'bg-primary text-white' : step < currentStep ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                        {step < currentStep ? '✓' : step}
                    </div>
                    {step < 2 && <div className={`w-16 h-1 mx-2 ${step < currentStep ? 'bg-green-500' : 'bg-gray-200'}`} />}
                </div>
            ))}
        </div>
    );

    const renderStep1 = () => (
        <motion.div key="step1" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }} className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-title mb-2">How would you like to share your feedback?</h2>
                <p className="text-gray-600">Choose your preferred method and select the project</p>
            </div>
            <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 mb-4">Feedback Method <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {feedbackMethods.map((method) => (
                        <div key={method.value} onClick={() => updateFeedback('feedbackMethod', method.value as any)} className={`p-6 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${feedback.feedbackMethod === method.value ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                            <div className="text-center">
                                <div className="text-4xl mb-3">{method.icon}</div>
                                <h3 className="font-semibold text-gray-900 mb-2">{method.label}</h3>
                                <p className="text-sm text-gray-600">{method.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project <span className="text-red-500">*</span></label>
                <CustomDropdown
                    trigger={
                        <div className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary bg-white cursor-pointer flex justify-between items-center hover:border-primary transition-colors">
                            <span className={feedback.projectId ? 'text-gray-900' : 'text-gray-500'}>{selectedProjectName}</span>
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    }
                    dropdownClassName="w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                >
                    {projectsData?.result?.map((project) => (
                        <DropdownItem key={project.id} onClick={() => updateFeedback('projectId', project.id)} className="hover:bg-blue-50 py-3">
                            {project.name}
                        </DropdownItem>
                    ))}
                </CustomDropdown>
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
            <Breadcrumb items={['dashboard', 'Feedback', 'Add New']} title="Add New Feedback" className='absolute top-0 px-6 left-0 w-full' />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
                <div className="bg-white rounded-lg shadow-lg drop-shadow-2xl border border-gray-200">
                    <div className="p-8">
                        {renderStepIndicator()}
                        <AnimatePresence mode="wait">
                            {currentStep === 1 && renderStep1()}
                            {currentStep === 2 && renderStep2()}
                        </AnimatePresence>
                        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                            <button type="button" onClick={currentStep === 1 ? handleCancel : prevStep} className="flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors">
                                <FaChevronLeft className="mr-2" />
                                {currentStep === 1 ? 'Cancel' : 'Back'}
                            </button>
                            <div className="text-sm text-gray-500">Step {currentStep} of {totalSteps}</div>
                            {currentStep < totalSteps ? (
                                <button type="button" onClick={nextStep} disabled={!canProceedToNextStep()} className="flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                    Next <FaChevronRight className="ml-2" />
                                </button>
                            ) : (
                                <button type="button" onClick={handleSubmit} disabled={createFeedback.isPending} className="flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium transition-colors disabled:opacity-50">
                                    {createFeedback.isPending ? 'Submitting...' : <><FaSave className="mr-2" /> Submit Feedback</>}
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
