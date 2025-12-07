/**
 * @fileoverview Joker Icon Component
 *
 * Custom joker/wildcard icon from Tabler Icons.
 * Used to represent wildcard spots in playoff brackets.
 */

import React from 'react';

interface JokerIconProps {
  className?: string;
  size?: number;
}

/**
 * Joker icon for wildcard representation
 *
 * @param className - Optional CSS classes for styling
 * @param size - Icon size in pixels (default: 24)
 */
export const JokerIcon: React.FC<JokerIconProps> = ({ className, size = 24 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M5 16m0 1.5a1.5 1.5 0 0 1 1.5 -1.5h11a1.5 1.5 0 0 1 1.5 1.5v0a1.5 1.5 0 0 1 -1.5 1.5h-11a1.5 1.5 0 0 1 -1.5 -1.5z" />
      <path d="M12 16q -2.5 -8 -6 -8q -2.5 0 -3 2c2.953 .31 3.308 3.33 4 6" />
      <path d="M12 16q 2.5 -8 6 -8q 2.5 0 3 2c-2.953 .31 -3.308 3.33 -4 6" />
      <path d="M9 9.5q 2 -3.5 3 -3.5t 3 3.5" />
    </svg>
  );
};

export default JokerIcon;
