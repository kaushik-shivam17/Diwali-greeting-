import React from 'react';

interface RoyalPeacockCrestProps {
  senderName?: string;
  subtitleHindi?: string;
  compact?: boolean;
  children?: React.ReactNode;
}

/**
 * High-precision vector art component inspired by the Royal Peacock (Mayur),
 * Pink Lotus & Emerald Arabesque Vines, Scalloped Mughal Cusped Arch Cartouche,
 * and Jeweled Kundan Meenakari Diya reference design.
 */
export const RoyalPeacockCrest: React.FC<RoyalPeacockCrestProps> = ({
  senderName,
  subtitleHindi,
  compact = false,
  children,
}) => {
  const featherSpots = [
    { cx: -148, cy: 42, r: 16, rot: -24 },
    { cx: -182, cy: 65, r: 17, rot: -32 },
    { cx: -135, cy: 84, r: 18, rot: -16 },
    { cx: -168, cy: 112, r: 19, rot: -26 },
    { cx: -124, cy: 132, r: 17, rot: -12 },
    { cx: -158, cy: 158, r: 20, rot: -20 },
    { cx: -116, cy: 178, r: 19, rot: -8 },
    { cx: -146, cy: 206, r: 21, rot: -14 },
  ];

  const lotusVineNodes = [
    { x: -120, y: -185, rot: -35, scale: 0.95 },
    { x: -168, y: -142, rot: -52, scale: 0.9 },
    { x: -198, y: -88, rot: -68, scale: 0.85 },
    { x: -206, y: -24, rot: -82, scale: 0.85 },
  ];

  const renderPeacockSide = (flip: boolean) => (
    <g transform={flip ? 'scale(-1, 1)' : undefined}>
      {/* Upper Floral Arabesque Emerald Vines & Pink Crystal Lotuses */}
      <path
        d="M -88 -210 C -145 -205, -195 -155, -210 -85 C -222 -30, -212 25, -190 62"
        fill="none"
        stroke="url(#emeraldVineGrad)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M -95 -175 C -135 -165, -165 -120, -172 -65"
        fill="none"
        stroke="#d4af37"
        strokeWidth="1.8"
        strokeDasharray="4 3"
      />

      {lotusVineNodes.map((node, i) => (
        <g
          key={`lotus-${i}`}
          transform={`translate(${node.x}, ${node.y}) rotate(${node.rot}) scale(${node.scale})`}
        >
          {/* Decorative Emerald Leaves */}
          <path
            d="M 0 0 C -18 -8, -26 -24, -12 -34 C 0 -24, 6 -10, 0 0 Z"
            fill="url(#emeraldVineGrad)"
            stroke="#fde68a"
            strokeWidth="0.9"
          />
          <path
            d="M 0 0 C 18 -8, 26 -24, 12 -34 C 0 -24, -6 -10, 0 0 Z"
            fill="url(#tealPlumageGrad)"
            stroke="#fde68a"
            strokeWidth="0.9"
          />
          {/* Faceted Rose-Pink Kundan Lotus Petals */}
          <path
            d="M 0 -4 C 10 -18, 12 -34, 0 -46 C -12 -34, -10 -18, 0 -4 Z"
            fill="url(#pinkLotusGrad)"
            stroke="#fff1f2"
            strokeWidth="1"
          />
          <path
            d="M -3 -6 C -16 -14, -24 -28, -16 -40 C -6 -32, -2 -18, -3 -6 Z"
            fill="url(#pinkLotusGrad)"
            stroke="#fecdd3"
            strokeWidth="0.9"
          />
          <path
            d="M 3 -6 C 16 -14, 24 -28, 16 -40 C 6 -32, 2 -18, 3 -6 Z"
            fill="url(#pinkLotusGrad)"
            stroke="#fecdd3"
            strokeWidth="0.9"
          />
          <circle cx="0" cy="-6" r="3.2" fill="#fde047" />
        </g>
      ))}

      {/* Golden Sweeping S-Curve Frame Border */}
      <path
        d="M -98 -68 C -102 -18, -135 8, -168 32 C -210 64, -208 142, -162 178 C -132 202, -98 205, -75 202"
        fill="none"
        stroke="url(#luxuryGoldGrad)"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* Cascading Peacock Tail Feather Fronds */}
      {featherSpots.map((spot, idx) => (
        <g key={`feather-${idx}`}>
          {/* Curved Iridescent Barb Plume */}
          <path
            d={`M -128 18 Q ${spot.cx - 18} ${spot.cy - 18} ${spot.cx - 8} ${spot.cy + 28}`}
            fill="none"
            stroke="#0d9488"
            strokeWidth="2.2"
            opacity="0.85"
          />
          <g
            transform={`translate(${spot.cx}, ${spot.cy}) rotate(${spot.rot})`}
          >
            {/* Outer Teal-Emerald Plume Halo */}
            <ellipse
              cx="0"
              cy="0"
              rx={spot.r * 0.92}
              ry={spot.r * 1.28}
              fill="url(#tealPlumageGrad)"
              stroke="#fde68a"
              strokeWidth="1.2"
            />
            {/* Golden-Bronze Eye Ring */}
            <ellipse
              cx="0"
              cy="2"
              rx={spot.r * 0.66}
              ry={spot.r * 0.92}
              fill="url(#amberEyeGrad)"
            />
            {/* Coral-Ruby Crescent */}
            <ellipse
              cx="0"
              cy="4"
              rx={spot.r * 0.46}
              ry={spot.r * 0.64}
              fill="#e11d48"
            />
            {/* Deep Royal Sapphire Pupil */}
            <ellipse
              cx="0"
              cy="6"
              rx={spot.r * 0.28}
              ry={spot.r * 0.4}
              fill="#1e1b4b"
              stroke="#38bdf8"
              strokeWidth="0.9"
            />
            {/* Specular Highlight */}
            <circle
              cx={-spot.r * 0.1}
              cy={3}
              r={spot.r * 0.08}
              fill="#fffbeb"
            />
          </g>
        </g>
      ))}

      {/* Sculpted Peacock Body, Graceful S-Neck & Royal Crest */}
      <g>
        {/* Royal Crown Plumes (Kalagi) */}
        <path
          d="M -134 -88 L -142 -106 M -130 -89 L -132 -109 M -126 -88 L -122 -106"
          stroke="#fde047"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <circle cx="-142" cy="-107" r="3" fill="#0d9488" stroke="#fde047" strokeWidth="1" />
        <circle cx="-132" cy="-110" r="3.4" fill="#0284c7" stroke="#fde047" strokeWidth="1" />
        <circle cx="-122" cy="-107" r="3" fill="#0d9488" stroke="#fde047" strokeWidth="1" />

        {/* Graceful Peacock Head & Beak Facing Center Diya */}
        <path
          d="M -138 -78 C -138 -90, -120 -92, -114 -80 C -106 -79, -98 -76, -95 -73 C -102 -71, -109 -71, -115 -72 C -118 -58, -134 -42, -130 -18 C -125 6, -104 20, -112 44 C -122 66, -154 62, -162 36 C -168 12, -152 -16, -146 -42 C -142 -58, -138 -68, -138 -78 Z"
          fill="url(#peacockNeckGrad)"
          stroke="#fde68a"
          strokeWidth="1.6"
        />

        {/* Delicate Eye & Facial Marking */}
        <circle cx="-122" cy="-79" r="2.3" fill="#fffbeb" />
        <circle cx="-121.5" cy="-79" r="1.1" fill="#090314" />

        {/* Iridescent Scale Feathering on Breast */}
        <path
          d="M -144 -32 Q -135 -24 -126 -32 M -148 -16 Q -136 -6 -124 -16 M -152 2 Q -136 14 -120 2 M -150 20 Q -134 32 -118 20"
          fill="none"
          stroke="#fde68a"
          strokeWidth="1.3"
          opacity="0.85"
        />
      </g>
    </g>
  );

  return (
    <div className="relative w-full flex flex-col items-center justify-center select-none">
      <div
        className={`relative w-full ${
          compact ? 'max-w-[330px] sm:max-w-[520px]' : 'max-w-[360px] sm:max-w-[700px]'
        } mx-auto flex flex-col items-center`}
      >
        {/* Master SVG Backing with Twin Peacocks, Lotus Vines & Mughal Cusped Arch */}
        <svg
          viewBox="-250 -245 500 500"
          className={`w-full h-auto ${
            compact ? 'max-h-[250px] sm:max-h-[380px]' : 'max-h-[320px] sm:max-h-[480px]'
          } overflow-visible drop-shadow-[0_20px_50px_rgba(4,120,87,0.35)]`}
          role="img"
          aria-label="राजसी मयूर, कमल बेल और रत्नजड़ित कुंदन दीप के साथ शुभ दीपावली तोरण"
        >
          <defs>
            <linearGradient id="cartoucheTealGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#065f73" />
              <stop offset="45%" stopColor="#044252" />
              <stop offset="100%" stopColor="#032836" />
            </linearGradient>

            <linearGradient id="luxuryGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fffbeb" />
              <stop offset="28%" stopColor="#fde047" />
              <stop offset="55%" stopColor="#d97706" />
              <stop offset="80%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#fef08a" />
            </linearGradient>

            <linearGradient id="peacockNeckGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="45%" stopColor="#0f766e" />
              <stop offset="100%" stopColor="#064e3b" />
            </linearGradient>

            <linearGradient id="tealPlumageGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2dd4bf" />
              <stop offset="50%" stopColor="#0d9488" />
              <stop offset="100%" stopColor="#115e59" />
            </linearGradient>

            <linearGradient id="emeraldVineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#84cc16" />
              <stop offset="55%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>

            <linearGradient id="pinkLotusGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffe4e6" />
              <stop offset="50%" stopColor="#fb7185" />
              <stop offset="100%" stopColor="#be123c" />
            </linearGradient>

            <radialGradient id="amberEyeGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="65%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </radialGradient>

            <radialGradient id="diyaFlameHalo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="30%" stopColor="#fef08a" />
              <stop offset="65%" stopColor="#84cc16" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Left & Right Symmetrical Royal Peacocks + Floral Vine Scrolls */}
          {renderPeacockSide(false)}
          {renderPeacockSide(true)}

          {/* Central Mughal / Rajput Scalloped Cusped Arch Cartouche */}
          <g>
            {/* Outer Brushed Gold Arch Border */}
            <path
              d="M 0 -228
                 C 22 -204, 52 -204, 56 -182
                 C 62 -166, 86 -166, 94 -152
                 L 94 148
                 C 86 164, 62 164, 56 180
                 C 52 202, 22 202, 0 226
                 C -22 202, -52 202, -56 180
                 C -62 164, -86 164, -94 148
                 L -94 -152
                 C -86 -166, -62 -166, -56 -182
                 C -52 -204, -22 -204, 0 -228 Z"
              fill="url(#cartoucheTealGrad)"
              stroke="url(#luxuryGoldGrad)"
              strokeWidth="5.5"
            />

            {/* Inner Gold Hairline Arch Inlay */}
            <path
              d="M 0 -216
                 C 19 -195, 46 -195, 50 -175
                 C 55 -160, 78 -160, 85 -146
                 L 85 142
                 C 78 156, 55 156, 50 172
                 C 46 192, 19 192, 0 214
                 C -19 192, -46 192, -50 172
                 C -55 156, -78 156, -85 142
                 L -85 -146
                 C -78 -160, -55 -160, -50 -175
                 C -46 -195, -19 -195, 0 -216 Z"
              fill="none"
              stroke="#fde68a"
              strokeWidth="1.2"
              opacity="0.65"
            />

            {/* Soft Festive Bokeh Circles Inside the Teal Arch */}
            <g opacity="0.24">
              <circle cx="-48" cy="-95" r="18" fill="#38bdf8" />
              <circle cx="52" cy="-78" r="22" fill="#2dd4bf" />
              <circle cx="-32" cy="-35" r="26" fill="#38bdf8" />
              <circle cx="42" cy="-22" r="16" fill="#fef08a" />
              <circle cx="0" cy="-115" r="28" fill="#2dd4bf" />
              <circle cx="-55" cy="25" r="15" fill="#38bdf8" />
              <circle cx="58" cy="35" r="19" fill="#2dd4bf" />
            </g>

            {/* JEWELED KUNDAN & MEENAKARI FILIGREE DIYA (Centerpiece) */}
            <g transform="translate(0, -58)">
              {/* Multi-layered Luminous Flame Aura */}
              <circle cx="0" cy="-58" r="46" fill="url(#diyaFlameHalo)" />

              {/* Outer Lime-Gold Flame */}
              <path
                d="M 0 -96 C 22 -66, 20 -36, 0 -26 C -20 -36, -22 -66, 0 -96 Z"
                fill="#a3e635"
                opacity="0.75"
              />
              {/* Middle Saffron-Gold Flame */}
              <path
                d="M 0 -86 C 15 -60, 14 -36, 0 -27 C -14 -36, -15 -60, 0 -86 Z"
                fill="#facc15"
              />
              {/* Inner Pure White-Gold Core */}
              <path
                d="M 0 -68 C 8 -50, 7 -34, 0 -28 C -7 -34, -8 -50, 0 -68 Z"
                fill="#ffffff"
              />

              {/* Diya Upper Back Rim */}
              <path
                d="M -64 -8 C -36 -24, 36 -24, 64 -8"
                fill="none"
                stroke="url(#luxuryGoldGrad)"
                strokeWidth="3.5"
              />
              {/* Scalloped Central Wick Spout Crown */}
              <path
                d="M -64 -8 C -28 -6, -12 -18, 0 -28 C 12 -18, 28 -6, 64 -8"
                fill="#03313d"
                stroke="url(#luxuryGoldGrad)"
                strokeWidth="3.5"
              />

              {/* Ornate Jeweled Diya Bowl Body */}
              <path
                d="M -64 -8 C -58 34, -28 52, 0 54 C 28 52, 58 34, 64 -8 C 28 -5, -28 -5, -64 -8 Z"
                fill="#064e5f"
                stroke="url(#luxuryGoldGrad)"
                strokeWidth="3.5"
              />

              {/* White Pearl / Kundan Bead Garland Along Upper Rim */}
              {[-52, -42, -32, -22, -12, 0, 12, 22, 32, 42, 52].map((bx, idx) => (
                <circle
                  key={`bead-${idx}`}
                  cx={bx}
                  cy={-6 + Math.abs(bx) * 0.04}
                  r="2.2"
                  fill="#fffbeb"
                />
              ))}

              {/* Meenakari Gold Filigree Arabesque Inside Bowl */}
              <path
                d="M 0 -4 L 0 46 M 0 18 C -18 4, -36 12, -42 26 M 0 18 C 18 4, 36 12, 42 26 M 0 34 C -14 22, -26 28, -28 40 M 0 34 C 14 22, 26 28, 28 40"
                fill="none"
                stroke="url(#luxuryGoldGrad)"
                strokeWidth="2.4"
                strokeLinecap="round"
              />

              {/* Rose-Pink & Emerald Gemstone Inlays on Diya Bowl */}
              <polygon
                points="0,8 6,18 0,28 -6,18"
                fill="#fb7185"
                stroke="#fde68a"
                strokeWidth="1"
              />
              <circle cx="-22" cy="18" r="3.8" fill="#10b981" stroke="#fde68a" strokeWidth="1" />
              <circle cx="22" cy="18" r="3.8" fill="#10b981" stroke="#fde68a" strokeWidth="1" />
              <circle cx="-38" cy="12" r="3.2" fill="#fb7185" stroke="#fde68a" strokeWidth="1" />
              <circle cx="38" cy="12" r="3.2" fill="#fb7185" stroke="#fde68a" strokeWidth="1" />
              <circle cx="-14" cy="36" r="3" fill="#fde047" />
              <circle cx="14" cy="36" r="3" fill="#fde047" />
            </g>

            {/* Luxury Metallic Gold Typography Inside Cartouche */}
            <text
              x="0"
              y="26"
              textAnchor="middle"
              fill="url(#luxuryGoldGrad)"
              className="font-royal"
              fontSize="20"
              fontWeight="700"
              letterSpacing="3"
            >
              HAPPY
            </text>
            <text
              x="0"
              y="62"
              textAnchor="middle"
              fill="url(#luxuryGoldGrad)"
              className="font-royal"
              fontSize="34"
              fontWeight="800"
              letterSpacing="2.5"
            >
              DIWALI
            </text>
            <text
              x="0"
              y="82"
              textAnchor="middle"
              fill="#fde68a"
              className="font-royal"
              fontSize="8.5"
              fontWeight="600"
              letterSpacing="2.2"
            >
              FESTIVAL OF LIGHT
            </text>

            {/* Hindi Sub-Arch Greeting */}
            <text
              x="0"
              y="114"
              textAnchor="middle"
              fill="#fffbeb"
              className="font-hindi-display"
              fontSize="21"
            >
              ॥ शुभ दीपावली ॥
            </text>

            {senderName && (
              <text
                x="0"
                y="142"
                textAnchor="middle"
                fill="#fde047"
                className="font-hindi-display"
                fontSize="14.5"
              >
                सप्रेम: {senderName}
              </text>
            )}
          </g>
        </svg>

        {/* Optional Interactive Overlay / Slot Below or Inside */}
        {(subtitleHindi || children) && (
          <div className="-mt-6 sm:-mt-10 relative z-10 w-full max-w-xl rounded-2xl p-5 sm:p-7 bg-[#061c24]/95 border border-amber-400/45 shadow-[0_20px_50px_rgba(0,0,0,0.85)] text-center space-y-4">
            {subtitleHindi && (
              <p className="text-sm sm:text-base text-amber-100/95 font-medium leading-relaxed">
                {subtitleHindi}
              </p>
            )}
            {children}
          </div>
        )}
      </div>
    </div>
  );
};
