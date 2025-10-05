import useAuth from '@/hooks/useAuth';
import { useSystemLogsList } from '@/hooks/useSystemLogs';
import { getResourceLink, spacer, timeAgo } from '@/utility/logicFunctions';
import { Link } from '@tanstack/react-router';
import { LuActivity } from 'react-icons/lu';

function RecentUserActivities() {
  const { user } = useAuth();
  const userId = user?.id;

  // fetch last 4 logs for current user
  const { data, isLoading, isError } = useSystemLogsList({ page: 1, limit: 4, userId });

  const recentActivities = data?.result ?? [];

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold dark:text-gray-200 mb-4">Recent User Activities</h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">Loading recent activities...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold dark:text-gray-200 mb-4">Recent User Activities</h2>
        <div className="text-sm text-red-500 dark:text-red-400">Failed to load recent activities.</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 h-full">
      <h2 className="text-lg font-semibold dark:text-gray-200 mb-4">Recent User Activities</h2>
      <div className="space-y-1">
        {recentActivities.length === 0 ? (
          <div className="text-sm text-gray-500 dark:text-gray-400">No recent activities.</div>
        ) : (
          recentActivities.map((activity, index) => (
            <div key={activity.id} className="relative flex items-center border-b border-spacing-x-80 border-gray-100 dark:border-gray-700 justify-between py-3 pl-6">
              <div className="absolute -left-2 top-0 bottom-0 w-4 flex items-center justify-center">
                <div className="w-0.5 h-full bg-gray-300 dark:bg-gray-600 absolute"></div>
                <div className="w-3 h-3 rounded-full bg-primary z-10 relative"></div>
                {index !== recentActivities.length - 1 && (
                  <div className="absolute left-3 w-2 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
                )}
              </div>

              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">{spacer(activity.action)} - <Link to={getResourceLink(activity.action, activity.resourceId || "")} className="text-primary dark:text-primary-light underline">{activity.resourceType}</Link></p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{timeAgo(activity.createdAt)}</p>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 pr-5"><LuActivity size={20}/></p>
            </div>
          ))
        )}
      </div>

      {recentActivities.length > 0 && (
        <div className="mt-4 text-center">
          <a href="/dashboard/activities" className="text-primary dark:text-primary-light hover:text-primary-dark dark:hover:text-primary text-sm font-medium">
            View more
          </a>
        </div>
      )}
    </div>
  );
}

export default RecentUserActivities;