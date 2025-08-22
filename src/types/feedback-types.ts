// types/feedback.ts
export type FeedbackMethod = 'text' | 'voice' | 'video';
export type PermissionState = 'checking' | 'prompt' | 'granted' | 'denied';

export interface FormState {
  name: string;
  message: string;
  feedbackMethod: FeedbackMethod;
}

export interface VoiceFeedback {
  id: string;
  blob: Blob;
  duration: number;
  timestamp: Date;
  url?: string;
}

export interface VideoFeedback {
  id: string;
  blob: Blob;
  duration: number;
  timestamp: Date;
  url?: string;
}

export interface FeedbackComponentProps {
  form: FormState;
  onFormChange: (updates: Partial<FormState>) => void;
  onSubmit: () => void;
  submitted: boolean;
}

export interface VoiceFeedbackProps extends FeedbackComponentProps {
  voiceFeedback: VoiceFeedback[];
  setVoiceFeedback: React.Dispatch<React.SetStateAction<VoiceFeedback[]>>;
  micPermission: PermissionState;
  setMicPermission: React.Dispatch<React.SetStateAction<PermissionState>>;
  isRecording: boolean;
  recordingSeconds: number;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

export interface VideoFeedbackProps extends FeedbackComponentProps {
  videoFeedback: VideoFeedback[];
  setVideoFeedback: React.Dispatch<React.SetStateAction<VideoFeedback[]>>;
  camPermission: PermissionState;
  setCamPermission: React.Dispatch<React.SetStateAction<PermissionState>>;
  micPermission: PermissionState;
  setMicPermission: React.Dispatch<React.SetStateAction<PermissionState>>;
  isRecording: boolean;
  recordingSeconds: number;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  showVideoPreview: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

export interface TextFeedbackProps extends FeedbackComponentProps {
  // No additional props needed for text feedback
}