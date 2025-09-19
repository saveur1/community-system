import type { FeedbackEntity } from "@/api/feedback";
import { CustomDropdown, DropdownItem } from "@/components/ui/dropdown"
import type { FC } from "react";
import { useState } from "react";
import { FaCheck, FaCheckDouble, FaEllipsisV, FaReply, FaTimes, FaTrash } from "react-icons/fa"
import useAuth from "@/hooks/useAuth";
import { checkPermissions } from "@/utility/logicFunctions";

import ReplyFeedbackModal from "@/components/features/feedbacks/reply-feedback-modal";

interface ActionsProps {
    handleAction: (action: string, fb: FeedbackEntity) => void;
    fb: FeedbackEntity;
    onSubmitReply?: (feedback: FeedbackEntity, payload: { subject: string; message: string }) => Promise<void> | void;
}

const isCurrentItem = (fb: FeedbackEntity, status: string) => {
    return fb.status === status;
}
const FeedbackActionsDropdown:FC<ActionsProps> = ({ handleAction, fb, onSubmitReply }) => {
    const { user } = useAuth();
    const canManage = checkPermissions(user, 'feedback:all:read');
    const [isReplyOpen, setIsReplyOpen] = useState(false);
    return (
        <>
        <CustomDropdown
            trigger={
                <button className="text-gray-400 hover:text-gray-600 p-1">
                    <FaEllipsisV className="w-4 h-4" />
                </button>
            }
            position="bottom-right"
            portal={true}
            dropdownClassName="bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-48"
        >
            {canManage && (
                <>
                    <DropdownItem
                        icon={<FaCheck className="w-4 h-4" />}
                        onClick={() => handleAction('acknowledge', fb)}
                        disabled={isCurrentItem(fb, 'Acknowledged')}
                    >
                        Acknowledge
                    </DropdownItem>
                    <DropdownItem
                        icon={<FaCheckDouble className="w-4 h-4" />}
                        onClick={() => handleAction('resolve', fb)}
                        disabled={isCurrentItem(fb, 'Resolved')}
                    >
                        Resolve
                    </DropdownItem>
                    <DropdownItem
                        icon={<FaTimes className="w-4 h-4" />}
                        onClick={() => handleAction('reject', fb)}
                        disabled={isCurrentItem(fb, 'Rejected')}
                    >
                        Reject
                    </DropdownItem>
                    <DropdownItem
                        icon={<FaReply className="w-4 h-4" />}
                        onClick={() => setIsReplyOpen(true)}
                        disabled={isCurrentItem(fb, 'Replied')}
                    >
                        Reply
                    </DropdownItem>
                </>
            )}
            <DropdownItem
                icon={<FaTrash className="w-4 h-4" />}
                destructive={true}
                onClick={() => handleAction('delete', fb)}
            >
                Delete
            </DropdownItem>
        </CustomDropdown>
        <ReplyFeedbackModal
            isOpen={isReplyOpen}
            onClose={() => setIsReplyOpen(false)}
            feedback={fb}
            onSubmitReply={onSubmitReply}
        />
        </>
    )
}

export default FeedbackActionsDropdown;