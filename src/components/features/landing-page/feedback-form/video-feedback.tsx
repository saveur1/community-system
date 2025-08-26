// components/feedback/VideoFeedback.tsx
import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { 
  FaVideo, 
  FaStop, 
  FaTrash, 
  FaLock 
} from 'react-icons/fa';
import { VideoFeedbackProps } from "@/types/feedback-types";

const VideoFeedback: React.FC<VideoFeedbackProps> = ({
  videoFeedback,
  setVideoFeedback,
  camPermission,
  setCamPermission,
  micPermission,
  setMicPermission,
  isRecording,
  recordingSeconds,
  videoRef,
  showVideoPreview,
  onStartRecording,
  onStopRecording,
}) => {
  const { t } = useTranslation();

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      stream.getTracks().forEach((track) => track.stop());
      setCamPermission('granted');
      toast.success('Camera enabled.');
    } catch {
      setCamPermission('denied');
      toast.error('Camera permission denied.');
    }
  };

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
    setVideoFeedback(prev => {
      const updated = prev.filter(v => v.id !== id);
      const toDelete = prev.find(v => v.id === id);
      if (toDelete?.url) {
        URL.revokeObjectURL(toDelete.url);
      }
      return updated;
    });
  };

  return (
    <div className="space-y-4 mt-4 sm:mt-6">
      {/* Permission Messages */}
      {(camPermission === 'denied' || micPermission === 'denied') && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <div className="flex items-center text-red-700">
            <FaLock className="mr-2" />
            <span className="font-medium">Camera/Microphone Access Required</span>
          </div>
          <p className="text-red-600 text-sm mt-1">
            Please enable camera and microphone permissions to record video feedback.
          </p>
          <div className="mt-3 flex gap-2">
            {camPermission === 'denied' && (
              <button
                type="button"
                onClick={requestCameraPermission}
                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
              >
                Enable Camera
              </button>
            )}
            {micPermission === 'denied' && (
              <button
                type="button"
                onClick={requestMicrophonePermission}
                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
              >
                Enable Microphone
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* Camera Feed Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl mx-auto"
      >
        {/* Show recorded video after recording is finished */}
        {!isRecording && videoFeedback.length > 0 && (
          <div className="w-full">
            {videoFeedback.slice(0, 1).map((video) => (
              <div key={video.id} className="w-full">
                <div className="relative w-full rounded-xl overflow-hidden border border-gray-300 shadow-lg bg-black">
                  <video controls className="w-full aspect-video">
                    <source src={video.url || URL.createObjectURL(video.blob)} type="video/webm" />
                  </video>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Show live camera feed (both when idle and when recording) */}
        {((!isRecording && videoFeedback.length === 0) || isRecording) && 
         camPermission === 'granted' && 
         micPermission === 'granted' && (
          <div className="relative bg-black rounded-xl overflow-hidden shadow-lg">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full aspect-video object-cover"
            />
            
            {/* Recording Indicator - only show when recording */}
            {isRecording && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute top-4 left-4 flex items-center bg-red-600 px-3 py-1 rounded-full"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-3 h-3 bg-white rounded-full mr-2"
                />
                <span className="text-white text-sm font-medium">REC</span>
              </motion.div>
            )}

            {/* Recording Timer - only show when recording */}
            {isRecording && (
              <div className="absolute top-4 right-4 bg-black/50 px-3 py-1 rounded-full">
                <span className="text-white text-sm font-mono">
                  {Math.floor(recordingSeconds / 60).toString().padStart(2, '0')}:
                  {(recordingSeconds % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )}

            {/* Live indicator - only show when not recording */}
            {!isRecording && (
              <div className="absolute top-4 left-4 flex items-center bg-green-600 px-3 py-1 rounded-full">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 bg-white rounded-full mr-2"
                />
                <span className="text-white text-xs font-medium">LIVE</span>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Control Buttons */}
      {camPermission === 'granted' && micPermission === 'granted' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex flex-wrap justify-center items-center gap-3 sm:gap-4"
        >
          {/* Recording Control - only show circular button when no video exists */}
          {!isRecording && videoFeedback.length === 0 ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={onStartRecording}
              className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg transition-colors"
              aria-label="Start video recording"
            >
              <FaVideo className="text-xl" />
            </motion.button>
          ) : isRecording ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={onStopRecording}
              className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gray-600 hover:bg-gray-700 text-white shadow-lg transition-colors"
              aria-label="Stop recording"
            >
              <FaStop className="text-xl" />
            </motion.button>
          ) : null}

          {/* Re-record Button */}
          {!isRecording && videoFeedback.length > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={onStartRecording}
              className="flex items-center px-3 sm:px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors shadow-md"
            >
              <FaVideo className="mr-2" />
              Re-record
            </motion.button>
          )}

          {/* Delete Button */}
          {!isRecording && videoFeedback.length > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => deleteRecording(videoFeedback[0].id)}
              className="flex items-center px-3 sm:px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors shadow-md"
            >
              <FaTrash className="mr-2" />
              Remove
            </motion.button>
          )}
        </motion.div>
      )}

      {/* Instructions */}
      {camPermission === 'granted' && micPermission === 'granted' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="text-center text-gray-500 text-sm"
        >
          {videoFeedback.length === 0 ? (
            <p>Click the record button to start recording your video feedback</p>
          ) : (
            <p>Use the download button to save your video or re-record if needed</p>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default VideoFeedback;