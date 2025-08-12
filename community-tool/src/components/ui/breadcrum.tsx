import React from 'react';

interface BreadcrumbProps {
    title: string,
  items: string[];
  className?: string
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, title, className }) => {
  return (
    <nav className={`bg-white border-b border-gray-300 flex justify-between py-2.5 px-4 ${className ? className : ""}`}>
        <h4 className="text-base uppercase text-title font-semibold">{title}</h4>
      <ol className="flex items-center space-x-2 text-sm text-gray-600">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <span className="mx-2 text-gray-400">&gt;</span>
            )}
            <span
              className={`font-medium ${index === items.length - 1 ? 'text-title' : 'text-gray-500 hover:text-gray-700'}`}
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