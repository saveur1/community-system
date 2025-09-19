const ContentFooter = () => {
  return (
    <footer className="w-full bg-gradient-to-r border-t border-gray-300 bg-white px-6 py-4 absolute bottom-0 left-0">
      <div className="flex items-center justify-between">
        {/* Left side - Copyright */}
        <div className="text-gray-700 text-sm font-light">
          {new Date().getFullYear()} © RICH.
        </div>
        
        {/* Right side - Settings icon and attribution */}
        <div className="flex items-center space-x-4">
          <div className="text-gray-700 text-sm font-light">
            Design & Develop by San Tech
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ContentFooter;