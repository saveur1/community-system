import { cn } from '@/utility/utility';
import React from 'react';
import { Link } from '@tanstack/react-router';

interface BreadcrumbItem {
  title: string;
  link?: string;
}

interface BreadcrumbProps {
  title: string;
  items: (string | BreadcrumbItem)[];
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, title, className }) => {
  return (
    <nav
      className={cn(
        'bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600 flex flex-col sm:flex-row sm:justify-between py-2 sm:py-3 px-3 sm:px-4 md:px-6 w-full',
        className
      )}
      aria-label="Breadcrumb"
    >
      <h4
        className="text-sm sm:text-base md:text-lg uppercase text-title dark:text-gray-100 font-semibold mb-2 sm:mb-0"
      >
        {title}
      </h4>
      <ol className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300 flex-wrap">
        {items.map((item, index) => {
          const isString = typeof item === 'string';
          const itemTitle = isString ? item : item.title;
          const itemLink = isString ? undefined : item.link;
          const isLast = index === items.length - 1;
          
          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <span className="mx-1 sm:mx-2 text-gray-400 dark:text-gray-500">&gt;</span>
              )}
              {itemLink && !isLast ? (
                <Link
                  to={itemLink}
                  className={cn(
                    'font-medium truncate max-w-[150px] sm:max-w-[200px] transition-colors duration-200',
                    'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:underline cursor-pointer'
                  )}
                >
                  {itemTitle}
                </Link>
              ) : (
                <span
                  className={cn(
                    'font-medium truncate max-w-[150px] sm:max-w-[200px]',
                    isLast
                      ? 'text-title dark:text-gray-100'
                      : 'text-gray-500 dark:text-gray-400'
                  )}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {itemTitle}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;