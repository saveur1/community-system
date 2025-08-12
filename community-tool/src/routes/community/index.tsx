import { createFileRoute } from '@tanstack/react-router';
import { AiOutlineClockCircle, AiOutlineEnvironment } from 'react-icons/ai';

export const Route = createFileRoute('/community/')({
  component: DashboardHome,
})

const WelcomeHeader = ({ name }: { name: string }) => {
  return (
    <div className="mb-8 mt-6 lg:mt-8">
      <h1 className="text-2xl font-bold text-gray-600">Welcome back, <span className="text-primary">{name}</span></h1>
      <p className="text-gray-500 mt-2">
        Track surveys, share feedback, and join community sessions.
      </p>
    </div>
  );
};

const QuickActionsCard = () => {
  return (
    <div className="bg-white col-span-2 rounded-xl shadow-sm h-fit border border-gray-200 flex flex-col items-center p-6 transition-all hover:shadow-md">
      <h2 className="text-lg font-semibold text-title mb-5">Quick Actions</h2>
      <div className="flex flex-wrap gap-3">
        <button className="bg-primary text-white px-5 py-2 rounded-md hover:bg-primary-dark cursor-pointer transition-colors text-center font-medium shadow-sm">
          Fill Survey
        </button>
        <button className="bg-gray-200 cursor-pointer text-gray-700 px-5 py-2 rounded-md hover:bg-gray-50 transition-colors border border-gray-100 text-center font-medium shadow-sm">
          Give Feedback
        </button>
      </div>
    </div>
  );
};

const SurveysDueSoonCard = () => {
  const surveys = [
    { title: 'Maternal Health Survey', due: 'Aug 13', urgent: true },
    { title: 'Youth Engagement Survey', due: 'Aug 16', urgent: false },
    { title: 'Nutrition Survey', due: 'Aug 20', urgent: false }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 transition-all hover:shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-title tracking-tight">Surveys Due Soon</h2>
        <a href="#" className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors">
          View all
        </a>
      </div>
      <ul className="space-y-4">
        {surveys.map((survey, index) => (
          <li
            key={index}
            className="flex justify-between cursor-pointer items-center p-4 bg-gray-50/50 hover:bg-gray-100 transition-all duration-200 border-b border-gray-300"
          >
            <div className="flex items-center space-x-3">
              <span className="text-lg font-semibold text-gray-900">{survey.title}</span>
              {survey.urgent && (
                <span className="inline-flex items-center bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a1 1 0 110-2 1 1 0 010 2zm0-3V5a1 1 0 10-2 0v8a1 1 0 102 0z"/>
                  </svg>
                  Urgent
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className={`text-sm font-medium ${survey.urgent ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                Due {survey.due}
              </span>
              <button className="text-sm font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                Start
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

const NotificationsCard = () => {
  const notifications = [
    { text: 'New survey available: Maternal Health', read: false },
    { text: 'Community session this Friday', read: false },
    { text: 'Your feedback was acknowledged', read: true }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all hover:shadow-md">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-semibold text-gray-800">Notifications</h2>
        <span className="text-sm text-primary cursor-pointer font-medium">View all</span>
      </div>
      <div className="space-y-3">
        {notifications.map((note, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border ${note.read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'} transition-colors`}
          >
            <div className="flex items-start">
              {!note.read && (
                <span className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 mr-2"></span>
              )}
              <span className={`text-sm ${note.read ? 'text-gray-600' : 'text-gray-800 font-medium'}`}>
                {note.text}
              </span>
            </div>
            <div className={`text-xs text-gray-400 mt-1 ${note.read ? 'ml-0' : 'ml-4' }`}>
              {note.read ? 'Read' : 'New'} • 2h ago
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const UpcomingSessionsCard = () => {
  const sessions = [
    {
      title: 'Maternal Health Talk',
      date: 'Thu, Aug 14',
      time: '10:00 AM',
      location: 'Community Hall',
      featured: true
    },
    {
      title: 'Nutrition Webinar',
      date: 'Sun, Aug 17',
      time: '2:00 PM',
      location: 'Online',
      featured: false
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all hover:shadow-md">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-semibold text-title">Upcoming Sessions</h2>
        <span className="text-sm text-blue-600 font-medium">See all</span>
      </div>
      <ul className="space-y-4">
        {sessions.map((session, index) => (
          <li
            key={index}
            className={`p-4 rounded-lg border ${session.featured ? 'border-blue-200 bg-blue-50' : 'border-gray-200'} transition-colors`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-800">{session.title}</h3>
                <div className="text-gray-500 text-sm mt-1 flex flex-wrap items-center gap-y-1">
                  <div className="flex items-center mr-3">
                    <AiOutlineClockCircle className="mr-1.5 text-gray-400" />
                    {session.date} • {session.time}
                  </div>
                  <div className="flex items-center">
                    <AiOutlineEnvironment className="mr-1.5 text-gray-400" />
                    {session.location}
                  </div>
                </div>
              </div>
              <button className={`px-4 py-1.5 rounded-lg text-sm font-medium ${session.featured ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}`}>
                RSVP
              </button>
            </div>
            {session.featured && (
              <div className="mt-2 text-xs text-blue-800 bg-blue-100 inline-block px-2 py-0.5 rounded-full">
                Featured Event
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

function DashboardHome() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-8xl mx-auto">
        <WelcomeHeader name="Joe Doe" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 gap-y-8">
          <QuickActionsCard />
          <SurveysDueSoonCard />
          <UpcomingSessionsCard />
        </div>
      </div>
    </div>
  );
}