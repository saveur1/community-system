// components/settings/WebsiteTab.tsx
import React from 'react';
import { FiEdit3 } from 'react-icons/fi';

interface WebsiteTabProps {}

export const WebsiteTab: React.FC<WebsiteTabProps> = () => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">Website Content Management</h3>
      
      <div className="space-y-6">
        <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
          <h4 className="font-semibold text-gray-900 dark:text-gray-200 mb-4">Hero Section Slideshow</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {[
              { url: "/images/gathering.jpg", alt: "Community health workers" },
              { url: "/images/malaria.jpg", alt: "Interfaith dialogue" },
              { url: "/images/child.jpg", alt: "Community listening" },
              { url: "/images/counciljpg.jpg", alt: "Religious leaders" }
            ].map((img, i) => (
              <div key={i} className="relative group">
                <img src={img.url} alt={img.alt} className="w-full h-24 object-cover rounded-lg" />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <button className="text-white p-2 hover:bg-white hover:bg-opacity-20 dark:hover:bg-gray-700 rounded">
                    <FiEdit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button className="px-4 py-2 bg-primary dark:bg-primary/80 text-white rounded-lg hover:bg-primary-dark dark:hover:bg-primary transition-colors">
            Upload New Images
          </button>
        </div>

        <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
          <h4 className="font-semibold text-gray-900 dark:text-gray-200 mb-4">Impact Statistics</h4>
          <div className="space-y-4">
            {[
              { label: "Community Members Reached", value: "2M+", color: "blue" },
              { label: "Children Enrolled in ECD Programs", value: "5,854+", color: "pink" },
              { label: "Mothers Reached Through ANC", value: "2,720+", color: "green" }
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-4 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className={`w-4 h-4 bg-${stat.color}-500 rounded`}></div>
                <input 
                  type="text" 
                  defaultValue={stat.label} 
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary"
                />
                <input 
                  type="text" 
                  defaultValue={stat.value} 
                  className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary"
                />
              </div>
            ))}
          </div>
          <button className="mt-4 px-4 py-2 bg-primary dark:bg-primary/80 text-white rounded-lg hover:bg-primary-dark dark:hover:bg-primary transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};