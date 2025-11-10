/**
 * @fileoverview 9-Ball Icon Component
 *
 * Custom SVG icon of a 9-ball for use in the application.
 * Shows a white ball with yellow stripe and the number 9.
 */

interface NineBallIconProps {
  className?: string;
  size?: number;
}

export const NineBallIcon = ({ className = "", size = 24 }: NineBallIconProps) => {
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
      {/* Outer white ball */}
      <circle cx="50" cy="50" r="48" fill="white" stroke="black" strokeWidth="2"/>
      {/* Fatter, slightly curved yellow stripe */}
      <ellipse cx="50" cy="50" rx="60" ry="26" fill="#FFD700"/>
      {/* Top half grey border (thin) */}
      <path d="M -10,50 A 60,26 0 0 1 110,50" fill="none" stroke="grey" strokeWidth="0.5"/>
      {/* Black ring (hollow) with r = 55, stroke-width = 16 */}
      <circle cx="50" cy="50" r="55" fill="none" stroke="black" strokeWidth="16"/>
      {/* White overlay ring slightly larger with r = 55.5 */}
      <circle cx="50" cy="50" r="55.5" fill="none" stroke="white" strokeWidth="16"/>
      {/* Inner white circle for the number */}
      <circle cx="50" cy="50" r="14" fill="white" stroke="black" strokeWidth="2"/>
      {/* Number 9 */}
      <text
        x="50"
        y="55"
        textAnchor="middle"
        fontSize="14"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="700"
        fill="black"
      >
        9
      </text>
    </svg>
  );
};
