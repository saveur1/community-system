import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import React, { useState, useRef } from 'react';
import { FaSave, FaArrowLeft, FaMicrophone, FaVideo, FaStop, FaPlay, FaTrash, FaUpload, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Breadcrumb from '@/components/ui/breadcrum';
import { CustomDropdown, DropdownItem } from '@/components/ui/dropdown';

// Type definitions
interface VoiceFeedback {
    id: string;
    blob: Blob;
    duration: number;
    timestamp: Date;
}

interface VideoFeedback {
    id: string;
    blob: Blob;
    duration: number;
    timestamp: Date;
}

interface ImmunizationFeedback {
    programme: string;
    mainMessage: string;
    feedbackType: 'positive' | 'negative' | 'suggestion' | 'concern';
    feedbackMethod: 'text' | 'voice' | 'video';
    suggestions: string;
    followUpNeeded: boolean;
    voiceFeedback: VoiceFeedback[];
    videoFeedback: VideoFeedback[];
}

const CreateFeedbackComponent: React.FC = () => {
    const navigate = useNavigate();
    const [feedback, setFeedback] = useState<ImmunizationFeedback>({
        programme: '',
        mainMessage: '',
        feedbackType: 'positive',
        feedbackMethod: 'text',
        suggestions: '',
        followUpNeeded: false,
        voiceFeedback: [],
        videoFeedback: []
    });

    // Step management
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 3;

    // Voice recording state
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [recordingType, setRecordingType] = useState<'voice' | 'video' | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    // Immunization programmes
    const programmes = [
        'COVID-19 Vaccination',
        'Routine Childhood Immunization',
        'HPV Vaccination',
        'Influenza Vaccination',
        'Hepatitis B Vaccination',
        'Measles-Mumps-Rubella (MMR)',
        'Polio Vaccination',
        'Tetanus-Diphtheria',
        'Other'
    ];

    const feedbackTypes = [
        { value: 'positive', label: 'Positive Experience', color: 'text-green-600', icon: '😊' },
        { value: 'negative', label: 'Negative Experience', color: 'text-red-600', icon: '😞' },
        { value: 'suggestion', label: 'Suggestion for Improvement', color: 'text-blue-600', icon: '💡' },
        { value: 'concern', label: 'Health Concern', color: 'text-orange-600', icon: '⚠️' }
    ];

    const feedbackMethods = [
        { value: 'text', label: 'Text Feedback', icon: '📝', description: 'Write your feedback' },
        { value: 'voice', label: 'Voice Feedback', icon: '🎤', description: 'Record audio message' },
        { value: 'video', label: 'Video Feedback', icon: '📹', description: 'Record video message' }
    ];

    const updateFeedback = <K extends keyof ImmunizationFeedback>(
        field: K,
        value: ImmunizationFeedback[K]
    ): void => {
        setFeedback(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const startRecording = async (type: 'voice' | 'video') => {
        try {
            const constraints = type === 'voice'
                ? { audio: true }
                : { audio: true, video: true };

            const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            setStream(mediaStream);

            if (type === 'video' && videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }

            const recorder = new MediaRecorder(mediaStream);
            const chunks: Blob[] = [];

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunks.push(event.data);
                }
            };

            recorder.onstop = () => {
                const blob = new Blob(chunks, {
                    type: type === 'voice' ? 'audio/webm' : 'video/webm'
                });

                const newFeedbackItem = {
                    id: Date.now().toString(),
                    blob,
                    duration: 0, // You might want to calculate actual duration
                    timestamp: new Date()
                };

                if (type === 'voice') {
                    setFeedback(prev => ({
                        ...prev,
                        voiceFeedback: [...prev.voiceFeedback, newFeedbackItem]
                    }));
                } else {
                    setFeedback(prev => ({
                        ...prev,
                        videoFeedback: [...prev.videoFeedback, newFeedbackItem]
                    }));
                }

                mediaStream.getTracks().forEach(track => track.stop());
                setStream(null);
            };

            setMediaRecorder(recorder);
            setRecordingType(type);
            setIsRecording(true);
            recorder.start();
        } catch (error) {
            console.error('Error starting recording:', error);
            alert('Unable to access microphone/camera. Please check permissions.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            setIsRecording(false);
            setRecordingType(null);
            setMediaRecorder(null);
        }
    };

    const deleteRecording = (type: 'voice' | 'video', id: string) => {
        if (type === 'voice') {
            setFeedback(prev => ({
                ...prev,
                voiceFeedback: prev.voiceFeedback.filter(item => item.id !== id)
            }));
        } else {
            setFeedback(prev => ({
                ...prev,
                videoFeedback: prev.videoFeedback.filter(item => item.id !== id)
            }));
        }
    };

    const nextStep = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const canProceedToNextStep = () => {
        switch (currentStep) {
            case 1:
                return feedback.programme && feedback.feedbackMethod;
            case 2:
                return feedback.feedbackType && (feedback.mainMessage || feedback.voiceFeedback.length > 0 || feedback.videoFeedback.length > 0);
            case 3:
                return true;
            default:
                return false;
        }
    };

    const handleSubmit = () => {
        // Validate required fields
        if (!feedback.programme || (!feedback.mainMessage && feedback.voiceFeedback.length === 0 && feedback.videoFeedback.length === 0)) {
            alert('Please fill in all required fields.');
            return;
        }

        // Here you would typically save to your backend
        console.log('Saving feedback:', feedback);
        alert('Feedback submitted successfully!');
        navigate({ to: '/dashboard/feedback' });
    };

    const handleCancel = () => {
        navigate({ to: '/dashboard/feedback' });
    };

    // Step components
    const renderStepIndicator = () => (
        <div className="flex items-center justify-center mb-8">
            {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                        step === currentStep 
                            ? 'bg-primary text-white' 
                            : step < currentStep 
                                ? 'bg-green-500 text-white' 
                                : 'bg-gray-200 text-gray-600'
                    }`}>
                        {step < currentStep ? '✓' : step}
                    </div>
                    {step < 3 && (
                        <div className={`w-16 h-1 mx-2 ${
                            step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                        }`} />
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
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-title mb-2">How would you like to share your feedback?</h2>
                <p className="text-gray-600">Choose your preferred method and select the programme</p>
            </div>

            {/* Feedback Method Selection */}
            <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                    Feedback Method <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {feedbackMethods.map((method) => (
                        <div
                            key={method.value}
                            onClick={() => updateFeedback('feedbackMethod', method.value as any)}
                            className={`p-6 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                                feedback.feedbackMethod === method.value
                                    ? 'border-primary bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            <div className="text-center">
                                <div className="text-4xl mb-3">{method.icon}</div>
                                <h3 className="font-semibold text-gray-900 mb-2">{method.label}</h3>
                                <p className="text-sm text-gray-600">{method.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Programme Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Programme <span className="text-red-500">*</span>
                </label>
                <CustomDropdown
                    trigger={
                        <div className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary bg-white cursor-pointer flex justify-between items-center hover:border-primary transition-colors">
                            <span className={feedback.programme ? 'text-gray-900' : 'text-gray-500'}>
                                {feedback.programme || 'Select a programme'}
                            </span>
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    }
                    dropdownClassName="w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                >
                    {programmes.map((programme) => (
                        <DropdownItem
                            key={programme}
                            onClick={() => updateFeedback('programme', programme)}
                            className="hover:bg-blue-50 py-3"
                        >
                            {programme}
                        </DropdownItem>
                    ))}
                </CustomDropdown>
            </div>
        </motion.div>
    );

    const renderStep2 = () => (
        <motion.div
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-title mb-2">Tell us about your experience</h2>
                <p className="text-gray-600">Share your feedback about the {feedback.programme} programme</p>
            </div>

            {/* Feedback Type */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                    What type of feedback is this?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {feedbackTypes.map((type) => (
                        <div
                            key={type.value}
                            onClick={() => updateFeedback('feedbackType', type.value as any)}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                                feedback.feedbackType === type.value
                                    ? 'border-primary bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            <div className="flex items-center space-x-3">
                                <span className="text-2xl">{type.icon}</span>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{type.label}</h3>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Message Input based on feedback method */}
            {feedback.feedbackMethod === 'text' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={feedback.mainMessage}
                        onChange={(e) => updateFeedback('mainMessage', e.target.value)}
                        rows={6}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary transition-colors"
                        placeholder="Please describe your feedback about the immunization service..."
                    />
                </div>
            )}

            {/* Voice/Video Recording */}
            {(feedback.feedbackMethod === 'voice' || feedback.feedbackMethod === 'video') && (
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">
                        Record Your {feedback.feedbackMethod === 'voice' ? 'Voice' : 'Video'} Message <span className='text-red-500'>*</span>
                    </label>
                    
                    {/* Recording Controls */}
                    <div className="flex justify-center space-x-4">
                        <button
                            type="button"
                            onClick={() => startRecording(feedback.feedbackMethod as 'voice' | 'video')}
                            disabled={isRecording}
                            className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                                feedback.feedbackMethod === 'voice'
                                    ? 'bg-green-600 hover:bg-green-700 text-white'
                                    : 'bg-primary hover:bg-primary-dark text-white'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {feedback.feedbackMethod === 'voice' ? <FaMicrophone className='mr-2' /> : <FaVideo className='mr-2' />}
                            {isRecording && recordingType === feedback.feedbackMethod 
                                ? 'Recording...' 
                                : `Record ${feedback.feedbackMethod === `voice` ? `Voice` : `Video`}`
                            }
                        </button>

                        {isRecording && (
                            <button
                                type="button"
                                onClick={stopRecording}
                                className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
                            >
                                <FaStop className="mr-2" />
                                Stop Recording
                            </button>
                        )}
                    </div>

                    {/* Video Preview */}
                    {isRecording && recordingType === 'video' && (
                        <div className="flex justify-center mt-4">
                            <video
                                ref={videoRef}
                                autoPlay
                                muted
                                className="w-full max-w-md h-48 bg-gray-900 rounded-lg"
                            />
                        </div>
                    )}

                    {/* Recorded Items */}
                    {((feedback.feedbackMethod === 'voice' && feedback.voiceFeedback.length > 0) || 
                      (feedback.feedbackMethod === 'video' && feedback.videoFeedback.length > 0)) && (
                        <div className="space-y-3">
                            <h4 className="font-medium text-gray-900">Recorded Messages</h4>
                            
                            {feedback.feedbackMethod === 'voice' && feedback.voiceFeedback.map((voice) => (
                                <div key={voice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center">
                                        <FaMicrophone className="text-green-600 mr-3" />
                                        <span className="text-sm text-gray-700">
                                            Voice recording from {voice.timestamp.toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => deleteRecording('voice', voice.id)}
                                        className="text-red-600 hover:text-red-800 transition-colors"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            ))}

                            {feedback.feedbackMethod === 'video' && feedback.videoFeedback.map((video) => (
                                <div key={video.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center">
                                        <FaVideo className="text-primary mr-3" />
                                        <span className="text-sm text-gray-700">
                                            Video recording from {video.timestamp.toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => deleteRecording('video', video.id)}
                                        className="text-red-600 hover:text-red-800 transition-colors"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </motion.div>
    );

    const renderStep3 = () => (
        <motion.div
            key="step3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-title mb-2">Final Details</h2>
                <p className="text-gray-600">Help us improve our services with your suggestions</p>
            </div>


            {/* Suggestions */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Suggestions for Improvement
                </label>
                <textarea
                    value={feedback.suggestions}
                    onChange={(e) => updateFeedback('suggestions', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary transition-colors"
                    placeholder="How can we improve our immunization services?"
                />
            </div>

            {/* Follow-up */}
            <div className="bg-gray-50 p-4 rounded-lg">
                <label className="flex items-start">
                    <input
                        type="checkbox"
                        checked={feedback.followUpNeeded}
                        onChange={(e) => updateFeedback('followUpNeeded', e.target.checked)}
                        className="mt-1 rounded border-gray-300 text-primary shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                    />
                    <div className="ml-3">
                        <span className="text-sm font-medium text-gray-900">
                            Request Follow-up
                        </span>
                        <p className="text-sm text-gray-600 mt-1">
                            Check this if you would like someone from our team to follow up on this feedback
                        </p>
                    </div>
                </label>
            </div>
        </motion.div>
    );

    return (
        <div className="absolute w-full left-0">
            {/* Breadcrumb */}
            <Breadcrumb
                items={[
                    'dashboard',
                    'Feedback',
                    'Add New'
                ]}
                title="Add New Feedback"
                className='absolute top-0 px-6 left-0 w-full'
            />

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pb-12">
                <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                    <div className="p-8">
                        {/* Step Indicator */}
                        {renderStepIndicator()}

                        {/* Step Content */}
                        <AnimatePresence mode="wait">
                            {currentStep === 1 && renderStep1()}
                            {currentStep === 2 && renderStep2()}
                            {currentStep === 3 && renderStep3()}
                        </AnimatePresence>

                        {/* Navigation Buttons */}
                        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={currentStep === 1 ? handleCancel : prevStep}
                                className="flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
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
                                    className="flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                    <FaChevronRight className="ml-2" />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    className="flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium transition-colors"
                                >
                                    <FaSave className="mr-2" />
                                    Submit Feedback
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const Route = createFileRoute('/community/feedback/add-new')({
    component: CreateFeedbackComponent,
});
