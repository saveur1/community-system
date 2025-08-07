import { cn } from '@/utility/utility';
import React, { useState, useRef, useEffect,type ReactNode,type MouseEvent,type KeyboardEvent } from 'react';

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
  closeOnClickOutside = true
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!closeOnClickOutside) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside as EventListener);
    return () => document.removeEventListener('mousedown', handleClickOutside as EventListener);
  }, [closeOnClickOutside, setIsOpen]);

  const getPositionClasses = () => {
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

  const handleDropdownClick = () => {
    if (closeOnClick) {
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-expanded={isOpen}
        className={disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
      >
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`absolute z-50 ${getPositionClasses()} ${dropdownClassName}`}
          onClick={handleDropdownClick}
        >
          {children}
        </div>
      )}
    </div>
  );
};

// Dropdown Menu Item Component
interface DropdownItemProps {
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
          ? 'text-gray-400 cursor-not-allowed'
          : destructive
          ? 'text-red-700 hover:bg-red-50 hover:text-red-900'
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
      }`, className)}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </div>
  );
};