import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface AnimatedTextareaProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  minHeight?: string;
  [key: string]: any; // Allow additional props for the textarea
}

const AnimatedTextarea: React.FC<AnimatedTextareaProps> = ({ 
  label, 
  value, 
  onChange, 
  minHeight = '120px',
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(!!value);

  const isFloating = isFocused || !!value;

  return (
    <div className="relative w-full">
      <textarea
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-2 focus:border-primary bg-white text-black resize-none peer"
        style={{ minHeight }}
        {...props}
      />
      <motion.label
        className="absolute left-4 text-gray-500 pointer-events-none origin-top-left"
        initial={false}
        animate={{
          top: isFloating ? '-8px' : '12px',
          scale: isFloating ? 0.75 : 1,
          translateY: isFloating ? 0 : 0,
          backgroundColor: isFloating ? 'white' : 'transparent',
          paddingLeft: isFloating ? '4px' : '0px',
          paddingRight: isFloating ? '4px' : '0px',
        }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
      >
        {label}
      </motion.label>
    </div>
  );
};

export default AnimatedTextarea;
