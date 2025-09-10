import React from 'react';
import Modal, { ModalFooter, ModalButton } from '@/components/ui/modal';
import { QRCodeCanvas } from 'qrcode.react';
import { FiCopy } from 'react-icons/fi';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  survey: any | null;
  shareLink: string;
  isCopying: boolean;
  onCopy: (link: string) => void;
};

const SurveyShareModal: React.FC<Props> = ({ isOpen, onClose, survey, shareLink, isCopying, onCopy }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Survey" size="lg" closeOnOverlayClick>
      <div className="p-4">
        <div className="flex gap-6">
          <div className="flex-1">
            <h4 className="text-lg font-semibold mb-2">{survey?.title}</h4>
            <p className="text-sm text-gray-600 mb-4">Share the survey link or scan the QR code to allow respondents to open the survey on their device.</p>

            <label className="block text-sm font-medium text-gray-700 mb-2">Shareable link</label>
            <div className="flex items-center gap-2">
              <input readOnly value={shareLink} className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50" />
              <button onClick={() => onCopy(shareLink)} className="px-3 py-2 bg-primary text-white rounded-md flex items-center gap-2">
                <FiCopy />
                {isCopying ? 'Copying' : 'Copy'}
              </button>
            </div>

            {survey?.allowedRoles && (survey.allowedRoles.length > 0) && (
              <div className="mt-4 border border-gray-200 p-3 rounded-md">
                <label className="block text-sm font-medium text-gray-700 mb-2">Allowed roles</label>
                <div className="flex flex-wrap gap-2">
                  {survey.allowedRoles.map((r: any) => {
                    const label = (r.name || r.displayName || '').toString().split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                    return (
                      <span key={r.id} className="inline-flex items-center bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                        {label || r.id}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-3">
              <a href={`mailto:?subject=${encodeURIComponent('Please take this survey')}&body=${encodeURIComponent(shareLink)}`} className="text-sm text-primary hover:underline">Share via Email</a>
              <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('Please take this survey')}&url=${encodeURIComponent(shareLink)}`} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">Share on Twitter</a>
            </div>

            <div className="mt-4 text-sm text-gray-500">
              <p>Tip: You can paste this link into chat, email or copy it to your clipboard. The QR code on the right can be scanned by mobile users.</p>
            </div>
          </div>

          <div className="w-48 flex-shrink-0 flex flex-col items-center justify-center border-l border-gray-100 pl-4">
            <div className="bg-white p-3 rounded-md shadow-sm">
              {shareLink ? <QRCodeCanvas value={shareLink} size={160} /> : <div className="w-40 h-40 bg-gray-100" />}
            </div>
            <div className="text-xs text-gray-500 mt-3 text-center">Scan to open survey</div>
          </div>
        </div>
      </div>
      <ModalFooter>
        <ModalButton onClick={onClose} variant="secondary">Close</ModalButton>
        <ModalButton onClick={() => onCopy(shareLink)} variant="primary">Copy link</ModalButton>
      </ModalFooter>
    </Modal>
  );
};

export default SurveyShareModal;
