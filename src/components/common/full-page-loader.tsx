import { TbLoader3 } from 'react-icons/tb';

interface FullPageLoaderProps {
  text?: string;
  className?: string;
}

export function FullPageLoader({ 
  text = 'Loading...',
  className = '' 
}: FullPageLoaderProps) {
  return (
    <div className={`fixed inset-0 flex flex-col items-center justify-center bg-white dark:bg-gray-900 z-50 ${className}`}>
      <TbLoader3 className="w-12 h-12 text-primary animate-spin" />
      {text && (
        <p className="mt-2 text-lg font-medium text-primary">
          {text}
        </p>
      )}
    </div>
  );
}

export default FullPageLoader;