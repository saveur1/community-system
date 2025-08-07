import { useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

// Custom Calendar Component built with Tailwind CSS
const CustomCalendar = ({ selectedDate, setSelectedDate }: { selectedDate: Date | null, setSelectedDate: (date: Date) => void }) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const today = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const previousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const selectDate = (day: number) => {
    // Fix: set time to noon to avoid timezone issues
    const date = new Date(currentYear, currentMonth, day, 12, 0, 0, 0);
    setSelectedDate(date);
  };

  const isToday = (day: number) => {
    return today.getDate() === day && 
           today.getMonth() === currentMonth && 
           today.getFullYear() === currentYear;
  };

  const isSelected = (day: number) => {
    return selectedDate && 
           selectedDate.getDate() === day && 
           selectedDate.getMonth() === currentMonth && 
           selectedDate.getFullYear() === currentYear;
  };

  // Generate calendar days
  const calendarDays = [];
  
  // Empty cells for days before the first day of the month
  for (let i = 0; i < firstDayWeekday; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="h-10"></div>);
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(
      <button
        key={day}
        type="button"
        onClick={() => selectDate(day)}
        className={`
          h-10 w-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors
          ${isToday(day) 
            ? 'bg-blue-600 text-white' 
            : isSelected(day)
            ? 'bg-blue-100 text-blue-600'
            : 'hover:bg-gray-100 text-gray-700'
          }
        `}
      >
        {day}
      </button>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 min-w-[300px] max-w-sm mx-auto">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={previousMonth}
          type="button"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiChevronLeft size={20} className="text-gray-600" />
        </button>
        
        <h2 className="text-lg font-semibold text-gray-900">
          {monthNames[currentMonth]} {currentYear}
        </h2>
        
        <button
          onClick={nextMonth}
          type="button"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiChevronRight size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="h-10 flex items-center justify-center">
            <span className="text-xs font-medium text-gray-500">{day}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays}
      </div>
    </div>
  );
};

export default CustomCalendar;