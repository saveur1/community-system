import { FiCheck, FiChevronDown } from "react-icons/fi";
import { CustomDropdown } from "./dropdown";
import { useState } from "react";
import { cn } from "@/utility/utility";

interface SelectDropdownOption {
  label: string;
  value: string;
}

interface SelectDropdownProps {
  label?: string;
  options: SelectDropdownOption[];
  value: string | number | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  labelClassName?: string;
  dropdownClassName?: string;
  triggerClassName?: string;
  disabled?: boolean;
  portal?:boolean;
}

export const SelectDropdown: React.FC<SelectDropdownProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  className = "",
  dropdownClassName = "",
  labelClassName,
  triggerClassName="",
  disabled = false,
  portal = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options?.find(option => option.value === value);

  const selectOption = (option: SelectDropdownOption) => {
    onChange(option.value);
    setIsOpen(false);
  };

  const trigger = (
    <div className={cn(`grid w-full cursor-default grid-cols-1 rounded-md bg-white dark:bg-gray-800 py-2.5 pr-2 pl-3 text-left outline-1 -outline-offset-1 outline-gray-300 dark:outline-gray-600 sm:text-sm ${
      disabled ? 'bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' : 'text-gray-900 dark:text-gray-100'
    }`, triggerClassName)}>
      <span className="col-start-1 row-start-1 flex items-center pr-6">
        <span className={`block truncate ${selectedOption ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
      </span>
      <FiChevronDown
        className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 dark:text-gray-400 sm:size-4"
        aria-hidden="true"
      />
    </div>
  );

  return (
    <div className={className}>
      {label && (
        <label className={cn("block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2", labelClassName)}>
          {label}
        </label>
      )}

      <CustomDropdown
        trigger={trigger}
        isOpen={isOpen}
        onToggle={setIsOpen}
        disabled={disabled}
        dropdownClassName={cn("w-full max-h-56 overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black/5 dark:ring-gray-600 sm:text-sm", dropdownClassName)}
        position="bottom-right"
        portal={ portal }
      >
        {options?.map((option) => (
          <div
            key={option.value}
            onClick={() => selectOption(option)}
            className={`relative cursor-default py-2 pr-9 pl-3 select-none hover:bg-primary hover:text-white group ${
              option.value === value ? 'bg-indigo-50 dark:bg-indigo-900 text-[#004f64] dark:text-indigo-300 font-semibold' : 'text-gray-900 dark:text-gray-100'
            }`}
          >
            <span className="block truncate capitalize">{option.label}</span>
            {option.value === value && (
              <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-primary">
                <FiCheck className="size-5 group-hover:text-white" />
              </span>
            )}
          </div>
        ))}
      </CustomDropdown>
    </div>
  );
};