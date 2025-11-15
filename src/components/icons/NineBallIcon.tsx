/**
 * @fileoverview 9-Ball Icon Component
 *
 * Custom SVG icon of a 9-ball for use in the application.
 * Shows a white ball with yellow stripe and the number 9.
 * Enhanced with gradients, shadows, and highlights for a 3D effect.
 */

interface NineBallIconProps {
  className?: string;
  size?: number;
}

export const NineBallIcon = ({ className = "", size = 24 }: NineBallIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 110"
      width={size}
      height={size * 1.1}
      className={className}
    >
      <defs>
        {/* Ball body gradient (light top-left to dark bottom-right) */}
        <radialGradient id="ballGradient-9" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="white"/>
          <stop offset="50%" stopColor="#F5F5F5"/>
          <stop offset="100%" stopColor="#CCCCCC"/>
        </radialGradient>
        {/* Yellow stripe gradient */}
        <linearGradient id="stripeGradient-9" x1="0" y1="40%" x2="100%" y2="60%">
          <stop offset="0%" stopColor="#FFEF7A"/>
          <stop offset="50%" stopColor="#FFD700"/>
          <stop offset="100%" stopColor="#E0B800"/>
        </linearGradient>
        {/* Subtle highlight */}
        <radialGradient id="highlight-9" cx="35%" cy="25%" r="25%">
          <stop offset="0%" stopColor="white" stopOpacity="0.8"/>
          <stop offset="100%" stopColor="white" stopOpacity="0"/>
        </radialGradient>
        {/* Drop shadow filter */}
        <filter id="shadow-9" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="black" floodOpacity="0.4"/>
        </filter>
      </defs>
      {/* Shadow under ball */}
      <ellipse cx="50" cy="95" rx="28" ry="6" fill="black" opacity="0.25"/>
      {/* Outer white ball with subtle gradient */}
      <circle cx="50" cy="50" r="48" fill="url(#ballGradient-9)" stroke="black" strokeWidth="2" filter="url(#shadow-9)"/>
      {/* Fatter curved yellow stripe with gradient */}
      <ellipse cx="50" cy="50" rx="60" ry="26" fill="url(#stripeGradient-9)"/>
      {/* Thin top grey border */}
      <path d="M -10,50 A 60,26 0 0 1 110,50" fill="none" stroke="grey" strokeWidth="0.5"/>
      {/* Black ring */}
      <circle cx="50" cy="50" r="55" fill="none" stroke="black" strokeWidth="16"/>
      {/* White overlay ring */}
      <circle cx="50" cy="50" r="55.5" fill="none" stroke="white" strokeWidth="16"/>
      {/* Inner white circle for number */}
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
      {/* Glossy highlight */}
      <circle cx="38" cy="38" r="15" fill="url(#highlight-9)"/>
    </svg>
  );
};
