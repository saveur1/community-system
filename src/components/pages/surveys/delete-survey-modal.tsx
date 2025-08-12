import React, { useEffect, useMemo, useState } from 'react';
import Modal, { ModalBody, ModalButton, ModalFooter } from '@/components/ui/modal';
import { FaExclamationTriangle } from 'react-icons/fa';

interface DeleteSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  surveyId?: number;
  surveyTitle?: string;
  onConfirm?: (surveyId: number) => void;
}

const DeleteSurveyModal: React.FC<DeleteSurveyModalProps> = ({
  isOpen,
  onClose,
  surveyId,
  surveyTitle = '',
  onConfirm,
}) => {
  const [input, setInput] = useState('');
  const canDelete = useMemo(() => input.trim() === surveyTitle.trim() && !!surveyId, [input, surveyTitle, surveyId]);

  useEffect(() => {
    if (isOpen) {
      setInput('');
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (canDelete && surveyId !== undefined) {
      onConfirm?.(surveyId);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Survey" size="md">
      <ModalBody>
        <div className="flex items-start gap-3">
          <div className="mt-1">
            <FaExclamationTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <p className="text-gray-800 font-medium mb-1">You are about to permanently delete this survey.</p>
            <p className="text-sm text-gray-600 mb-4">
              This action cannot be undone. All responses and related data will be permanently removed.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
              <p className="text-sm text-red-800">
                Please type <span className="font-semibold">{surveyTitle}</span> to confirm deletion.
              </p>
            </div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="confirmTitle">
              Survey Title
            </label>
            <input
              id="confirmTitle"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter survey title"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <ModalButton variant="secondary" onClick={onClose}>Cancel</ModalButton>
        <ModalButton variant="danger" disabled={!canDelete} onClick={handleConfirm}>
          Delete Survey
        </ModalButton>
      </ModalFooter>
    </Modal>
  );
};

export default DeleteSurveyModal;
