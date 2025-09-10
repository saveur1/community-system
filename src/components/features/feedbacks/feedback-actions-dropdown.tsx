import { FeedbackEntity } from "@/api/feedback";
import { CustomDropdown, DropdownItem } from "@/components/ui/dropdown"
import { FC } from "react";
import { FaCheck, FaCheckDouble, FaEllipsisV, FaReply, FaTimes, FaTrash } from "react-icons/fa"
import useAuth from "@/hooks/useAuth";
import { checkPermissions } from "@/utility/logicFunctions";

interface ActionsProps {
    handleAction: (action: string, fb: FeedbackEntity) => void;
    fb: FeedbackEntity
}

const isCurrentItem = (fb: FeedbackEntity, status: string) => {
    return fb.status === status;
}
const FeedbackActionsDropdown:FC<ActionsProps> = ({ handleAction, fb }) => {
    const { user } = useAuth();
    const canManage = checkPermissions(user, 'feedback:all:read');
    return (
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
                        onClick={() => handleAction('reply', fb)}
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
    )
}

export default FeedbackActionsDropdown;