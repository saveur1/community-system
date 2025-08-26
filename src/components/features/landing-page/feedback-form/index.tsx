// components/FeedbackForm.tsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { sectionVariants } from "../";
import { FaSave } from 'react-icons/fa';

import AnimatedInput from "@/components/ui/animated-input";
import TextFeedback from "./text-feedback";
import VoiceFeedback from "./voice-feedback";
import VideoFeedback from "./video-feedback";

import {
  FeedbackMethod,
  PermissionState,
  FormState,
  VoiceFeedback as VoiceFeedbackType,
  VideoFeedback as VideoFeedbackType,
} from "@/types/feedback-types";

function FeedbackForm() {
  const [form, setForm] = useState<FormState>({
    name: "",
    message: "",
    feedbackMethod: 'text',
  });

  const [submitted, setSubmitted] = useState(false);
  const { t } = useTranslation();

  // Recording state
  const [voiceFeedback, setVoiceFeedback] = useState<VoiceFeedbackType[]>([]);
  const [videoFeedback, setVideoFeedback] = useState<VideoFeedbackType[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingType, setRecordingType] = useState<'voice' | 'video' | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showVideoPreview, setShowVideoPreview] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const timerRef = useRef<number | null>(null);

  // Permissions state
  const [micPermission, setMicPermission] = useState<PermissionState>('checking');
  const [camPermission, setCamPermission] = useState<PermissionState>('checking');

  // Cleanup function to stop all media streams and clear resources
  const cleanupMediaResources = useCallback(() => {
    // Stop current stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    setStream(null);

    // Clear video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.src = '';
    }

    // Clear recording state
    setIsRecording(false);
    setRecordingType(null);
    setMediaRecorder(null);
    setShowVideoPreview(false);

    // Clear timer
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRecordingSeconds(0);
  }, []);

  // Cleanup blob URLs to prevent memory leaks
  const cleanupBlobUrls = useCallback(() => {
    voiceFeedback.forEach(feedback => {
      if (feedback.url) {
        URL.revokeObjectURL(feedback.url);
      }
    });
    videoFeedback.forEach(feedback => {
      if (feedback.url) {
        URL.revokeObjectURL(feedback.url);
      }
    });
  }, [voiceFeedback, videoFeedback]);

  // Start camera preview stream (not recording)
  const startCameraPreview = useCallback(async () => {
    try {
      if (camPermission !== 'granted' || micPermission !== 'granted') {
        return;
      }

      // Don't start preview if already recording or if stream already exists
      if (isRecording || streamRef.current) {
        return;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true
      });

      streamRef.current = mediaStream;
      setStream(mediaStream);

      if (videoRef.current) {
        const v = videoRef.current;
        v.srcObject = mediaStream;
        v.muted = true;
        v.playsInline = true;
        v.onloadedmetadata = () => {
          v.play().catch(() => {/* ignore autoplay errors */ });
        };
        setShowVideoPreview(true);
      }
    } catch (err) {
      console.error('Error starting camera preview:', err);
    }
  }, [camPermission, micPermission, isRecording]);

  // Stop camera preview stream
  const stopCameraPreview = useCallback(() => {
    if (streamRef.current && !isRecording) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setStream(null);
      setShowVideoPreview(false);

      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.src = '';
      }
    }
  }, [isRecording]);

  // Start camera preview when video feedback is selected and permissions are granted
  useEffect(() => {
    if (form.feedbackMethod === 'video' && camPermission === 'granted' && micPermission === 'granted') {
      startCameraPreview();
    } else if (form.feedbackMethod !== 'video') {
      stopCameraPreview();
    }
  }, [form.feedbackMethod, camPermission, micPermission, startCameraPreview, stopCameraPreview]);

  // Check permissions on mount and subscribe to changes
  useEffect(() => {
    let micStatus: PermissionStatus | null = null;
    let camStatus: PermissionStatus | null = null;

    const updateState = (name: 'microphone' | 'camera', state: PermissionState) => {
      if (name === 'microphone') setMicPermission(state);
      if (name === 'camera') setCamPermission(state);
    };

    const toState = (s: PermissionState | PermissionState | undefined | string): PermissionState => {
      if (s === 'granted' || s === 'denied' || s === 'prompt') return s as PermissionState;
      return 'prompt';
    };

    const check = async () => {
      try {
        if (navigator.permissions && 'query' in navigator.permissions) {
          try {
            micStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
            updateState('microphone', toState(micStatus.state as PermissionState));
            micStatus.onchange = () => updateState('microphone', toState(micStatus?.state as PermissionState));
          } catch {
            updateState('microphone', 'prompt');
          }

          try {
            camStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
            updateState('camera', toState(camStatus.state as PermissionState));
            camStatus.onchange = () => updateState('camera', toState(camStatus?.state as PermissionState));
          } catch {
            updateState('camera', 'prompt');
          }
        } else {
          setMicPermission('prompt');
          setCamPermission('prompt');
        }
      } catch {
        setMicPermission('prompt');
        setCamPermission('prompt');
      }
    };

    check();

    return () => {
      if (micStatus) micStatus.onchange = null;
      if (camStatus) camStatus.onchange = null;
    };
  }, []);

  // Cleanup on unmount and when feedback method changes
  useEffect(() => {
    return () => {
      cleanupMediaResources();
      cleanupBlobUrls();
    };
  }, [cleanupMediaResources, cleanupBlobUrls]);

  // Cleanup resources when switching feedback methods
  useEffect(() => {
    if (form.feedbackMethod !== 'voice' && form.feedbackMethod !== 'video') {
      cleanupMediaResources();
    }
  }, [form.feedbackMethod, cleanupMediaResources]);

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

  const handleSubmit = () => {
    // Validate per method
    if (!form.name.trim()) {
      showErrorToast(t('validation.name_required'));
      return;
    }

    if (form.feedbackMethod === 'text') {
      if (!form.message.trim()) {
        showErrorToast(t('validation.message_required'));
        return;
      }
    } else if (form.feedbackMethod === 'voice') {
      if (voiceFeedback.length === 0) {
        showErrorToast('Please record a voice message.');
        return;
      }
    } else if (form.feedbackMethod === 'video') {
      if (videoFeedback.length === 0) {
        showErrorToast('Please record a video message.');
        return;
      }
    }

    // Clean up resources before submitting
    cleanupMediaResources();

    // Simulate submit success
    setSubmitted(true);
    setForm({ name: "", message: "", feedbackMethod: 'text' });

    // Clean up blob URLs before clearing feedback
    cleanupBlobUrls();
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
      // Clean up any existing resources first
      cleanupMediaResources();

      // Clear existing recordings when starting a new recording
      if (type === 'voice') {
        setVoiceFeedback([]);
      } else if (type === 'video') {
        // Clean up existing video URLs before clearing
        videoFeedback.forEach(v => v.url && URL.revokeObjectURL(v.url));
        setVideoFeedback([]);
      }

      if (type === 'voice' && micPermission === 'denied') {
        showErrorToast('Microphone permission is denied. Enable it to record.');
        return;
      }
      if (type === 'video' && (camPermission === 'denied' || micPermission === 'denied')) {
        showErrorToast('Camera/Microphone permission is denied. Enable them to record video.');
        return;
      }

      const constraints = type === 'voice' ? { audio: true } : { audio: true, video: true };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      streamRef.current = mediaStream;

      if (type === 'video' && videoRef.current) {
        const v = videoRef.current;
        v.srcObject = mediaStream;
        try { (v as any).playsInline = true; } catch { }
        v.muted = true;
        v.onloadedmetadata = () => {
          v.play().catch(() => {/* ignore autoplay errors */ });
        };
        setShowVideoPreview(true);
      }

      // Select a supported mimeType for consistent playback across browsers
      const pickSupportedMime = (candidates: string[]): string | undefined => {
        return candidates.find((mt) => (window as any).MediaRecorder && (MediaRecorder as any).isTypeSupported?.(mt));
      };
      const audioCandidates = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
      ];
      const videoCandidates = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
      ];
      const chosenMime = type === 'voice' ? pickSupportedMime(audioCandidates) : pickSupportedMime(videoCandidates);
      const recorder = chosenMime ? new MediaRecorder(mediaStream, { mimeType: chosenMime }) : new MediaRecorder(mediaStream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };

      const startTime = Date.now();
      recorder.onstop = () => {
        const outType = recorder.mimeType || chosenMime || (type === 'voice' ? 'audio/webm' : 'video/webm');
        const blob = new Blob(chunks, { type: outType });
        const duration = Math.round((Date.now() - startTime) / 1000);
        const url = URL.createObjectURL(blob);
        const item = { id: Math.random().toString(36).slice(2), blob, duration, timestamp: new Date(), url };

        if (type === 'voice') {
          setVoiceFeedback((prev) => [...prev, item]);
        } else {
          // For video, replace existing recording
          setVideoFeedback((prev) => {
            // Clean up previous video URLs
            prev.forEach(v => v.url && URL.revokeObjectURL(v.url));
            return [item];
          });
        }

        // Clean up stream after recording
        mediaStream.getTracks().forEach((track) => track.stop());
        setStream(null);
        streamRef.current = null;

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
      cleanupMediaResources();
      showErrorToast('Unable to start recording. Please check permissions.');
      const e = err as { name?: string };
      // Only set to denied on explicit user denial
      if (type === 'voice') {
        if (e?.name === 'NotAllowedError' || e?.name === 'PermissionDeniedError') {
          setMicPermission('denied');
        }
      } else if (type === 'video') {
        if (e?.name === 'NotAllowedError' || e?.name === 'PermissionDeniedError') {
          setCamPermission('denied');
        }
      }
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

  const handleStartVoiceRecording = () => {
    startRecording('voice');
  };

  const handleStartVideoRecording = () => {
    startRecording('video');
  };

  const feedbackMethods: { value: FeedbackMethod; label: string; icon: string; description: string }[] = [
    { value: 'text', label: t('feedback.feedback_method_text'), icon: '📝', description: t('feedback.feedback_method_text_desc') },
    { value: 'voice', label: t('feedback.feedback_method_voice'), icon: '🎤', description: t('feedback.feedback_method_voice_desc') },
    { value: 'video', label: t('feedback.feedback_method_video'), icon: '📹', description: t('feedback.feedback_method_video_desc') }
  ];

  return (
    <div className="w-full rounded-2xl bg-gray-100 border border-gray-300">
      <div className="max-w-8xl mx-auto  px-3 sm:px-4 py-6 sm:py-8" id="feedback">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light text-title mb-2">{t('feedback.feedback_title')}</h1>
          <p className="text-base sm:text-lg text-gray-600">{t('feedback.feedback_subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 max-w-7xl mx-auto">
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
              <h2 className="text-2xl font-light text-gray-700 mb-4">{t('contact.title')}</h2>
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
              <h2 className="text-2xl font-light text-gray-700 mb-3">{t('contact.title2')}</h2>
              <div className="text-gray-500 leading-relaxed">
                <p>{t('contact.description')}</p>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Feedback Form */}
          <motion.div
            className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 flex flex-col justify-between space-y-6 sm:space-y-8"
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
                />
              </div>

              {/* Feedback Method */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3 mt-6">
                {feedbackMethods.map((method) => (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => handleFormChange({ feedbackMethod: method.value })}
                    className={`w-full h-full p-2 py-3 border rounded-lg text-left transition-colors ${form.feedbackMethod === method.value ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary'}`}
                  >
                    <div className="flex items-center">
                      <span className="text-2xl mr-2 p-1 bg-primary/10 rounded-full">{method.icon}</span>
                      <div>
                        <div className="font-medium text-sm">{method.label}</div>
                        <div className="text-xs sm:text-sm text-gray-500">{method.description}</div>
                      </div>
                    </div>
                  </button>
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
                  form={form}
                  onFormChange={handleFormChange}
                  onSubmit={handleSubmit}
                  submitted={submitted}
                  voiceFeedback={voiceFeedback}
                  setVoiceFeedback={setVoiceFeedback}
                  micPermission={micPermission}
                  setMicPermission={setMicPermission}
                  isRecording={isRecording && recordingType === 'voice'}
                  recordingSeconds={recordingSeconds}
                  onStartRecording={handleStartVoiceRecording}
                  onStopRecording={stopRecording}
                />
              )}

              {form.feedbackMethod === 'video' && (
                <VideoFeedback
                  form={form}
                  onFormChange={handleFormChange}
                  onSubmit={handleSubmit}
                  submitted={submitted}
                  videoFeedback={videoFeedback}
                  setVideoFeedback={setVideoFeedback}
                  camPermission={camPermission}
                  setCamPermission={setCamPermission}
                  micPermission={micPermission}
                  setMicPermission={setMicPermission}
                  isRecording={isRecording && recordingType === 'video'}
                  recordingSeconds={recordingSeconds}
                  videoRef={videoRef}
                  showVideoPreview={showVideoPreview}
                  onStartRecording={handleStartVideoRecording}
                  onStopRecording={stopRecording}
                />
              )}
            </motion.div>

            {/* Submit */}
            <div className="flex justify-end sm:justify-end items-center mt-4">
              <button
                type="button"
                onClick={handleSubmit}
                className="flex items-center justify-center w-full sm:w-auto min-h-[44px] px-5 sm:px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium transition-colors disabled:opacity-50"
                disabled={submitted}
              >
                <FaSave className="mr-2" />
                {submitted ? t('feedback.thank_you') : t('button.submit')}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default FeedbackForm;