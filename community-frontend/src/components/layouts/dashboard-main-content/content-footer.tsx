const ContentFooter = () => {
  return (
    <footer className="w-full bg-gradient-to-r border-t border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-4 absolute bottom-0 left-0 transition-colors">
      <div className="flex items-center justify-between">
        {/* Left side - Copyright */}
        <div className="text-gray-700 dark:text-gray-300 text-sm font-light">
          {new Date().getFullYear()} &#169; RICH.
        </div>
        
        {/* Right side - Settings icon and attribution */}
        <div className="flex items-center space-x-4">
          <div className="text-gray-700 dark:text-gray-300 text-sm font-light">
            Design & Develop by San Tech
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ContentFooter;