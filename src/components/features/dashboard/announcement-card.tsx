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
          bg: 'bg-blue-50 border-blue-200',
          icon: <HiOutlineInformationCircle className="text-blue-500" size={24} />,
          titleColor: 'text-blue-800',
          textColor: 'text-blue-700'
        };
      case 'warning':
        return {
          bg: 'bg-amber-50 border-amber-200',
          icon: <HiOutlineExclamationCircle className="text-amber-500" size={24} />,
          titleColor: 'text-amber-800',
          textColor: 'text-amber-700'
        };
      case 'primary': 
        return {
          bg: 'bg-primary/10 border-primary',
          icon: <HiOutlineSpeakerphone className="text-primary" size={24} />,
          titleColor: 'text-primary-dark',
          textColor: 'text-primary-dark'
        };
      case 'success':
        return {
          bg: 'bg-green-50 border-green-200',
          icon: <HiOutlineInformationCircle className="text-green-500" size={24} />,
          titleColor: 'text-green-800',
          textColor: 'text-green-700'
        };
      default:
        return {
          bg: 'bg-indigo-50 border-indigo-200',
          icon: <HiOutlineSpeakerphone className="text-indigo-500" size={24} />,
          titleColor: 'text-indigo-800',
          textColor: 'text-indigo-700'
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
                  type === 'info' ? 'bg-blue-100 hover:bg-blue-200 text-blue-800' :
                  type === 'warning' ? 'bg-amber-100 hover:bg-amber-200 text-amber-800' :
                  type === 'success' ? 'bg-green-100 hover:bg-green-200 text-green-800' :
                  type === 'primary' ? 'bg-primary/20 hover:bg-primary/90 text-primary-dark hover:text-white' :
                  'bg-indigo-100 hover:bg-indigo-200 text-indigo-800'
                }`}
              >
                {actionButton.text}
              </button>
            </div>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="flex-shrink-0 p-1 hover:bg-white/50 cursor-pointer rounded-full transition-colors"
        >
          <HiOutlineX className="text-gray-400 hover:text-gray-600" size={18} />
        </button>
      </div>
    </div>
  );
};

export default AnnouncementCard;