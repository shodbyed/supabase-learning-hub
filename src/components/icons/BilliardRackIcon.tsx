/**
 * @fileoverview Billiard Rack Icon Component
 *
 * Custom SVG icon of a rack of billiard balls in a triangle formation.
 * Shows a triangle rack with 15 colored balls arranged in standard formation.
 */

interface BilliardRackIconProps {
  className?: string;
  size?: number;
}

export const BilliardRackIcon = ({ className = "", size = 24 }: BilliardRackIconProps) => {
  // Calculate width based on aspect ratio (120:140 = 6:7)
  const width = size;
  const height = (size * 140) / 120;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 140"
      width={width}
      height={height}
      className={className}
    >
      {/* Background */}
      <rect x="0" y="0" width="120" height="140" fill="white"/>
      {/* Triangle rack */}
      <polygon points="12.5,110 15,115 105.5,115 107.5,110 62.5,30 57.5,30" fill="none" stroke="black" strokeWidth="4"/>
      {/* Row 1 (1 ball) */}
      <circle cx="60" cy="48" r="8" fill="#FFD700" stroke="black" strokeWidth="1"/>
      {/* Row 2 (2 balls) */}
      <circle cx="52" cy="62" r="8" fill="#FF0000" stroke="black" strokeWidth="1"/>
      <circle cx="68" cy="62" r="8" fill="#0000FF" stroke="black" strokeWidth="1"/>
      {/* Row 3 (3 balls) */}
      <circle cx="44" cy="76" r="8" fill="#00FF00" stroke="black" strokeWidth="1"/>
      <circle cx="60" cy="76" r="8" fill="#000000" stroke="black" strokeWidth="1"/> {/* black ball stays */}
      <circle cx="76" cy="76" r="8" fill="#800080" stroke="black" strokeWidth="1"/>
      {/* Row 4 (4 balls) */}
      <circle cx="36" cy="90" r="8" fill="#FFD700" stroke="black" strokeWidth="1"/>
      <circle cx="52" cy="90" r="8" fill="#FF7F00" stroke="black" strokeWidth="1"/>
      <circle cx="68" cy="90" r="8" fill="#FF0000" stroke="black" strokeWidth="1"/>
      <circle cx="84" cy="90" r="8" fill="#00FF00" stroke="black" strokeWidth="1"/>
      {/* Row 5 (5 balls) */}
      <circle cx="28" cy="104" r="8" fill="#800080" stroke="black" strokeWidth="1"/>
      <circle cx="44" cy="104" r="8" fill="#0000FF" stroke="black" strokeWidth="1"/>
      <circle cx="60" cy="104" r="8" fill="#FF7F00" stroke="black" strokeWidth="1"/>
      <circle cx="76" cy="104" r="8" fill="#8B4513" stroke="black" strokeWidth="1"/>
      <circle cx="92" cy="104" r="8" fill="#8B4513" stroke="black" strokeWidth="1"/>
    </svg>
  );
};
