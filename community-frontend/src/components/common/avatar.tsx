interface LogoProps {
    collapsed: boolean;
  }
  
  // Logo Component
  const Avatar: React.FC<LogoProps> = ({ collapsed }) => (
    <div className={`flex items-center gap-2 ${collapsed ? "hidden" : "block"}`}>
      <img
        src="/images/web_logo3.png"
        alt="Acme Inc. Logo"
        className="h-10 w-auto"
      />
    </div>
  );

  export default Avatar