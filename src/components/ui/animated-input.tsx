import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface AnimatedInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  [key: string]: any; // Allow additional props for the input
}

const AnimatedInput: React.FC<AnimatedInputProps> = ({ label, value, onChange, type = 'text', ...props }) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(!!value);

  const isFloating = isFocused || !!value;

  return (
    <div className="relative w-full">
      <input
        type={type}
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-2 focus:border-primary bg-white text-black peer"
        {...props}
      />
      <motion.label
        className="absolute left-4 text-gray-500 pointer-events-none origin-top-left"
        initial={false}
        animate={{
          top: isFloating ? '-8px' : '50%',
          scale: isFloating ? 0.75 : 1,
          translateY: isFloating ? 0 : '-50%',
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

export default AnimatedInput;