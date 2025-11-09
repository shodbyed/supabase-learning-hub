/**
 * @fileoverview 8-Ball Icon Component
 *
 * Custom SVG icon of an 8-ball for use in the application.
 * Shows a solid black ball with white circle and the number 8.
 */

interface EightBallIconProps {
  className?: string;
  size?: number;
}

export const EightBallIcon = ({ className = "", size = 24 }: EightBallIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
    >
      {/* White background */}
      <rect x="0" y="0" width="100" height="100" fill="white"/>
      {/* Outer black ball */}
      <circle cx="50" cy="50" r="48" fill="black" stroke="black" strokeWidth="2"/>
      {/* Inner white circle for the number */}
      <circle cx="50" cy="50" r="18" fill="white" stroke="black" strokeWidth="2"/>
      {/* Number 8 */}
      <text
        x="50"
        y="58"
        textAnchor="middle"
        fontSize="20"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="700"
        fill="black"
      >
        8
      </text>
    </svg>
  );
};
