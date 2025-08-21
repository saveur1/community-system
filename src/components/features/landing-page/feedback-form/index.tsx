import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { sectionVariants } from "../";
import { FaSave, FaMicrophone, FaVideo, FaStop, FaPlay, FaPause, FaTrash, FaCircle, FaLock } from 'react-icons/fa';

import AnimatedInput from "@/components/ui/animated-input";

// Waveform Component
type VoiceWaveformProps = { isRecording: boolean; recordingSeconds: number };
const VoiceWaveform: React.FC<VoiceWaveformProps> = ({ isRecording, recordingSeconds }) => {
  // Generate different wave heights for visual variety
  const waveHeights = [12, 24, 16, 32, 20, 28, 14, 36, 22, 18, 30, 26, 16, 34, 20, 24, 18, 28, 22, 32];

  return (
    <div className="flex items-center justify-center space-x-1 h-14">
      {waveHeights.map((baseHeight, index) => (
        <motion.div
          key={index}
          className="bg-primary rounded-full"
          style={{
            width: '3px',
            height: isRecording ? `${baseHeight}px` : `${baseHeight * 0.3}px`,
          }}
          animate={isRecording ? {
            height: [
              `${baseHeight * 0.3}px`,
              `${baseHeight}px`,
              `${baseHeight * 0.6}px`,
              `${baseHeight * 0.9}px`,
              `${baseHeight * 0.4}px`,
              `${baseHeight * 0.8}px`,
              `${baseHeight * 0.3}px`
            ],
          } : {}}
          transition={{
            duration: 1.5,
            repeat: isRecording ? Infinity : 0,
            ease: "easeInOut",
            delay: index * 0.1,
          }}
        />
      ))}
    </div>
  );
};

// Recording Timer Display
type RecordingTimerProps = { seconds: number };
const RecordingTimer: React.FC<RecordingTimerProps> = ({ seconds }) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  
  return (
    <div className="text-center">
      <motion.div
        className="text-2xl font-mono font-medium text-gray-700"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        {formattedTime}
      </motion.div>
    </div>
  );
};

// Play Button Component for the waveform UI
type PlayButtonProps = { onClick: () => void; isPlaying?: boolean };
const PlayButton: React.FC<PlayButtonProps> = ({ onClick, isPlaying = false }) => (
  <motion.button
    onClick={onClick}
    className="w-16 h-16 bg-primary hover:bg-primary/80 rounded-full flex items-center justify-center text-white shadow-lg transition-colors"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    aria-label={isPlaying ? 'Pause' : 'Play'}
  >
    {isPlaying ? <FaPause className="text-xl" /> : <FaPlay className="text-xl ml-1" />}
  </motion.button>
);

