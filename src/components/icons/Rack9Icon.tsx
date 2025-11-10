/**
 * @fileoverview 9-Ball Rack Icon Component
 *
 * Custom SVG icon showing a racked set of 9 balls in diamond formation.
 * Enhanced with gradients, shadows, and highlights for a 3D effect.
 */

interface Rack9IconProps {
  className?: string;
  size?: number;
}

export const Rack9Icon = ({ className = "", size = 120 }: Rack9IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 140"
      width={size}
      height={size * 1.17}
      className={className}
    >
      <defs>
        {/* Ball gradients */}
        <radialGradient id="ballBase" cx="35%" cy="30%" r="60%">
          <stop offset="0%" stopColor="white"/>
          <stop offset="50%" stopColor="#F5F5F5"/>
          <stop offset="100%" stopColor="#CCCCCC"/>
        </radialGradient>

        {/* Yellow ball */}
        <radialGradient id="yellow-rack" cx="35%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#FFEF7A"/>
          <stop offset="50%" stopColor="#FFD700"/>
          <stop offset="100%" stopColor="#E0B800"/>
        </radialGradient>

        {/* Red ball */}
        <radialGradient id="red-rack" cx="35%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#FF6666"/>
          <stop offset="50%" stopColor="#FF0000"/>
          <stop offset="100%" stopColor="#CC0000"/>
        </radialGradient>

        {/* Black ball */}
        <radialGradient id="black-rack" cx="35%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#333333"/>
          <stop offset="50%" stopColor="#1A1A1A"/>
          <stop offset="100%" stopColor="#000000"/>
        </radialGradient>

        {/* Green ball */}
        <radialGradient id="green-rack" cx="35%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#66FF66"/>
          <stop offset="50%" stopColor="#00FF00"/>
          <stop offset="100%" stopColor="#00CC00"/>
        </radialGradient>

        {/* Purple ball */}
        <radialGradient id="purple-rack" cx="35%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#B366B3"/>
          <stop offset="50%" stopColor="#800080"/>
          <stop offset="100%" stopColor="#660066"/>
        </radialGradient>

        {/* Orange ball */}
        <radialGradient id="orange-rack" cx="35%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#FFB366"/>
          <stop offset="50%" stopColor="#FF7F00"/>
          <stop offset="100%" stopColor="#CC6600"/>
        </radialGradient>

        {/* Brown ball */}
        <radialGradient id="brown-rack" cx="35%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#B38B67"/>
          <stop offset="50%" stopColor="#8B4513"/>
          <stop offset="100%" stopColor="#6B3410"/>
        </radialGradient>

        {/* Blue ball */}
        <radialGradient id="blue-rack" cx="35%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#6699FF"/>
          <stop offset="50%" stopColor="#0000FF"/>
          <stop offset="100%" stopColor="#0000CC"/>
        </radialGradient>

        {/* Highlight for all balls */}
        <radialGradient id="highlight-rack" cx="40%" cy="30%" r="30%">
          <stop offset="0%" stopColor="white" stopOpacity="0.6"/>
          <stop offset="100%" stopColor="white" stopOpacity="0"/>
        </radialGradient>

        {/* Drop shadow */}
        <filter id="shadow-rack" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="black" floodOpacity="0.3"/>
        </filter>
      </defs>

      {/* Rack outline - polygon with side pairs pulled inward */}
      <polygon
        points="32,71.5 32,76.5 57.5,118 62.5,118 88,76.5 88,71.5 62.5,30 57.5,30"
        fill="none"
        stroke="black"
        strokeWidth="4"
      />

      {/* Row 1 - Yellow 1 ball */}
      <circle cx="60" cy="46" r="8" fill="url(#yellow-rack)" stroke="black" strokeWidth="1" filter="url(#shadow-rack)"/>
      <circle cx="60" cy="46" r="8" fill="url(#highlight-rack)" pointerEvents="none"/>

      {/* Row 2 - Red 3 and Black 8 */}
      <circle cx="52" cy="60" r="8" fill="url(#red-rack)" stroke="black" strokeWidth="1" filter="url(#shadow-rack)"/>
      <circle cx="52" cy="60" r="8" fill="url(#highlight-rack)" pointerEvents="none"/>

      <circle cx="68" cy="60" r="8" fill="url(#black-rack)" stroke="black" strokeWidth="1" filter="url(#shadow-rack)"/>
      <circle cx="68" cy="60" r="8" fill="url(#highlight-rack)" pointerEvents="none"/>

      {/* Row 3 - Green 6, Yellow 9, Purple 4 */}
      <circle cx="44" cy="74" r="8" fill="url(#green-rack)" stroke="black" strokeWidth="1" filter="url(#shadow-rack)"/>
      <circle cx="44" cy="74" r="8" fill="url(#highlight-rack)" pointerEvents="none"/>

      <circle cx="60" cy="74" r="8" fill="url(#yellow-rack)" stroke="black" strokeWidth="1" filter="url(#shadow-rack)"/>
      <circle cx="60" cy="74" r="8" fill="url(#highlight-rack)" pointerEvents="none"/>

      <circle cx="76" cy="74" r="8" fill="url(#purple-rack)" stroke="black" strokeWidth="1" filter="url(#shadow-rack)"/>
      <circle cx="76" cy="74" r="8" fill="url(#highlight-rack)" pointerEvents="none"/>

      {/* Row 4 - Orange 5 and Brown 7 */}
      <circle cx="52" cy="88" r="8" fill="url(#orange-rack)" stroke="black" strokeWidth="1" filter="url(#shadow-rack)"/>
      <circle cx="52" cy="88" r="8" fill="url(#highlight-rack)" pointerEvents="none"/>

      <circle cx="68" cy="88" r="8" fill="url(#brown-rack)" stroke="black" strokeWidth="1" filter="url(#shadow-rack)"/>
      <circle cx="68" cy="88" r="8" fill="url(#highlight-rack)" pointerEvents="none"/>

      {/* Row 5 - Blue 2 ball */}
      <circle cx="60" cy="102" r="8" fill="url(#blue-rack)" stroke="black" strokeWidth="1" filter="url(#shadow-rack)"/>
      <circle cx="60" cy="102" r="8" fill="url(#highlight-rack)" pointerEvents="none"/>
    </svg>
  );
};
