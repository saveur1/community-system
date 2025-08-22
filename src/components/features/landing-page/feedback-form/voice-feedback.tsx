// components/feedback/VoiceFeedback.tsx
import React, { useRef, useState } from "react";
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
import { VoiceFeedbackProps, VoiceFeedback as VoiceFeedbackType } from "@/types/feedback-types";

// Waveform Component
interface VoiceWaveformProps { 
  isRecording: boolean; 
  recordingSeconds: number; 
}

const VoiceWaveform: React.FC<VoiceWaveformProps> = ({ isRecording, recordingSeconds }) => {
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
    className="w-16 h-16 bg-primary hover:bg-primary/80 rounded-full flex items-center justify-center text-white shadow-lg transition-colors"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    aria-label={isPlaying ? 'Pause' : 'Play'}
  >
    {isPlaying ? <FaPause className="text-xl" /> : <FaPlay className="text-xl ml-1" />}
  </motion.button>
);

const VoiceFeedback: React.FC<VoiceFeedbackProps> = ({
  voiceFeedback,
  setVoiceFeedback,
  micPermission,
  setMicPermission,
  isRecording,
  recordingSeconds,
  onStartRecording,
  onStopRecording,
}) => {
  const { t } = useTranslation();
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setMicPermission('granted');
      toast.success('Microphone enabled.');
    } catch {
      setMicPermission('denied');
      toast.error('Microphone permission denied.');
    }
  };

  const deleteRecording = (id: string) => {
    setVoiceFeedback(prev => {
      const updated = prev.filter(v => v.id !== id);
      const toDelete = prev.find(v => v.id === id);
      if (toDelete?.url) {
        URL.revokeObjectURL(toDelete.url);
      }
      return updated;
    });
  };

  const playAudio = (feedback: VoiceFeedbackType) => {
    // If currently playing this one, pause
    if (playingAudioId === feedback.id && audioRef.current) {
      audioRef.current.pause();
      setPlayingAudioId(null);
      return;
    }
    
    // Stop any existing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    
    // Create new audio element
    const audio = new Audio(feedback.url || URL.createObjectURL(feedback.blob));
    audioRef.current = audio;
    setPlayingAudioId(feedback.id);
    audio.onended = () => setPlayingAudioId(null);
    audio.onerror = () => setPlayingAudioId(null);
    audio.play().catch(() => setPlayingAudioId(null));
  };

  return (
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
            <button 
              type="button" 
              onClick={requestMicrophonePermission} 
              className="text-sm px-3 py-1 rounded bg-red-600 text-white"
            >
              Allow
            </button>
          </div>
        )}

        {/* Recording Controls */}
        <div className="text-center mb-2">
          {!isRecording ? (
            <motion.button
              type="button"
              onClick={onStartRecording}
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
              onClick={onStopRecording}
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
        <VoiceWaveform isRecording={isRecording} recordingSeconds={recordingSeconds} />

        {/* Recording Timer */}
        {isRecording && (
          <RecordingTimer seconds={recordingSeconds} />
        )}
      </motion.div>

      {/* Recorded Voice Messages */}
      {voiceFeedback.length > 0 && (
        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Recorded Messages</h4>
          {voiceFeedback.map((feedback) => (
            <motion.div
              key={feedback.id}
              className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-3 border border-purple-200"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <PlayButton
                    onClick={() => playAudio(feedback)}
                    isPlaying={playingAudioId === feedback.id}
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
                    <div className="text-sm font-medium text-gray-700">
                      {Math.floor(feedback.duration / 60)}:{(feedback.duration % 60).toString().padStart(2, '0')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {feedback.timestamp.toLocaleString()}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => deleteRecording(feedback.id)}
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
  );
};

export default VoiceFeedback;