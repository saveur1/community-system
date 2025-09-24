import { FeedbackCard } from "./feedback-card";
import type { FeedbackEntity } from "@/api/feedback";

interface FeedbackGridProps {
  feedbacks: FeedbackEntity[];
  getStatusColor: (status: string) => string;
  getInitials: (text: string) => string;
  getActions: (fb: FeedbackEntity) => any[];
  handleAction: (action: string, fb: FeedbackEntity) => void;
  isLoading?: boolean;
}

export const FeedbackGrid = ({
  feedbacks,
  getStatusColor,
  getInitials,
  getActions,
  handleAction,
  isLoading,
}: FeedbackGridProps) => {
  return (
    <div className="grid grid-cols-1 w-full md:grid-cols-2 lg:grid-cols-3 gap-6">
      {isLoading
        ? Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5 animate-pulse"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600"></div>
                  <div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-28 mb-1"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-20"></div>
                  </div>
                </div>
                <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded-full w-20"></div>
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
              <div className="flex justify-between items-center mt-5 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded-full w-16"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-24"></div>
              </div>
            </div>
          ))
        : feedbacks.length === 0
        ? (
          <div className="col-span-full text-center py-10 text-gray-500 dark:text-gray-400">
            No feedbacks found.
          </div>
          )
        : (feedbacks.map((fb) => (
            <FeedbackCard
              key={fb.id}
              feedback={fb}
              getStatusColor={getStatusColor}
              getInitials={getInitials}
              getActions={getActions}
              handleAction={handleAction}
            />
          )))
      }
    </div>
  );
};