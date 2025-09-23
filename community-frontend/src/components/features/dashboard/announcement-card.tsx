import {
  HiOutlineSpeakerphone,
  HiOutlineX,
  HiOutlineInformationCircle,
  HiOutlineExclamationCircle,
} from "react-icons/hi";

// Announcement Card Component
interface AnnouncementCardProps {
  type?: 'info' | 'warning' | 'success' | 'announcement' | 'primary';
  title: string;
  message: string;
  isVisible: boolean;
  onDismiss: () => void;
  actionButton?: {
    text: string;
    onClick: () => void;
  };
}

const AnnouncementCard = ({ 
  type = 'announcement', 
  title, 
  message, 
  isVisible, 
  onDismiss,
  actionButton 
}: AnnouncementCardProps) => {
  if (!isVisible) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'info':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
          icon: <HiOutlineInformationCircle className="text-blue-500 dark:text-blue-400" size={24} />,
          titleColor: 'text-blue-800 dark:text-blue-200',
          textColor: 'text-blue-700 dark:text-blue-300'
        };
      case 'warning':
        return {
          bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
          icon: <HiOutlineExclamationCircle className="text-amber-500 dark:text-amber-400" size={24} />,
          titleColor: 'text-amber-800 dark:text-amber-200',
          textColor: 'text-amber-700 dark:text-amber-300'
        };
      case 'primary': 
        return {
          bg: 'bg-primary/10 dark:bg-primary/20 border-primary dark:border-primary/60',
          icon: <HiOutlineSpeakerphone className="text-primary dark:text-primary-light" size={24} />,
          titleColor: 'text-primary-dark dark:text-primary-light',
          textColor: 'text-primary-dark dark:text-primary-light'
        };
      case 'success':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
          icon: <HiOutlineInformationCircle className="text-green-500 dark:text-green-400" size={24} />,
          titleColor: 'text-green-800 dark:text-green-200',
          textColor: 'text-green-700 dark:text-green-300'
        };
      default:
        return {
          bg: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800',
          icon: <HiOutlineSpeakerphone className="text-indigo-500 dark:text-indigo-400" size={24} />,
          titleColor: 'text-indigo-800 dark:text-indigo-200',
          textColor: 'text-indigo-700 dark:text-indigo-300'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className={`${styles.bg} border rounded-lg p-4 mb-6 relative`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          {styles.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-semibold ${styles.titleColor}`}>
            {title}
          </h3>
          <p className={`mt-1 text-sm ${styles.textColor}`}>
            {message}
          </p>
          {actionButton && (
            <div className="mt-3">
              <button
                onClick={actionButton.onClick}
                className={`inline-flex items-center cursor-pointer px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  type === 'info' ? 'bg-blue-100 dark:bg-blue-800/50 hover:bg-blue-200 dark:hover:bg-blue-700/50 text-blue-800 dark:text-blue-200' :
                  type === 'warning' ? 'bg-amber-100 dark:bg-amber-800/50 hover:bg-amber-200 dark:hover:bg-amber-700/50 text-amber-800 dark:text-amber-200' :
                  type === 'success' ? 'bg-green-100 dark:bg-green-800/50 hover:bg-green-200 dark:hover:bg-green-700/50 text-green-800 dark:text-green-200' :
                  type === 'primary' ? 'bg-primary/20 dark:bg-primary/30 hover:bg-primary/90 dark:hover:bg-primary/80 text-primary-dark dark:text-primary-light hover:text-white dark:hover:text-white' :
                  'bg-indigo-100 dark:bg-indigo-800/50 hover:bg-indigo-200 dark:hover:bg-indigo-700/50 text-indigo-800 dark:text-indigo-200'
                }`}
              >
                {actionButton.text}
              </button>
            </div>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="flex-shrink-0 p-1 hover:bg-white/50 dark:hover:bg-black/20 cursor-pointer rounded-full transition-colors"
        >
          <HiOutlineX className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" size={18} />
        </button>
      </div>
    </div>
  );
};

export default AnnouncementCard;