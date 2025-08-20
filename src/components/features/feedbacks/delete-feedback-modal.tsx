import React, { useEffect, useMemo, useState } from 'react';
import Modal, { ModalBody, ModalButton, ModalFooter } from '@/components/ui/modal';
import { FaExclamationTriangle } from 'react-icons/fa';

interface DeleteFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedbackId?: number;
  feedbackTitle?: string;
  onConfirm?: (feedbackId: number) => void;
}

const DeleteFeedbackModal: React.FC<DeleteFeedbackModalProps> = ({
  isOpen,
  onClose,
  feedbackId,
  feedbackTitle = '',
  onConfirm,
}) => {
  const [input, setInput] = useState('');
  const canDelete = useMemo(() => input.trim() === feedbackTitle.trim() && !!feedbackId, [input, feedbackTitle, feedbackId]);

  useEffect(() => {
    if (isOpen) setInput('');
  }, [isOpen]);

  const handleConfirm = () => {
    if (canDelete && feedbackId !== undefined) onConfirm?.(feedbackId);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Feedback" size="md">
      <ModalBody>
        <div className="flex items-start gap-3">
          <div className="mt-1">
            <FaExclamationTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <p className="text-gray-800 font-medium mb-1">You are about to permanently delete this feedback.</p>
            <p className="text-sm text-gray-600 mb-4">This action cannot be undone. All related data will be permanently removed.</p>
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
              <p className="text-sm text-red-800">
                Please type <span className="font-semibold">{feedbackTitle}</span> to confirm deletion.
              </p>
            </div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="confirmTitle">
              Feedback Title
            </label>
            <input
              id="confirmTitle"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter feedback title"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <ModalButton variant="secondary" onClick={onClose}>Cancel</ModalButton>
        <ModalButton variant="danger" disabled={!canDelete} onClick={handleConfirm}>
          Delete Feedback
        </ModalButton>
      </ModalFooter>
    </Modal>
  );
};

export default DeleteFeedbackModal;
