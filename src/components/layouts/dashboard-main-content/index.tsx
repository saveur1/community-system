interface MainContentProps {
    children: React.ReactNode;
}

// Main Layout Component
const MainContent: React.FC<MainContentProps> = ({ children }) => (
    <main className="px-4 lg:px-8 relative">
      {children}
    </main>
  );

  export default MainContent;