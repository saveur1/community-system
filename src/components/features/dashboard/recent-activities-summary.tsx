// Mock data for recent user activities
const recentActivities = [
    { id: 1, user: "John Doe", action: "Completed survey", timestamp: "2025-09-01 10:30 AM" },
    { id: 2, user: "Jane Smith", action: "Submitted feedback", timestamp: "2025-09-01 09:15 AM" },
    { id: 3, user: "Alex Brown", action: "Created report", timestamp: "2025-08-31 03:45 PM" },
    { id: 4, user: "Emily Davis", action: "Updated profile", timestamp: "2025-08-31 11:20 AM" },
  ];
  
  function RecentUserActivities() {
    const lastThreeActivities = recentActivities.slice(0, 3);
  
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Recent User Activities</h2>
        <div className="space-y-1">
          {lastThreeActivities.map((activity, index) => (
            <div 
              key={activity.id} 
              className="relative flex items-center justify-between py-3 pl-6"
            >
              {/* Tree branch connector */}
              <div className="absolute left-0 top-0 bottom-0 w-4 flex items-center justify-center">
                {/* Vertical line */}
                <div className="w-0.5 h-full bg-gray-300 absolute"></div>
                
                {/* Circle node */}
                <div className="w-3 h-3 rounded-full bg-primary z-10 relative"></div>
                
                {/* Horizontal branch - only for items that aren't the last one */}
                {index !== lastThreeActivities.length - 1 && (
                  <div className="absolute left-3 w-2 h-0.5 bg-gray-300"></div>
                )}
              </div>
              
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                <p className="text-sm text-gray-600">{activity.action}</p>
              </div>
              <p className="text-sm text-gray-500">{activity.timestamp}</p>
            </div>
          ))}
        </div>
        
        {/* View More link */}
        {recentActivities.length > 3 && (
          <div className="mt-4 text-center">
            <a href="#" className="text-primary hover:text-primary-dark text-sm font-medium">
              View more
            </a>
          </div>
        )}
      </div>
    );
  }
  
  export default RecentUserActivities;