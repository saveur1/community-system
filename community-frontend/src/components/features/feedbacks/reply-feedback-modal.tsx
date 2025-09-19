import React, { useEffect, useState } from 'react';
import Modal, { ModalBody, ModalFooter, ModalButton } from '@/components/ui/modal';
import type { FeedbackEntity } from '@/api/feedback';
import { useAddFeedbackReply } from '@/hooks/useFeedback';

interface ReplyFeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    feedback: FeedbackEntity | undefined;
    onSubmitReply?: (feedback: FeedbackEntity, payload: { subject: string; message: string }) => Promise<void> | void;
}

const ReplyFeedbackModal: React.FC<ReplyFeedbackModalProps> = ({ isOpen, onClose, feedback, onSubmitReply }) => {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const addReplyMutation = useAddFeedbackReply(feedback?.id || '');

    useEffect(() => {
        if (!isOpen) {
            setSubject('');
            setMessage('');
            setError(null);
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        if (!feedback) return;
        if (!message.trim()) {
            setError('Message is required');
            return;
        }
        setError(null);
        setIsSending(true);
        try {
            if (onSubmitReply) {
                await onSubmitReply(feedback, {
                    subject: subject.trim(),
                    message: message.trim(),
                });
            } else if (feedback?.id) {
                await addReplyMutation.mutateAsync({
                    subject: subject.trim() || null,
                    message: message.trim(),
                });
            }
            onClose();
            setSubject('');
            setMessage('');
        } catch (_) {
            setError('Failed to send reply');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Reply to Feedback" size="lg">
            <ModalBody>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                        <input
                            type="email"
                            readOnly
                            value={feedback?.user?.email || ''}
                            placeholder="No recipient email available"
                            className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-700 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Subject"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Write your reply..."
                            rows={6}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                        />
                    </div>
                    {error && (
                        <div className="text-sm text-red-600">{error}</div>
                    )}
                </div>
            </ModalBody>
            <ModalFooter>
                <ModalButton variant="secondary" onClick={onClose} disabled={isSending}>
                    Cancel
                </ModalButton>
                <ModalButton onClick={handleSubmit} loading={isSending}>
                    Send Reply
                </ModalButton>
            </ModalFooter>
        </Modal>
    );
};

export default ReplyFeedbackModal;

