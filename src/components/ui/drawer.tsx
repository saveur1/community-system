import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';

// Minimal classNames utility (avoids external dependency)
function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export type DrawerPlacement = 'right' | 'bottom';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  placement?: DrawerPlacement;
  width?: number | string; // for right placement
  height?: number | string; // for bottom placement
  showClose?: boolean;
  className?: string;
  overlayClassName?: string;
  children: React.ReactNode;
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const Drawer: React.FC<DrawerProps> = ({
  open,
  onClose,
  title,
  placement = 'right',
  width = 420,
  height = 380,
  showClose = true,
  className,
  overlayClassName,
  children,
}) => {
  const isRight = placement === 'right';

  const panelVariants = isRight
    ? {
        hidden: { x: '100%' },
        visible: { x: 0 },
        exit: { x: '100%' },
      }
    : {
        hidden: { y: '100%' },
        visible: { y: 0 },
        exit: { y: '100%' },
      };

  const sizeStyle = isRight ? { width } : { height };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={cn(
            'fixed inset-0 z-50 flex',
            isRight ? 'justify-end items-stretch' : 'justify-center items-end'
          )}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Overlay */}
          <motion.div
            className={cn('absolute inset-0 bg-black/40', overlayClassName)}
            variants={overlayVariants}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-title"
            className={cn(
              'relative bg-white shadow-xl border border-gray-200',
              isRight ? 'h-full' : 'w-full rounded-t-xl',
              className
            )}
            style={sizeStyle}
            variants={panelVariants}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className={cn('flex items-center justify-between border-b border-gray-200 px-4 sm:px-6', isRight ? 'h-14' : 'h-12 rounded-t-xl bg-white') }>
              <div id="drawer-title" className="text-sm font-semibold text-gray-800 truncate">
                {title}
              </div>
              {showClose && (
                <button
                  onClick={onClose}
                  aria-label="Close drawer"
                  className="p-2 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className={cn('overflow-y-auto', isRight ? 'h-[calc(100%-3.5rem)]' : 'max-h-[70vh]')}> 
              {children}
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Drawer;
