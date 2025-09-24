import { cn } from '@/utility/utility';
import React, { useState, useRef, useEffect, type ReactNode, type MouseEvent, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';

type Position =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'left'
  | 'right';

interface CustomDropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  isOpen?: boolean;
  onToggle?: (open: boolean) => void;
  position?: Position;
  className?: string;
  dropdownClassName?: string;
  disabled?: boolean;
  closeOnClick?: boolean;
  closeOnClickOutside?: boolean;
  portal?: boolean; // New prop to enable portal rendering
  portalContainer?: Element; // Optional custom portal container
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  trigger,
  children,
  isOpen: controlledIsOpen,
  onToggle,
  position = 'bottom-left',
  className = "",
  dropdownClassName = "",
  disabled = false,
  closeOnClick = true,
  closeOnClickOutside = true,
  portal = false,
  portalContainer
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  // Use controlled state if provided, otherwise use internal state
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = onToggle || setInternalIsOpen;

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        toggleDropdown();
        break;
      case 'Escape':
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  // Calculate dropdown position for portal rendering
  const updateDropdownPosition = () => {
    if (!triggerRef.current || !portal) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const { top, left, width, height } = triggerRect;
    
    let newTop = top;
    let newLeft = left;

    // Adjust position based on the position prop
    switch (position) {
      case 'top-left':
        newTop = top - 4; // 4px gap (mb-1)
        newLeft = left;
        break;
      case 'top-right':
        newTop = top - 4;
        newLeft = left + width;
        break;
      case 'bottom-left':
        newTop = top + height + 4; // 4px gap (mt-1)
        newLeft = left;
        break;
      case 'bottom-right':
        newTop = top + height + 4;
        newLeft = left + width;
        break;
      case 'left':
        newTop = top;
        newLeft = left - 4;
        break;
      case 'right':
        newTop = top;
        newLeft = left + width + 4;
        break;
      default:
        newTop = top + height + 4;
        newLeft = left;
    }

    setDropdownPosition({
      top: newTop + window.scrollY,
      left: newLeft + window.scrollX,
      width: width
    });
  };

  // Update position when dropdown opens or window resizes/scrolls
  useEffect(() => {
    if (isOpen && portal) {
      updateDropdownPosition();

      const handleResize = () => updateDropdownPosition();
      const handleScroll = () => updateDropdownPosition();

      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll, true);

      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll, true);
      };
    }
  }, [isOpen, portal, position]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!closeOnClickOutside) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      
      // Check if click is outside trigger
      if (triggerRef.current && triggerRef.current.contains(target)) {
        return;
      }

      // Check if click is outside dropdown
      if (dropdownRef.current && dropdownRef.current.contains(target)) {
        return;
      }

      setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside as EventListener);
    return () => document.removeEventListener('mousedown', handleClickOutside as EventListener);
  }, [closeOnClickOutside, setIsOpen]);

  const getPositionClasses = () => {
    if (portal) return ''; // No position classes needed for portal

    switch (position) {
      case 'top-left':
        return 'bottom-full mb-1 left-0';
      case 'top-right':
        return 'bottom-full mb-1 right-0';
      case 'bottom-left':
        return 'top-full mt-1 left-0';
      case 'bottom-right':
        return 'top-full mt-1 right-0';
      case 'left':
        return 'right-full mr-1 top-0';
      case 'right':
        return 'left-full ml-1 top-0';
      default:
        return 'top-full mt-1 left-0';
    }
  };

  const getPortalPositionStyles = () => {
    if (!portal) return {};

    let transform = '';
    
    switch (position) {
      case 'top-left':
        transform = 'translateY(-100%)';
        break;
      case 'top-right':
        transform = 'translateY(-100%) translateX(-100%)';
        break;
      case 'bottom-left':
        transform = '';
        break;
      case 'bottom-right':
        transform = 'translateX(-100%)';
        break;
      case 'left':
        transform = 'translateX(-100%)';
        break;
      case 'right':
        transform = '';
        break;
      default:
        transform = '';
    }

    return {
      position: 'fixed' as const,
      top: dropdownPosition.top,
      left: dropdownPosition.left,
      transform,
      zIndex: 9999,
      minWidth: position.includes('right') ? 'auto' : dropdownPosition.width
    };
  };

  const handleDropdownClick = (e?: React.MouseEvent) => {
    // prevent clicks inside dropdown from bubbling to parents (e.g., table rows/cards)
    if (e) e.stopPropagation();
    if (closeOnClick) {
      setIsOpen(false);
    }
  };

  const dropdownContent = isOpen && (
    <div
      ref={dropdownRef}
      className={cn(`${portal ? '' : 'absolute'} z-[9999] ${getPositionClasses()} ${dropdownClassName}`)}
      style={portal ? getPortalPositionStyles() : undefined}
      onClick={handleDropdownClick}
    >
      {children}
    </div>
  );

  return (
    <div className={`relative ${className}`}>
      <div
        ref={triggerRef}
        onClick={(e) => { e.stopPropagation(); toggleDropdown(); }}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        aria-expanded={isOpen}
        className={disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
      >
        {trigger}
      </div>

      {portal && dropdownContent
        ? createPortal(dropdownContent, portalContainer || document.body)
        : dropdownContent}
    </div>
  );
};

// Dropdown Menu Item Component (unchanged)
export interface DropdownItemProps {
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  disabled?: boolean;
  className?: string;
  icon?: ReactNode;
  destructive?: boolean;
}

export const DropdownItem: React.FC<DropdownItemProps> = ({
  children,
  onClick,
  disabled = false,
  className = "",
  icon,
  destructive = false
}) => {
  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!disabled && onClick) {
      onClick(e);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition-colors ${
        disabled
          ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
          : destructive
          ? 'text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-900 dark:hover:text-red-300'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
      }`, className)}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </div>
  );
};