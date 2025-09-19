import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { FaVideo, FaStop, FaTrash, FaLock, FaRedo } from 'react-icons/fa';
import type { VideoFeedback as VideoFeedbackType, PermissionState } from "@/types/feedback-types";

interface VideoFeedbackProps {
  videoFeedback: VideoFeedbackType | null;
  setVideoFeedback: React.Dispatch<React.SetStateAction<VideoFeedbackType | null>>;
}

const VideoFeedback: React.FC<VideoFeedbackProps> = ({ videoFeedback, setVideoFeedback }) => {
  const { t } = useTranslation();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [micPermission, setMicPermission] = useState<PermissionState>('prompt');
  const [camPermission, setCamPermission] = useState<PermissionState>('prompt');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<number | null>(null);

  const cleanupMedia = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
    setRecordingSeconds(0);
  }, []);

  useEffect(() => {
    return () => {
      cleanupMedia();
      if (videoFeedback && videoFeedback.url) {
        URL.revokeObjectURL(videoFeedback.url);
      }
    };
  }, [cleanupMedia]);


  const handleStartRecording = async () => {
    if (isRecording) return;

    if (videoFeedback) {
      handleDeleteVideo();
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: true });
      streamRef.current = stream;
      setCamPermission('granted');
      setMicPermission('granted');

      if (videoRef.current) {
        videoRef.current.src = ''; // Clear any previous source
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.play().catch(console.error);
      }

      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      mediaRecorderRef.current = recorder;
      const chunks: Blob[] = [];
      recorder.ondataavailable = (event) => chunks.push(event.data);

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const newFeedback: VideoFeedbackType = {
          id: `vid_${Date.now()}`,
          blob,
          duration: recordingSeconds,
          timestamp: new Date(),
          url,
        };

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
            videoRef.current.src = url;
            videoRef.current.muted = false;
            videoRef.current.load();
        }

        setVideoFeedback(newFeedback);
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
        setRecordingSeconds(0);
      };

      recorder.start();
      setIsRecording(true);
      timerRef.current = window.setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);

    } catch (err) {
      toast.error(t('feedback.video_permission_denied'));
      setCamPermission('denied');
      setMicPermission('denied');
      cleanupMedia();
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const handleDeleteVideo = () => {
    if (videoFeedback && videoFeedback.url) {
      URL.revokeObjectURL(videoFeedback.url);
    }
    if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.src = '';
    }
    setVideoFeedback(null);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const permissionsBlocked = camPermission === 'denied' || micPermission === 'denied';

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {permissionsBlocked && (
        <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 w-full" role="alert">
          <FaLock className="inline mr-2" />
          {t('feedback.video_permission_denied_instructions')}
        </div>
      )}

      <div className="relative w-full max-w-2xl aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-lg">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          controls={!!videoFeedback && !isRecording}
        />
        {isRecording && (
          <div className="absolute top-3 right-3 flex items-center gap-2 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-mono">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-2.5 h-2.5 bg-red-500 rounded-full"
            />
            <span>{formatTime(recordingSeconds)}</span>
          </div>
        )}
        {!isRecording && !videoFeedback && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 pointer-events-none">
             <FaVideo className="text-white/50 text-6xl mb-4" />
             <p className="text-white/80">{t('feedback.video_press_to_record')}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-4">
        {!isRecording && !videoFeedback && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={handleStartRecording}
            disabled={permissionsBlocked}
            className="flex items-center justify-center w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={t('feedback.start_recording')}
          >
            <FaVideo className="text-2xl" />
          </motion.button>
        )}

        {isRecording && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={handleStopRecording}
            className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-700 hover:bg-gray-800 text-white shadow-lg transition-colors"
            aria-label={t('feedback.stop_recording')}
          >
            <FaStop className="text-2xl" />
          </motion.button>
        )}

        {videoFeedback && !isRecording && (
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={handleStartRecording} // Re-record
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors shadow-md"
            >
              <FaRedo />
              <span>{t('feedback.rerecord')}</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={handleDeleteVideo}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors shadow-md"
            >
              <FaTrash />
              <span>{t('feedback.remove')}</span>
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoFeedback;