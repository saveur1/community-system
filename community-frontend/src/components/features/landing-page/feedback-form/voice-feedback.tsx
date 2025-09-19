// components/feedback/VoiceFeedback.tsx
import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { 
  FaMicrophone, 
  FaStop, 
  FaPlay, 
  FaPause, 
  FaTrash, 
  FaLock 
} from 'react-icons/fa';
import type { VoiceFeedback as VoiceFeedbackType, PermissionState } from "@/types/feedback-types";

interface VoiceFeedbackProps {
  voiceFeedback: VoiceFeedbackType | null;
  setVoiceFeedback: React.Dispatch<React.SetStateAction<VoiceFeedbackType | null>>;
}

// Waveform Component
interface VoiceWaveformProps { 
  isRecording: boolean;
}

const VoiceWaveform: React.FC<VoiceWaveformProps> = ({ isRecording }) => {
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
interface RecordingTimerProps { 
  seconds: number; 
}

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

// Play Button Component
interface PlayButtonProps { 
  onClick: () => void; 
  isPlaying?: boolean; 
}

const PlayButton: React.FC<PlayButtonProps> = ({ onClick, isPlaying = false }) => (
  <motion.button
    onClick={onClick}
    className="w-14 h-14 sm:w-16 sm:h-16 bg-primary hover:bg-primary/80 rounded-full flex items-center justify-center text-white shadow-lg transition-colors"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    aria-label={isPlaying ? 'Pause' : 'Play'}
  >
    {isPlaying ? <FaPause className="text-xl" /> : <FaPlay className="text-xl ml-1" />}
  </motion.button>
);

const VoiceFeedback: React.FC<VoiceFeedbackProps> = ({ voiceFeedback, setVoiceFeedback }) => {
  const { t } = useTranslation();
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Internal recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [micPermission, setMicPermission] = useState<PermissionState>('prompt');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);

  const cleanupMedia = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current = null;
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
      if (voiceFeedback && voiceFeedback.url) {
        URL.revokeObjectURL(voiceFeedback.url);
      }
    };
  }, [cleanupMedia, voiceFeedback]);

  const startRecording = async () => {
    if (isRecording) return;

    // Clear previous recording if it exists
    if (voiceFeedback && voiceFeedback.url) {
      URL.revokeObjectURL(voiceFeedback.url);
      setVoiceFeedback(null);
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setMicPermission('granted');

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };

      const startTime = Date.now();
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const duration = Math.round((Date.now() - startTime) / 1000);
        const url = URL.createObjectURL(blob);
        const newFeedback: VoiceFeedbackType = {
          id: Math.random().toString(36).slice(2),
          blob,
          duration,
          timestamp: new Date(),
          url,
        };
        setVoiceFeedback(newFeedback);
        cleanupMedia();
      };

      recorder.start();
      setIsRecording(true);

      timerRef.current = window.setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);

    } catch (err) {
      console.error('Error starting recording:', err);
      const e = err as { name?: string };
      if (e?.name === 'NotAllowedError' || e?.name === 'PermissionDeniedError') {
        setMicPermission('denied');
        toast.error('Microphone permission denied.');
      } else {
        toast.error('Could not start recording.');
      }
      cleanupMedia();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const deleteRecording = () => {
    if (voiceFeedback && voiceFeedback.url) {
      URL.revokeObjectURL(voiceFeedback.url);
      setVoiceFeedback(null);
    }
  };

  const playAudio = (feedback: VoiceFeedbackType) => {
    if (playingAudioId === feedback.id && audioRef.current) {
      audioRef.current.pause();
      setPlayingAudioId(null);
      return;
    }
    
    if (audioRef.current) {
      audioRef.current.pause();
    }

    if (!feedback.url) return;
    
    const audio = new Audio(feedback.url);
    audioRef.current = audio;
    setPlayingAudioId(feedback.id);
    audio.onended = () => setPlayingAudioId(null);
    audio.onerror = () => setPlayingAudioId(null);
    audio.play().catch(() => setPlayingAudioId(null));
  };

  return (
    <div className="mt-4 sm:mt-6">
      <motion.div
        className="bg-white rounded-2xl p-4 border border-gray-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center mb-2">
          {!isRecording ? (
            <motion.button
              type="button"
              onClick={startRecording}
              disabled={micPermission === 'denied'}
              className="w-14 h-14 sm:w-16 sm:h-16 bg-primary hover:bg-primary-dark rounded-full flex items-center justify-center text-white shadow-lg transition-colors mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {micPermission === 'denied' ? <FaLock /> : <FaMicrophone className="text-xl" />}
            </motion.button>
          ) : (
            <motion.button
              type="button"
              onClick={stopRecording}
              className="w-14 h-14 sm:w-16 sm:h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg transition-colors mx-auto"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <FaStop className="text-xl" />
            </motion.button>
          )}
          <p className="mt-3 text-sm text-gray-600">
            {micPermission === 'denied' 
              ? t('feedback.mic_permission_denied') 
              : !isRecording 
                ? t('feedback.tap_to_record') 
                : t('feedback.recording_in_progress')}
          </p>
        </div>

        <VoiceWaveform isRecording={isRecording} />

        {isRecording && <RecordingTimer seconds={recordingSeconds} />}
      </motion.div>

      {voiceFeedback && (
        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Recorded Message</h4>
            <motion.div
              key={voiceFeedback.id}
              className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-3 border border-purple-200"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <PlayButton
                    onClick={() => playAudio(voiceFeedback)}
                    isPlaying={playingAudioId === voiceFeedback.id}
                  />
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
                    <div className="text-sm font-medium text-gray-700">
                      {Math.floor(voiceFeedback.duration / 60)}:{(voiceFeedback.duration % 60).toString().padStart(2, '0')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(voiceFeedback.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={deleteRecording}
                  className="ml-4 text-red-500 hover:text-red-700 transition-colors"
                >
                  <FaTrash />
                </button>
              </div>
            </motion.div>
        </div>
      )}
    </div>
  );
};

export default VoiceFeedback;