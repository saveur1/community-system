import { useState, useRef, useEffect } from "react";
import CustomCalendar from "./calendar";
import { BiCalendar } from "react-icons/bi";

interface DatepickerInputProps {
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
}

const DatepickerInput = ({ selectedDate, setSelectedDate }: DatepickerInputProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={wrapperRef} className="relative max-w-sm mx-auto">
      <div className="relative">
        <input
          type="text"
          value={selectedDate ? selectedDate.toLocaleDateString() : ''}
          onChange={() => {}}
          placeholder="Select date"
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          onFocus={() => setIsOpen(true)}
          readOnly
        />
        <BiCalendar size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
      </div>
      {isOpen && (
        <div className="absolute z-10 mt-1">
          <div className="relative">
            <CustomCalendar selectedDate={selectedDate} setSelectedDate={(date) => { setSelectedDate(date); setIsOpen(false); }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default DatepickerInput;