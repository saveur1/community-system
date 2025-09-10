import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
    FaTag,
    FaCheckCircle,
    FaTimesCircle,
    FaUser,
    FaEnvelope,
    FaBuilding,
    FaPlay,
    FaPause,
    FaVideo,
    FaVolumeUp,
    FaEllipsisV,
    FaTimes,
    FaTrash,
    FaPencilAlt
} from 'react-icons/fa';
import Drawer from '@/components/ui/drawer';
import { CustomDropdown, DropdownItem } from '@/components/ui/dropdown';
import { FeedbackEntity } from '@/api/feedback';
import { TiMessage } from 'react-icons/ti';
import { spacer } from '@/utility/logicFunctions';

interface FeedbackDetailsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    feedback: FeedbackEntity | undefined;
    getStatusColor: (status: string) => string;
    getInitials: (text: string) => string;
    onEdit?: (feedback: FeedbackEntity) => void;
    onResolve?: (feedback: FeedbackEntity) => void;
    onReply?: (feedback: FeedbackEntity) => void;
    onReject?: (feedback: FeedbackEntity) => void;
    onDelete?: (feedback: FeedbackEntity) => void;
}

// Voice Waveform Component for playback
interface VoiceWaveformProps {
    isPlaying: boolean;
}

const VoiceWaveform: React.FC<VoiceWaveformProps> = ({ isPlaying }) => {
    const waveHeights = [12, 24, 16, 32, 20, 28, 14, 36, 22, 18, 30, 26, 16, 34, 20, 24, 18, 28, 22, 32];

    return (
        <div className="flex items-center justify-center space-x-1 h-12">
            {waveHeights.map((baseHeight, index) => (
                <motion.div
                    key={index}
                    className="bg-primary rounded-full"
                    style={{
                        width: '2px',
                        height: isPlaying ? `${baseHeight * 0.8}px` : `${baseHeight * 0.3}px`,
                    }}
                    animate={isPlaying ? {
                        height: [
                            `${baseHeight * 0.3}px`,
                            `${baseHeight * 0.8}px`,
                            `${baseHeight * 0.5}px`,
                            `${baseHeight * 0.7}px`,
                            `${baseHeight * 0.4}px`,
                            `${baseHeight * 0.6}px`,
                            `${baseHeight * 0.3}px`
                        ],
                    } : {}}
                    transition={{
                        duration: 1.2,
                        repeat: isPlaying ? Infinity : 0,
                        ease: "easeInOut",
                        delay: index * 0.08,
                    }}
                />
            ))}
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
        className="w-12 h-12 bg-primary hover:bg-primary/80 rounded-full flex items-center justify-center text-white shadow-lg transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isPlaying ? 'Pause' : 'Play'}
    >
        {isPlaying ? <FaPause className="text-sm" /> : <FaPlay className="text-sm ml-0.5" />}
    </motion.button>
);

export const FeedbackDetailsDrawer: React.FC<FeedbackDetailsDrawerProps> = ({
    isOpen,
    onClose,
    feedback,
    getStatusColor,
    getInitials,
    onEdit,
    onResolve,
    onReply,
    onReject,
    onDelete,
}) => {
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    const [audioDuration, setAudioDuration] = useState<number | null>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    const getFeedbackTypeColor = (feedbackType: string) => {
        switch (feedbackType) {
            case 'text': return 'bg-green-100 text-green-800 border border-green-200';
            case 'voice': return 'bg-blue-100 text-blue-800 border border-blue-200';
            case 'video': return 'bg-red-100 text-red-800 border border-red-200';
            default: return 'bg-gray-100 text-gray-800 border border-gray-200';
        }
    };

    const getMediaUrl = () => {
        if (!feedback?.documents || feedback.documents.length === 0) return null;
        return feedback.documents[0]?.documentUrl || null;
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handlePlayAudio = () => {
        const mediaUrl = getMediaUrl();
        if (!mediaUrl) return;

        if (isPlayingAudio && audioRef.current) {
            audioRef.current.pause();
            setIsPlayingAudio(false);
            return;
        }

        if (audioRef.current) {
            audioRef.current.pause();
        }

        const audio = new Audio(mediaUrl);
        audioRef.current = audio;

        audio.onloadedmetadata = () => {
            setAudioDuration(audio.duration);
        };

        audio.ontimeupdate = () => {
            setCurrentTime(audio.currentTime);
        };

        audio.onended = () => {
            setIsPlayingAudio(false);
            setCurrentTime(0);
        };

        audio.onerror = () => {
            setIsPlayingAudio(false);
            console.error('Error playing audio');
        };

        setIsPlayingAudio(true);
        audio.play().catch(() => {
            setIsPlayingAudio(false);
            console.error('Failed to play audio');
        });
    };

    const renderUserInfo = () => {
        if (feedback?.user) {
            return (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <FaUser className="text-gray-400 text-sm" />
                        <span className="font-medium text-gray-900">{feedback.user.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <FaEnvelope className="text-gray-400 text-sm" />
                        <span className="text-sm text-gray-700">{feedback.user.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <FaTag className="text-gray-400 text-sm" />
                        <span className="text-sm text-gray-700">
                            {feedback.user.roles?.[0]?.name || 'No role assigned'}
                        </span>
                    </div>
                </div>
            );
        } else if (feedback?.responderName) {
            return (
                <div className="flex items-center gap-2">
                    <FaUser className="text-gray-400 text-sm" />
                    <span className="text-sm text-gray-700">{feedback.responderName}</span>
                </div>
            );
        } else {
            return (
                <div className="flex items-center gap-2">
                    <FaUser className="text-gray-400 text-sm" />
                    <span className="text-sm text-gray-500 italic">Unknown user</span>
                </div>
            );
        }
    };

    const renderMediaContent = () => {
        if (!feedback) return null;

        const mediaUrl = getMediaUrl();
        if (!mediaUrl) return null;
        switch (feedback.feedbackMethod) {
            case 'voice':
                return (
                    <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Voice Message</div>
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <FaVolumeUp className="text-blue-600" />
                                    <span className="text-sm font-medium text-blue-800">Audio Feedback</span>
                                </div>
                                <span className="text-xs text-blue-600">
                                    {audioDuration ? formatTime(audioDuration) : '--:--'}
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                <PlayButton onClick={handlePlayAudio} isPlaying={isPlayingAudio} />
                                <div className="flex-1">
                                    <VoiceWaveform isPlaying={isPlayingAudio} />
                                </div>
                            </div>
                            {audioDuration && (
                                <div className="mt-3">
                                    <div className="flex justify-between text-xs text-blue-600 mb-1">
                                        <span>{formatTime(currentTime)}</span>
                                        <span>{formatTime(audioDuration)}</span>
                                    </div>
                                    <div className="w-full bg-blue-200 rounded-full h-1">
                                        <div
                                            className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                                            style={{ width: `${(currentTime / audioDuration) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'video':
                return (
                    <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Video Message</div>
                        <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-4 border border-red-200">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <FaVideo className="text-red-600" />
                                    <span className="text-sm font-medium text-red-800">Video Feedback</span>
                                </div>
                            </div>
                            <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                                <video
                                    ref={videoRef}
                                    src={mediaUrl}
                                    controls
                                    className="w-full h-full object-cover"
                                    preload="metadata"
                                >
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <Drawer
            open={isOpen}
            onClose={onClose}
            placement="right"
            width={480}
            title={
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold flex-shrink-0">
                            {feedback ? getInitials(feedback.feedbackMethod || '') : ''}
                        </div>
                        <div className="min-w-0">
                            <div className="text-gray-900 truncate">
                                {feedback?.mainMessage || `${feedback?.feedbackMethod} feedback` || '—'}
                            </div>
                            <div className="text-xs text-gray-500 truncate">Feedback details</div>
                        </div>
                    </div>
                </div>
            }
        >
            <div className="p-4 sm:p-6 space-y-6">
                {/* Status and Type and actions */}
                <div className="flex justify-between">
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${feedback ? getStatusColor(feedback.status) : 'bg-gray-100 text-gray-800'}`}>
                            {feedback?.status || 'Unknown'}
                        </span>
                        {feedback?.feedbackMethod && (
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getFeedbackTypeColor(feedback.feedbackMethod)}`}>
                                {feedback.feedbackMethod}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                        {onEdit && (
                            <button
                                onClick={() => onEdit(feedback!)}
                                className="bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors"
                                aria-label="Edit"
                            >
                                <FaPencilAlt size={18} className="text-gray-600" />
                            </button>
                        )}
                        {onResolve && (
                            <button
                                onClick={() => onResolve(feedback!)}
                                className="bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors"
                                aria-label="Resolve"
                            >
                                <FaCheckCircle size={18} className="text-green-500" />
                            </button>
                        )}
                        {onReply && (
                            <button
                                onClick={() => onReply(feedback!)}
                                className="bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors"
                                aria-label="Reply"
                            >
                                <TiMessage size={18} className="text-blue-500" />
                            </button>
                        )}
                        {(onReject || onDelete) && (
                            <CustomDropdown
                                trigger={
                                    <button
                                        className="bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors"
                                    >
                                        <FaEllipsisV size={18} className="text-gray-600" />
                                    </button>
                                }
                                position="bottom-right"
                                dropdownClassName="bg-white border border-gray-200 rounded-lg shadow-lg min-w-[120px]"
                            >
                                {onReject && (
                                    <DropdownItem
                                        onClick={() => onReject(feedback!)}
                                        icon={<FaTimes className="text-red-500" />}
                                        className="hover:bg-red-50"
                                    >
                                        Reject
                                    </DropdownItem>
                                )}
                                {onDelete && (
                                    <DropdownItem
                                        onClick={() => onDelete(feedback!)}
                                        icon={<FaTrash className="text-red-500" />}
                                        destructive
                                    >
                                        Delete
                                    </DropdownItem>
                                )}
                            </CustomDropdown>
                        )}
                    </div>
                </div>

                {/* User Information */}
                <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">User Information</div>
                    {renderUserInfo()}
                </div>

                {/* Project Information */}
                <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Project</div>
                    <div className="flex items-center gap-2">
                        <FaBuilding className="text-gray-400 text-sm" />
                        <span className="text-sm text-gray-700">
                            {feedback?.project?.name || 'No project assigned'}
                        </span>
                        {feedback?.project?.status && (
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full capitalize">
                                {spacer(feedback.project.status)}
                            </span>
                        )}
                    </div>
                </div>

                {/* Media Content */}
                {renderMediaContent()}

                {/* Primary fields */}
                <div className="space-y-4">
                    <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Feedback Type</div>
                        <div className="flex items-center gap-2 text-gray-800">
                            <FaTag className="text-gray-400" />
                            <span className="capitalize">{feedback?.feedbackType || '—'}</span>
                        </div>
                    </div>

                    <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Follow Up Needed</div>
                        <div className="flex items-center gap-2 text-gray-800">
                            {feedback?.followUpNeeded ? (
                                <><FaCheckCircle className="text-green-500" /> Yes</>
                            ) : (
                                <><FaTimesCircle className="text-gray-400" /> No</>
                            )}
                        </div>
                    </div>
                </div>

                {/* Message / Response */}
                {feedback?.mainMessage && (
                    <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Main Message</div>
                        <div className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-3">
                            {feedback.mainMessage}
                        </div>
                    </div>
                )}

                {/* Suggestions */}
                {feedback?.suggestions && (
                    <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Suggestions</div>
                        <div className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-3">
                            {feedback.suggestions}
                        </div>
                    </div>
                )}

                {/* Timestamps */}
                {(feedback?.createdAt || feedback?.updatedAt) && (
                    <div className="space-y-3 pt-4 border-t border-gray-200">
                        {feedback.createdAt && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Created</span>
                                <span className="text-gray-800">
                                    {new Date(feedback.createdAt).toLocaleString()}
                                </span>
                            </div>
                        )}
                        {feedback.updatedAt && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Last Updated</span>
                                <span className="text-gray-800">
                                    {new Date(feedback.updatedAt).toLocaleString()}
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Drawer>
    );
};
