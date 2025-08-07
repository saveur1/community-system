import { FaLightbulb, FaArrowRight } from 'react-icons/fa';

const ServiceUpdateCard = () => {
  return (
    <div className="bg-white rounded-lg max-w-8xl mx-auto my-12 shadow-md overflow-hidden w-full border border-gray-200">
      {/* Header with icon */}
      <div className="bg-primary px-6 py-4 flex items-center">
        <FaLightbulb className="text-white text-2xl mr-3" />
        <h2 className="text-xl font-bold text-white">Announcement</h2>
      </div>
      
      {/* Content */}
      <div className="p-6">
        <p className="text-gray-700 mb-4">
          The IremboGov portal has been upgraded based on your valuable feedback! We've added new features to make accessing government services easier than ever.
        </p>
        
        <div className="flex items-center text-success font-medium">
          <a 
            href="https://www.irembo.gov.rw" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center hover:underline"
          >
            Visit the updated portal
            <FaArrowRight className="ml-2" />
          </a>
        </div>
      </div>
      
      {/* Footer with subtle background */}
      <div className="bg-gray-50 px-6 py-3 text-sm text-gray-500">
        Last updated: {new Date().toLocaleDateString()}
      </div>
    </div>
  );
};

export default ServiceUpdateCard;