function FeedbackForm() {
  type FeedbackMethod = 'text' | 'voice' | 'video';
  interface FormState {
    name: string;
    message: string;
    feedbackMethod: FeedbackMethod;
  }

  const [form, setForm] = useState<FormState>({
    name: "",
    message: "",
    feedbackMethod: 'text',
  });

  const [submitted, setSubmitted] = useState(false);
  const { t } = useTranslation();

  // Recording state
  type VoiceFeedback = { id: string; blob: Blob; duration: number; timestamp: Date };
  type VideoFeedback = { id: string; blob: Blob; duration: number; timestamp: Date };
  const [voiceFeedback, setVoiceFeedback] = useState<VoiceFeedback[]>([]);
  const [videoFeedback, setVideoFeedback] = useState<VideoFeedback[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingType, setRecordingType] = useState<'voice' | 'video' | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [showVideoPreview, setShowVideoPreview] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const timerRef = React.useRef<number | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Permissions state
  type PermissionState = 'checking' | 'prompt' | 'granted' | 'denied';
  const [micPermission, setMicPermission] = useState<PermissionState>('checking');
  const [camPermission, setCamPermission] = useState<PermissionState>('checking');

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
            // Fallback: unknown -> prompt
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

  // Cleanup on unmount: stop media, timers, audio (do NOT clear on stream change)
  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const requestMicrophonePermission = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      s.getTracks().forEach((t) => t.stop());
      setMicPermission('granted');
      toast.success('Microphone enabled.');
    } catch {
      setMicPermission('denied');
      toast.error('Microphone permission denied.');
    }
  };

  const requestCameraPermission = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      s.getTracks().forEach((t) => t.stop());
      setCamPermission('granted');
      toast.success('Camera enabled.');
    } catch {
      setCamPermission('denied');
      toast.error('Camera permission denied.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const key = name as keyof FormState;
    setForm((prev) => ({ ...prev, [key]: value }));
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

    // Simulate submit success
    setSubmitted(true);
    setForm({ name: "", message: "", feedbackMethod: 'text' });
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
        videoRef.current.srcObject = mediaStream;
        setShowVideoPreview(true);
      }

      // Select a supported mimeType for consistent playback across browsers (Chrome/Edge)
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
        const item = { id: Math.random().toString(36).slice(2), blob, duration, timestamp: new Date() };
        if (type === 'voice') setVoiceFeedback((prev) => [...prev, item]);
        else setVideoFeedback((prev) => [...prev, item]);

        // Clean up stream
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

  const deleteRecording = (type: 'voice' | 'video', id: string) => {
    if (type === 'voice') setVoiceFeedback((prev) => prev.filter((v) => v.id !== id));
    else setVideoFeedback((prev) => prev.filter((v) => v.id !== id));
  };

  const feedbackMethods: { value: FeedbackMethod; label: string; icon: string; description: string }[] = [
    { value: 'text', label: t('feedback.feedback_method_text'), icon: '📝', description: t('feedback.feedback_method_text_desc') },
    { value: 'voice', label: t('feedback.feedback_method_voice'), icon: '🎤', description: t('feedback.feedback_method_voice_desc') },
    { value: 'video', label: t('feedback.feedback_method_video'), icon: '📹', description: t('feedback.feedback_method_video_desc') }
  ];

  return (
    <div className="max-w-8xl mx-auto w-full rounded-xl bg-gray-100 border border-gray-300 py-8 px-4" id="feedback">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-light text-title mb-2">{t('feedback.feedback_title')}</h1>
        <p className="text-lg text-gray-600">{t('feedback.feedback_subtitle')}</p>
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
          className="bg-white rounded-lg shadow-lg p-8 flex flex-col justify-between space-y-8"
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
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            {/* Feedback Method */}
            <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">{t('feedback.feedback_method')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {feedbackMethods.map((method) => (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => setForm({ ...form, feedbackMethod: method.value as any })}
                  className={`p-2 border rounded-lg text-left transition-colors ${form.feedbackMethod === method.value ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary'}`}
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

            {/* Dynamic Input Area */}
            {form.feedbackMethod === 'text' && (
              <div className="space-y-2 mt-6">
                <label className="text-sm font-medium text-gray-700" htmlFor="message">
                  {t('feedback.feedback_field')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none min-h-[120px] bg-gray-50"
                  id="message"
                  name="message"
                  placeholder={t('feedback.programme_placeholder')}
                  value={form.message}
                  onChange={handleChange}
                  required
                  aria-required="true"
                />
              </div>
            )}

            {form.feedbackMethod === 'voice' && (
              <div className="mt-6">
                {/* Enhanced Voice Recording UI */}
                <motion.div
                  className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-4 border border-purple-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Permission state for microphone */}
                  {micPermission === 'denied' && (
                    <div className="mb-4 flex items-start gap-3 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700">
                      <FaLock className="mt-1" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Microphone blocked</p>
                        <p className="text-xs">Please enable microphone access in your browser settings.</p>
                      </div>
                      <button type="button" onClick={requestMicrophonePermission} className="text-sm px-3 py-1 rounded bg-red-600 text-white">Allow</button>
                    </div>
                  )}
                  {/* Recording Controls */}
                  <div className="text-center mb-2">
                    {!isRecording ? (
                      <motion.button
                        type="button"
                        onClick={() => startRecording('voice')}
                        className="w-16 h-16 bg-primary hover:bg-primary-dark rounded-full flex items-center justify-center text-white shadow-lg transition-colors mx-auto disabled:opacity-50"
                        disabled={micPermission === 'denied'}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FaMicrophone className="text-xl" />
                      </motion.button>
                    ) : (
                      <motion.button
                        type="button"
                        onClick={stopRecording}
                        className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg transition-colors mx-auto"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <FaStop className="text-xl" />
                      </motion.button>
                    )}
                    <p className="mt-3 text-sm text-gray-600">
                      {!isRecording ? "Tap to start recording" : "Recording in progress..."}
                    </p>
                  </div>

                  {/* Waveform Visualization */}
                  <VoiceWaveform isRecording={isRecording && recordingType === 'voice'} recordingSeconds={recordingSeconds} />

                  {/* Recording Timer */}
                  {isRecording && recordingType === 'voice' && (
                    <RecordingTimer seconds={recordingSeconds} />
                  )}
                </motion.div>

                {/* Recorded Voice Messages */}
                {voiceFeedback.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">Recorded Messages</h4>
                    {voiceFeedback.map((v) => (
                      <motion.div
                        key={v.id}
                        className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-3 border border-purple-200"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 flex-1">
                            <PlayButton
                              onClick={() => {
                                // If currently playing this one, pause
                                if (playingAudioId === v.id && audioRef.current) {
                                  audioRef.current.pause();
                                  setPlayingAudioId(null);
                                  return;
                                }
                                // Stop any existing audio
                                if (audioRef.current) {
                                  audioRef.current.pause();
                                  audioRef.current.src = '';
                                }
                                const audio = new Audio(URL.createObjectURL(v.blob));
                                audioRef.current = audio;
                                setPlayingAudioId(v.id);
                                audio.onended = () => setPlayingAudioId(null);
                                audio.play();
                              }}
                              isPlaying={playingAudioId === v.id}
                            />

                            {/* Mini Waveform for recorded message */}
                            <div className="flex items-center space-x-1 flex-1">
                              {Array.from({ length: 15 }, (_, i) => (
                                <div
                                  key={i}
                                  className="bg-primary rounded-full"
                                  style={{
                                    width: '2px',
                                    height: `${Math.random() * 20 + 8}px`,
                                  }}
                                />
                              ))}
                            </div>

                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-700">{Math.floor(v.duration / 60)}:{(v.duration % 60).toString().padStart(2, '0')}</div>
                              <div className="text-xs text-gray-500">{v.timestamp.toLocaleString()}</div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => deleteRecording('voice', v.id)}
                            className="ml-4 text-red-500 hover:text-red-700 transition-colors"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {form.feedbackMethod === 'video' && (
              <div className="mt-6">
                {camPermission === 'denied' && (
                  <div className="mb-4 flex items-start gap-3 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700">
                    <FaLock className="mt-1" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Camera blocked</p>
                      <p className="text-xs">Please enable camera access in your browser settings.</p>
                    </div>
                    <button type="button" onClick={requestCameraPermission} className="text-sm px-3 py-1 rounded bg-red-600 text-white">Allow</button>
                  </div>
                )}
                <div className="flex items-center gap-3 mb-4">
                  {!isRecording ? (
                    <button type="button" onClick={() => startRecording('video')} className="flex items-center px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50" disabled={camPermission === 'denied' || micPermission === 'denied'}>
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

          {/* Submit */}
          <div className="flex justify-end items-center mt-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleSubmit}
              className="flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium transition-colors disabled:opacity-50"
              disabled={submitted}
            >
              <FaSave className="mr-2" />
              {submitted ? t('feedback.thank_you') : t('button.submit')}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default FeedbackForm;