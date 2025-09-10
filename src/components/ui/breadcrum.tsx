import { cn } from '@/utility/utility';
import React from 'react';

interface BreadcrumbProps {
  title: string;
  items: string[];
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, title, className }) => {
  return (
    <nav
      className={cn(
        'bg-white border-b border-gray-300 flex flex-col sm:flex-row sm:justify-between py-2 sm:py-3 px-3 sm:px-4 md:px-6 w-full',
        className
      )}
      aria-label="Breadcrumb"
    >
      <h4
        className="text-sm sm:text-base md:text-lg uppercase text-title font-semibold mb-2 sm:mb-0"
      >
        {title}
      </h4>
      <ol className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm md:text-base text-gray-600 flex-wrap">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <span className="mx-1 sm:mx-2 text-gray-400">&gt;</span>
            )}
            <span
              className={cn(
                'font-medium truncate max-w-[150px] sm:max-w-[200px]',
                index === items.length - 1
                  ? 'text-title'
                  : 'text-gray-500 hover:text-gray-700'
              )}
              aria-current={index === items.length - 1 ? 'page' : undefined}
            >
              {item}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;