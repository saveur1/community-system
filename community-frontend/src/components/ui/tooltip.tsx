import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaX } from 'react-icons/fa6';

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  trigger?: 'hover' | 'click';
  closable?: boolean;
  delay?: number;
  offset?: number;
  className?: string;
  arrowClassName?: string;
}

type Position = 'top' | 'bottom' | 'left' | 'right';

const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  trigger = 'hover',
  closable = false,
  delay = 0,
  offset = 8,
  className = '',
  arrowClassName = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<Position>('top');
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    const spaceAbove = triggerRect.top;
    const spaceBelow = viewport.height - triggerRect.bottom;
    const spaceLeft = triggerRect.left;
    const spaceRight = viewport.width - triggerRect.right;

    let newPosition: Position = 'top';
    let x = 0;
    let y = 0;

    // Determine best position based on available space
    if (spaceAbove >= tooltipRect.height + offset && spaceAbove >= spaceBelow) {
      newPosition = 'top';
      x = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
      y = triggerRect.top - tooltipRect.height - offset;
    } else if (spaceBelow >= tooltipRect.height + offset) {
      newPosition = 'bottom';
      x = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
      y = triggerRect.bottom + offset;
    } else if (spaceRight >= tooltipRect.width + offset && spaceRight >= spaceLeft) {
      newPosition = 'right';
      x = triggerRect.right + offset;
      y = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
    } else {
      newPosition = 'left';
      x = triggerRect.left - tooltipRect.width - offset;
      y = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
    }

    // Ensure tooltip stays within viewport bounds
    x = Math.max(8, Math.min(x, viewport.width - tooltipRect.width - 8));
    y = Math.max(8, Math.min(y, viewport.height - tooltipRect.height - 8));

    setPosition(newPosition);
    setCoords({ x, y });
  };

  const showTooltip = () => {
    if (delay > 0) {
      timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
    } else {
      setIsVisible(true);
    }
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const handleTriggerEvent = () => {
    if (trigger === 'click') {
      setIsVisible(!isVisible);
    }
  };

  useEffect(() => {
    if (isVisible) {
      // Small delay to ensure DOM has updated
      const timer = setTimeout(calculatePosition, 0);
      return () => clearTimeout(timer);
    }
  }, [isVisible, content]);

  useEffect(() => {
    const handleResize = () => {
      if (isVisible) {
        calculatePosition();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        trigger === 'click' &&
        isVisible &&
        triggerRef.current &&
        tooltipRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        !tooltipRef.current.contains(event.target as Node)
      ) {
        hideTooltip();
      }
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, trigger]);

  const getArrowClasses = () => {
    const baseClasses = 'absolute w-2 h-2 bg-gray-900 dark:bg-gray-700 transform rotate-45';
    
    switch (position) {
      case 'top':
        return `${baseClasses} -bottom-1 left-1/2 -translate-x-1/2`;
      case 'bottom':
        return `${baseClasses} -top-1 left-1/2 -translate-x-1/2`;
      case 'left':
        return `${baseClasses} -right-1 top-1/2 -translate-y-1/2`;
      case 'right':
        return `${baseClasses} -left-1 top-1/2 -translate-y-1/2`;
      default:
        return baseClasses;
    }
  };

  const getAnimationProps = () => {
    const scale = { scale: [0.8, 1] };
    const opacity = { opacity: [0, 1] };
    
    switch (position) {
      case 'top':
        return { ...scale, ...opacity, y: [10, 0] };
      case 'bottom':
        return { ...scale, ...opacity, y: [-10, 0] };
      case 'left':
        return { ...scale, ...opacity, x: [10, 0] };
      case 'right':
        return { ...scale, ...opacity, x: [-10, 0] };
      default:
        return { ...scale, ...opacity };
    }
  };

  return (
    <>
      <div
        ref={triggerRef}
        className="inline-block"
        onMouseEnter={trigger === 'hover' ? showTooltip : undefined}
        onMouseLeave={trigger === 'hover' ? hideTooltip : undefined}
        onClick={trigger === 'click' ? handleTriggerEvent : undefined}
      >
        {children}
      </div>

      <AnimatePresence>
        {isVisible && (
          <div
            ref={tooltipRef}
            className="fixed z-50 pointer-events-none"
            style={{
              left: coords.x,
              top: coords.y,
            }}
          >
            <motion.div
              initial={getAnimationProps()}
              animate={{
                scale: 1,
                opacity: 1,
                x: 0,
                y: 0,
              }}
              exit={{
                scale: 0.8,
                opacity: 0,
                transition: { duration: 0.15 }
              }}
              transition={{
                type: "spring",
                damping: 20,
                stiffness: 300,
                duration: 0.2
              }}
              className={`
                relative bg-gray-900 dark:bg-gray-700 text-white dark:text-gray-100 text-sm px-3 py-2 rounded-lg shadow-lg
                max-w-xs break-words pointer-events-auto
                ${className}
              `}
            >
              {closable && (
                <button
                  onClick={hideTooltip}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-gray-700 dark:bg-gray-600 hover:bg-gray-600 dark:hover:bg-gray-500 rounded-full flex items-center justify-center transition-colors"
                >
                  <FaX size={12} />
                </button>
              )}
              
              <div className="relative z-10">
                {content}
              </div>
              
              <div className={`${getArrowClasses()} ${arrowClassName}`} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Tooltip;