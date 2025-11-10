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
      viewBox="0 0 100 110"
      width={size}
      height={size * 1.1}
      className={className}
    >
      <defs>
        {/* Black ball gradient (lighter top-left to darker bottom-right) */}
        <radialGradient id="ballGradient-8" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#333333"/>
          <stop offset="50%" stopColor="#1A1A1A"/>
          <stop offset="100%" stopColor="#000000"/>
        </radialGradient>
        {/* Subtle highlight */}
        <radialGradient id="highlight-8" cx="35%" cy="25%" r="25%">
          <stop offset="0%" stopColor="white" stopOpacity="0.4"/>
          <stop offset="100%" stopColor="white" stopOpacity="0"/>
        </radialGradient>
        {/* Drop shadow filter */}
        <filter id="shadow-8" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="black" floodOpacity="0.4"/>
        </filter>
      </defs>
      {/* Shadow under ball */}
      <ellipse cx="50" cy="95" rx="28" ry="6" fill="black" opacity="0.25"/>
      {/* Outer black ball with gradient */}
      <circle cx="50" cy="50" r="48" fill="url(#ballGradient-8)" stroke="black" strokeWidth="2" filter="url(#shadow-8)"/>
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
      {/* Glossy highlight */}
      <circle cx="38" cy="38" r="15" fill="url(#highlight-8)"/>
    </svg>
  );
};
