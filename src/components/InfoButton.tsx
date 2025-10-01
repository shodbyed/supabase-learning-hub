/**
 * @fileoverview InfoButton Component
 * Reusable info button that shows helpful explanations in a floating popup
 */
import React, { useState, useRef, useEffect } from 'react';

interface InfoButtonProps {
  title: string;
  children: React.ReactNode;
  label?: string;
  className?: string;
}

/**
 * InfoButton Component
 *
 * Shows a small question mark button that toggles a floating popup
 *
 * @param title - Title for the info popup
 * @param children - Content to display in the info popup (can be JSX)
 * @param label - Optional text to display before the ? button
 * @param className - Additional CSS classes for the container
 */
export const InfoButton: React.FC<InfoButtonProps> = ({
  title,
  children,
  label,
  className = ""
}) => {
  const [showInfo, setShowInfo] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showInfo &&
        popupRef.current &&
        buttonRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowInfo(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showInfo]);

  const togglePopup = () => {
    setShowInfo(!showInfo);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-1">
        {label && (
          <span className="text-gray-700 text-sm font-medium">
            {label}
          </span>
        )}
        <button
          ref={buttonRef}
          onClick={togglePopup}
          className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 flex items-center justify-center text-sm font-bold"
          title="More information"
        >
          ?
        </button>
      </div>

      {showInfo && (
        <div
          ref={popupRef}
          className="absolute top-8 left-0 z-50 w-80 p-4 bg-white border border-gray-200 rounded-lg shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <button
              onClick={togglePopup}
              className="w-5 h-5 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          <div className="text-gray-700 text-sm">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};