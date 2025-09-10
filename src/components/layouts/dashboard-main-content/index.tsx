interface MainContentProps {
    children: React.ReactNode;
}

// Main Layout Component
const MainContent: React.FC<MainContentProps> = ({ children }) => (
    <main className="px-4 max-sm:px-2 lg:px-8 relative min-h-[calc(100vh-109px)] pb-20">
      {children}
    </main>
  );

  export default MainContent;