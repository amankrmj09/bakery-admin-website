import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Input } from './Input';

export default function CustomDatePicker({ value, onChange, label, placeholder, minDate, error }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value ? new Date(value) : new Date());
  const containerRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync currentMonth with value if it changes externally
  useEffect(() => {
    if (value) {
      setCurrentMonth(new Date(value));
    }
  }, [value]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth(); // 0-11

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const handlePrevMonth = (e) => {
    e.preventDefault();
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = (e) => {
    e.preventDefault();
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const handleDateSelect = (day) => {
    const selectedDate = new Date(year, month, day);
    // Adjust for timezone offset to prevent date shifting when converting to ISO string
    const offset = selectedDate.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(selectedDate.getTime() - offset)).toISOString().split('T')[0];
    
    onChange(localISOTime);
    setIsOpen(false);
  };

  const isSelected = (day) => {
    if (!value) return false;
    const d = new Date(value);
    return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
  };

  const isBeforeMinDate = (day) => {
    if (!minDate) return false;
    const d = new Date(year, month, day);
    d.setHours(0, 0, 0, 0);
    const m = new Date(minDate);
    m.setHours(0, 0, 0, 0);
    return d < m;
  };

  const displayValue = value ? new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '';

  return (
    <div className="relative w-full" ref={containerRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        <Input 
          label={label}
          value={displayValue}
          placeholder={placeholder || "Select date"}
          readOnly
          error={error}
          icon={CalendarIcon}
          className="cursor-pointer"
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 p-4 w-72 bg-white dark:bg-slate-900 border border-[var(--border-color)] rounded-2xl shadow-xl transform origin-top animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <button 
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="font-bold text-sm text-[var(--text-main)]">
              {monthNames[month]} {year}
            </div>
            <button 
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="h-8" />
            ))}
            
            {/* Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const disabled = isBeforeMinDate(day);
              const selected = isSelected(day);
              
              return (
                <button
                  key={day}
                  disabled={disabled}
                  onClick={() => handleDateSelect(day)}
                  className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center text-sm transition-all mx-auto",
                    disabled 
                      ? "text-slate-300 dark:text-slate-700 cursor-not-allowed" 
                      : selected
                        ? "bg-primary-500 text-white font-bold shadow-md shadow-primary-500/30"
                        : "text-[var(--text-main)] hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary-500"
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
