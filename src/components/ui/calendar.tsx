/**
 * @fileoverview Simple Calendar Component
 * Basic calendar popup for date selection using existing UI components
 */
import React, { useState, useRef, useEffect } from 'react';
import { Button } from './button';
import { Card } from './card';

interface CalendarProps {
  value?: string; // ISO date string (YYYY-MM-DD)
  onChange: (date: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minDate?: string; // ISO date string
  maxDate?: string; // ISO date string
}

/**
 * Simple Calendar Component
 *
 * Displays a basic date input with calendar popup for visual date selection
 * Uses native HTML5 date input as fallback on mobile devices
 */
export const Calendar: React.FC<CalendarProps> = ({
  value,
  onChange,
  placeholder = 'Select date',
  disabled = false,
  minDate,
  maxDate
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null
  );
  const [viewDate, setViewDate] = useState<Date>(
    value ? new Date(value) : new Date()
  );
  const calendarRef = useRef<HTMLDivElement>(null);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);


  const formatISODate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    setSelectedDate(newDate);
    onChange(formatISODate(newDate));
    setIsOpen(false);
  };

  // Sync view date when manual input changes
  useEffect(() => {
    if (value && selectedDate) {
      const inputDate = new Date(value);
      if (inputDate.getMonth() !== viewDate.getMonth() || inputDate.getFullYear() !== viewDate.getFullYear()) {
        setViewDate(inputDate);
      }
    }
  }, [value, selectedDate]);

  const handleMonthNav = (direction: 'prev' | 'next') => {
    setViewDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getDaysInMonth = (date: Date): (number | null)[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (number | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const isDateDisabled = (day: number): boolean => {
    if (disabled) return true;

    const checkDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const checkDateISO = formatISODate(checkDate);

    if (minDate && checkDateISO < minDate) return true;
    if (maxDate && checkDateISO > maxDate) return true;

    return false;
  };

  const isToday = (day: number): boolean => {
    const today = new Date();
    const checkDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    return (
      checkDate.getDate() === today.getDate() &&
      checkDate.getMonth() === today.getMonth() &&
      checkDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number): boolean => {
    if (!selectedDate) return false;
    const checkDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    return (
      checkDate.getDate() === selectedDate.getDate() &&
      checkDate.getMonth() === selectedDate.getMonth() &&
      checkDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  const days = getDaysInMonth(viewDate);
  const monthYear = viewDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="relative" ref={calendarRef}>
      {/* Date Input with Calendar Icon */}
      <div className="relative">
        <input
          type="date"
          value={value || ''}
          onChange={(e) => {
            const newValue = e.target.value;
            onChange(newValue);
            if (newValue) {
              setSelectedDate(new Date(newValue));
            } else {
              setSelectedDate(null);
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          min={minDate}
          max={maxDate}
          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
        />
        {/* Calendar Popup Button */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
        >
          📅
        </Button>
      </div>

      {/* Calendar Popup */}
      {isOpen && (
        <Card className="absolute top-full left-0 z-50 mt-2 p-4 shadow-lg bg-white border">
          <div className="w-64">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleMonthNav('prev')}
              >
                ←
              </Button>
              <h3 className="font-semibold text-gray-900">{monthYear}</h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleMonthNav('next')}
              >
                →
              </Button>
            </div>

            {/* Day Labels */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-xs font-medium text-gray-500 p-2 text-center">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => (
                <div key={index} className="aspect-square">
                  {day && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDateSelect(day)}
                      disabled={isDateDisabled(day)}
                      className={`w-full h-full p-0 text-sm ${
                        isSelected(day)
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : isToday(day)
                          ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {day}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};