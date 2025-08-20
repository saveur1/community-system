import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { sectionVariants } from ".";
import ViewMorePrograms from "./view-more-programes";
import { FaSave, FaChevronLeft, FaChevronRight, FaMicrophone, FaVideo, FaStop, FaPlay, FaTrash, FaCircle } from 'react-icons/fa';

function FeedbackForm() {
  const [form, setForm] = useState({
    name: "",
    programmes: [] as string[], // Changed to array for multiple selection
    otherProgramme: "", // New field for "Others" input
    message: "",
    // Stepper additional fields
    feedbackType: 'positive' as 'positive' | 'negative' | 'suggestion' | 'concern',
    feedbackMethod: 'text' as 'text' | 'voice' | 'video',
    suggestions: "",
    followUpNeeded: false,
  });

  const [touched, setTouched] = useState({
    name: false,
    programmes: false,
    message: false
  });

  const [submitted, setSubmitted] = useState(false);
  const { t } = useTranslation();

  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;

  // Recording state (minimal)
  type VoiceFeedback = { id: string; blob: Blob; duration: number; timestamp: Date };
  type VideoFeedback = { id: string; blob: Blob; duration: number; timestamp: Date };
  const [voiceFeedback, setVoiceFeedback] = useState<VoiceFeedback[]>([]);
  const [videoFeedback, setVideoFeedback] = useState<VideoFeedback[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingType, setRecordingType] = useState<'voice' | 'video' | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [showVideoPreview, setShowVideoPreview] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const timerRef = React.useRef<number | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleProgrammeChange = (value: string) => {
    setTouched({ ...touched, programmes: true });
    setForm(prev => {
      const newProgrammes = prev.programmes.includes(value)
        ? prev.programmes.filter(p => p !== value)
        : [...prev.programmes, value];
      return { ...prev, programmes: newProgrammes };
    });
  };

  const validate = () => {
    return {
      name: !form.name.trim(),
      programmes: form.programmes.length === 0 && !form.otherProgramme.trim(),
      message: !form.message.trim()
    };
  };

  const errors = validate();
  const isValid = !errors.name && !errors.programmes && !errors.message;

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

  const handleSubmit = () => {
    setTouched({ name: true, programmes: true, message: true });

    // Step 2 validation depending on method
    if (form.feedbackMethod === 'text') {
      if (!isValid) {
        if (errors.name) showErrorToast(t('validation.name_required'));
        if (errors.programmes) showErrorToast(t('validation.programme_required'));
        if (errors.message) showErrorToast(t('validation.message_required'));
        return;
      }
    } else if (form.feedbackMethod === 'voice') {
      if (!form.name.trim()) showErrorToast(t('validation.name_required'));
      if (form.programmes.length === 0 && !form.otherProgramme.trim()) showErrorToast(t('validation.programme_required'));
      if (voiceFeedback.length === 0) {
        showErrorToast('Please record a voice message.');
        return;
      }
    } else if (form.feedbackMethod === 'video') {
      if (!form.name.trim()) showErrorToast(t('validation.name_required'));
      if (form.programmes.length === 0 && !form.otherProgramme.trim()) showErrorToast(t('validation.programme_required'));
      if (videoFeedback.length === 0) {
        showErrorToast('Please record a video message.');
        return;
      }
    }

    // Form is valid - proceed with submission
    setSubmitted(true);
    setForm({
      name: "",
      programmes: [],
      otherProgramme: "",
      message: "",
      feedbackType: 'positive',
      feedbackMethod: 'text',
      suggestions: "",
      followUpNeeded: false,
    });
    setVoiceFeedback([]);
    setVideoFeedback([]);
    toast.success(t('feedback.success_message'), {
      position: "top-center",
      autoClose: 3000,
    });
    setTimeout(() => setSubmitted(false), 3000);
  };

  const startRecording = async (type: 'voice' | 'video') => {
    try {
      const constraints = type === 'voice' ? { audio: true } : { audio: true, video: true };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (type === 'video' && videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setShowVideoPreview(true);
      }

      const recorder = new MediaRecorder(mediaStream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };
      const startTime = Date.now();
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: type === 'voice' ? 'audio/webm' : 'video/webm' });
        const duration = Math.round((Date.now() - startTime) / 1000);
        const item = { id: Math.random().toString(36).slice(2), blob, duration, timestamp: new Date() };
        if (type === 'voice') setVoiceFeedback((prev) => [...prev, item]);
        else setVideoFeedback((prev) => [...prev, item]);
        
        // Clean up stream
        mediaStream.getTracks().forEach((track) => track.stop());
        setStream(null);
        
        // Hide video preview when stopping video recording
        if (type === 'video') {
          setShowVideoPreview(false);
        }
      };

      recorder.start();
      setIsRecording(true);
      setRecordingType(type);
      setMediaRecorder(recorder);
      // start timer
      setRecordingSeconds(0);
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = window.setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      console.error(err);
      showErrorToast('Unable to start recording. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setRecordingType(null);
      setMediaRecorder(null);
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const deleteRecording = (type: 'voice' | 'video', id: string) => {
    if (type === 'voice') setVoiceFeedback((prev) => prev.filter((v) => v.id !== id));
    else setVideoFeedback((prev) => prev.filter((v) => v.id !== id));
  };

  const nextStep = () => {
    if (currentStep < totalSteps && canProceedToNextStep()) {
      setCurrentStep((s) => s + 1);
    } else if (!canProceedToNextStep()) {
      // Step 1 requires only name
      setTouched({ ...touched, name: true });
      if (!form.name.trim()) showErrorToast(t('validation.name_required'));
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const canProceedToNextStep = () => {
    if (currentStep === 1) {
      return !!form.name.trim();
    }
    return true;
  };

  // Feedback type still available but not shown in step 1 as per request
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

  const renderStep1 = () => (
    <motion.div
      key="step1"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      {/* Name Field */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700" htmlFor="name">
          {t('feedback.feedback_name')} <span className="text-red-500">*</span>
        </label>
        <input
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50"
          type="text"
          id="name"
          name="name"
          placeholder="John Doe"
          value={form.name}
          onChange={handleChange}
          onBlur={() => setTouched({ ...touched, name: true })}
          aria-required="true"
        />
      </div>

      {/* Feedback Method */}
      <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">Feedback Method</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {feedbackMethods.map((method) => (
          <button
            key={method.value}
            type="button"
            onClick={() => setForm({ ...form, feedbackMethod: method.value as any })}
            className={`p-2 border rounded-lg text-left transition-colors ${form.feedbackMethod === method.value ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary'
              }`}
          >
            <div className="flex items-center">
              <span className="text-2xl mr-2">{method.icon}</span>
              <div>
                <div className="font-medium">{method.label}</div>
                <div className="text-sm text-gray-500">{method.description}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      key="step2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      {/* Programme Selection (checkboxes preserved) */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">
          {t('feedback.programme')} <span className="text-red-500">*</span>
        </label>

        <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
          {programmeOptions.map((option) => (
            <div key={option.value} className="flex items-center">
              <input
                type="checkbox"
                id={`programme-${option.value}`}
                name="programmes"
                value={option.value}
                checked={form.programmes.includes(option.value)}
                onChange={() => handleProgrammeChange(option.value)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
              />
              <label
                htmlFor={`programme-${option.value}`}
                className="ml-3 block text-sm text-gray-700 cursor-pointer hover:text-gray-900"
              >
                {option.label}
              </label>
            </div>
          ))}

          {/* Others option with text input */}
          <div className="flex items-center">
            <ViewMorePrograms />
          </div>
        </div>
      </div>

      {/* Message or Recording */}
      {form.feedbackMethod === 'text' && (
        <div className="space-y-2 mt-6">
          <label className="text-sm font-medium text-gray-700" htmlFor="message">
            {t('feedback.feedback_field')} <span className="text-red-500">*</span>
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none min-h-[120px] bg-gray-50"
            id="message"
            name="message"
            placeholder="Type away..."
            value={form.message}
            onChange={handleChange}
            onBlur={() => setTouched({ ...touched, message: true })}
            required
            aria-required="true"
          />
        </div>
      )}

      {form.feedbackMethod === 'voice' && (
        <div className="mt-6">
          <div className="flex items-center gap-3">
            {!isRecording ? (
              <button type="button" onClick={() => startRecording('voice')} className="flex items-center px-4 py-2 bg-primary text-white rounded-lg">
                <FaMicrophone className="mr-2" /> Start Voice Recording
              </button>
            ) : (
              <button type="button" onClick={stopRecording} className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg">
                <FaStop className="mr-2" /> Stop Recording
              </button>
            )}
            {isRecording && recordingType === 'voice' && (
              <div className="ml-3 flex items-center text-red-600">
                <FaCircle className="animate-pulse mr-2" />
                <span className="font-medium">Recording... {recordingSeconds}s</span>
              </div>
            )}
          </div>
          {voiceFeedback.length > 0 && (
            <div className="mt-4 space-y-3">
              {voiceFeedback.map((v) => (
                <div key={v.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3 w-full">
                    <audio
                      className="w-full"
                      src={URL.createObjectURL(v.blob)}
                      controls
                      onPlay={() => setPlayingAudioId(v.id)}
                      onPause={() => setPlayingAudioId((id) => (id === v.id ? null : id))}
                      onEnded={() => setPlayingAudioId((id) => (id === v.id ? null : id))}
                    />
                    {playingAudioId === v.id ? (
                      <span className="flex items-center text-green-600 animate-pulse"><FaPlay className="mr-1" /> Playing</span>
                    ) : (
                      <span className="text-sm text-gray-500 whitespace-nowrap">{v.duration}s</span>
                    )}
                    <span className="text-sm text-gray-400 whitespace-nowrap">{v.timestamp.toLocaleString()}</span>
                  </div>
                  <button type="button" onClick={() => deleteRecording('voice', v.id)} className="text-red-600 hover:underline flex items-center">
                    <FaTrash className="mr-1" /> Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {form.feedbackMethod === 'video' && (
        <div className="mt-6">
          <div className="flex items-center gap-3 mb-4">
            {!isRecording ? (
              <button type="button" onClick={() => startRecording('video')} className="flex items-center px-4 py-2 bg-primary text-white rounded-lg">
                <FaVideo className="mr-2" /> Start Video Recording
              </button>
            ) : (
              <button type="button" onClick={stopRecording} className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg">
                <FaStop className="mr-2" /> Stop Recording
              </button>
            )}
            {isRecording && recordingType === 'video' && (
              <div className="ml-3 flex items-center text-red-600">
                <FaCircle className="animate-pulse mr-2" />
                <span className="font-medium">Recording... {recordingSeconds}s</span>
              </div>
            )}
          </div>
          
          {/* Live Camera Preview during recording */}
          {showVideoPreview && isRecording && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Live Camera Preview</h4>
              <video 
                ref={videoRef} 
                autoPlay 
                muted 
                className="w-full max-w-md rounded-lg border border-gray-300 shadow-sm" 
              />
            </div>
          )}
          
          {/* Recorded Videos */}
          {videoFeedback.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Recorded Videos</h4>
              {videoFeedback.map((v) => (
                <div key={v.id} className="flex items-start justify-between p-3 border rounded-lg">
                  <video 
                    controls 
                    className="w-80 max-w-full rounded border"
                    style={{ minWidth: '320px' }}
                  >
                    <source src={URL.createObjectURL(v.blob)} type="video/webm" />
                  </video>
                  <div className="flex flex-col items-end gap-2 ml-4">
                    <span className="text-sm text-gray-500">{v.duration}s</span>
                    <span className="text-xs text-gray-400">{v.timestamp.toLocaleString()}</span>
                    <button 
                      type="button" 
                      onClick={() => deleteRecording('video', v.id)} 
                      className="text-red-600 hover:underline flex items-center text-sm"
                    >
                      <FaTrash className="mr-1" /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );

  // No step 3 anymore

  // Programme options for checkboxes
  const programmeOptions = [
    { value: "HIV/AIDS", label: "HIV/AIDS" },
    { value: "Immunization", label: "Immunization (SUGIRA MWANA)" },
    { value: "Mental Health", label: "Mental Health (Baho Neza)" },
    { value: "Malaria", label: "Malaria SBC" },
    { value: "Data-Driven Health", label: "Data-Driven Health" }
  ];

  return (
    <div className="max-w-8xl mx-auto w-full rounded-xl bg-gray-100 py-16 px-4">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-light text-title mb-2">{t('feedback.feedback_title')}</h1>
        <p className="text-lg text-gray-600">Share your feedback, Shape the future of community services</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
        {/* Left Side - Contact Details */}
        <motion.div
          className="flex flex-col justify-between py-2"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
          custom={-1}
        >
          {/* Our Contact Details */}
          <div>
            <h2 className="text-2xl font-light text-gray-700 mb-4">Our Contact Details</h2>
            <div className="space-y-2 text-gray-500">
              <p>Kimihurura Kigali-Gasabo</p>
              <p>KN14 Avenue, KG 621 ST#3 </p>
              <p>Phone: +250788307845</p>
              <p>
                <a href="mailto: info@rwandainterfaith.org" className="text-primary hover:underline">
                  info@rwandainterfaith.org
                </a>
              </p>
            </div>
          </div>

          {/* Can't Wait to Meet You */}
          <div>
            <h2 className="text-2xl font-light text-gray-700 mb-3">Your Voice Matters</h2>
            <div className="text-gray-500 leading-relaxed">
              <p>Every opinion matters in shaping the future of community services. Your feedback helps us understand what's working, what needs change, and how we can create solutions that benefit all members of our community.</p>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Feedback Form */}
        <motion.div
          className="bg-white rounded-lg shadow-lg p-8 flex flex-col justify-between space-y-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
          custom={1}
        >
          {/* Step Content */}
          <AnimatePresence mode="wait">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={currentStep === 1 ? () => setCurrentStep(1) : prevStep}
              className="flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
            >
              <FaChevronLeft className="mr-2" />
              {currentStep === 1 ? 'Back' : 'Back'}
            </button>

            <div className="text-sm text-gray-500">Step {currentStep} of {totalSteps}</div>

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
                className="flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium transition-colors disabled:opacity-50"
                disabled={submitted}
              >
                <FaSave className="mr-2" />
                {submitted ? t('feedback.thank_you') : 'Submit Feedback'}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default FeedbackForm;