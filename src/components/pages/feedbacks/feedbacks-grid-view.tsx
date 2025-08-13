import { FeedbackItem } from "@/utility/types";
import { FeedbackCard } from "./feedback-card";


interface FeedbackGridProps {
  feedbacks: FeedbackItem[];
  getStatusColor: (status: string) => string;
  getInitials: (text: string) => string;
  getActions: (fb: FeedbackItem) => any[];
  handleAction: (action: string, fb: FeedbackItem) => void;
}

export const FeedbackGrid = ({
  feedbacks,
  getStatusColor,
  getInitials,
  getActions,
  handleAction,
}: FeedbackGridProps) => {
  return (
    <div className="grid grid-cols-1 w-full md:grid-cols-2 lg:grid-cols-3 gap-6">
      {feedbacks.map((fb) => (
        <FeedbackCard
          key={fb.id}
          feedback={fb}
          getStatusColor={getStatusColor}
          getInitials={getInitials}
          getActions={getActions}
          handleAction={handleAction}
        />
      ))}
    </div>
  );
};