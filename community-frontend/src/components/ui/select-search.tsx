import { useEffect, useMemo, useRef, useState } from "react";
import { FiCheck, FiChevronDown } from "react-icons/fi";
import { cn } from "@/utility/utility";
import { CustomDropdown } from "./dropdown";

interface SelectSearchOption {
  label: string;
  value: string;
}

interface SelectSearchProps {
  label?: string;
  options: SelectSearchOption[];
  value: string | number | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  labelClassName?: string;
  dropdownClassName?: string;
  triggerClassName?: string;
  disabled?: boolean;
  noMatchText?: string;
  disableDarkMode?: boolean;
}

export const SelectSearch: React.FC<SelectSearchProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = "Select or search...",
  className = "",
  dropdownClassName = "",
  labelClassName,
  triggerClassName = "",
  disabled = false,
  noMatchText = "No matches found",
  disableDarkMode = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const isOpeningRef = useRef(false); // Add this ref to track opening state

  const selectedOption = useMemo(
    () => options.find((o) => o.value === value),
    [options, value]
  );

  // Keep input showing the selected label when value changes externally (and when closed)
  useEffect(() => {
    if (!isOpen) {
      setInputValue(selectedOption?.label ?? "");
    }
  }, [selectedOption, isOpen]);

  const filtered = useMemo(() => {
    const q = inputValue.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, inputValue]);

  const handleSelect = (option: SelectSearchOption) => {
    onChange(option.value);
    setInputValue(option.label);
    setIsOpen(false);
    isOpeningRef.current = false; // Reset opening state
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    if (!disabled && !isOpen) {
      setIsOpen(true);
    }
  };

  // Add this useEffect to handle closing and reset opening state
  useEffect(() => {
    if (!isOpen) {
      isOpeningRef.current = false;
    }
  }, [isOpen]);

  return (
    <div className={className}>
      {label && (
        <label className={cn(`block text-sm font-medium text-gray-900 ${!disableDarkMode ? 'dark:text-gray-100' : ''} mb-2`, labelClassName)}>
          {label}
        </label>
      )}

      <CustomDropdown
        trigger={(
          <div className="relative">
            <input
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                `block w-full rounded-md bg-white ${!disableDarkMode ? 'dark:bg-gray-800' : ''} py-2.5 pr-8 pl-3 text-left outline-1 -outline-offset-1 outline-gray-300 ${!disableDarkMode ? 'dark:outline-gray-600' : ''} sm:text-sm placeholder-gray-500 ${!disableDarkMode ? 'dark:placeholder-gray-400' : ''} ${
                  disabled ? `bg-gray-50 ${!disableDarkMode ? 'dark:bg-gray-700' : ''} text-gray-400 ${!disableDarkMode ? 'dark:text-gray-500' : ''} cursor-not-allowed` : `text-gray-900 ${!disableDarkMode ? 'dark:text-gray-100' : ''}`
                }`,
                triggerClassName
              )}
            />
            <FiChevronDown
              className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 ${!disableDarkMode ? 'dark:text-gray-400' : ''} size-5 sm:size-4`}
              aria-hidden="true"
            />
          </div>
        )}
        isOpen={isOpen}
        onToggle={setIsOpen}
        disabled={disabled}
        dropdownClassName={cn(
          `w-full max-h-56 overflow-auto rounded-md bg-white ${!disableDarkMode ? 'dark:bg-gray-800' : ''} py-1 text-base shadow-lg ring-1 ring-black/5 ${!disableDarkMode ? 'dark:ring-gray-600' : ''} sm:text-sm`,
          dropdownClassName
        )}
        position="bottom-right"
      >
        {filtered.length > 0 ? (
          filtered.map((option) => (
            <div
              key={option.value}
              onClick={() => handleSelect(option)}
              className={cn(
                "relative cursor-default py-2 pr-9 pl-3 select-none hover:bg-primary hover:text-white group",
                option.value === value
                  ? `bg-indigo-50 ${!disableDarkMode ? 'dark:bg-indigo-900' : ''} text-[#004f64] ${!disableDarkMode ? 'dark:text-indigo-300' : ''} font-semibold`
                  : `text-gray-900 ${!disableDarkMode ? 'dark:text-gray-100' : ''}`
              )}
            >
              <span className="block truncate capitalize">{option.label}</span>
              {option.value === value && (
                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-primary">
                  <FiCheck className="size-5 group-hover:text-white" />
                </span>
              )}
            </div>
          ))
        ) : (
          <div className={`py-2 px-3 text-gray-500 ${!disableDarkMode ? 'dark:text-gray-400' : ''} text-sm`}>{noMatchText}</div>
        )}
      </CustomDropdown>
    </div>
  );
};