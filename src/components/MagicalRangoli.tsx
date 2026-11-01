import React, { useState } from 'react';
import { Flame, Sparkles, RotateCcw } from 'lucide-react';
import { computeRangoliSymmetryPoints } from '../utils/greetingLogic';
import { soundEngine } from '../utils/soundEngine';

const OUTER_DIYAS = computeRangoliSymmetryPoints(8, 168, 200, 200, -Math.PI / 2);
const LOTUS_PETALS_12 = computeRangoliSymmetryPoints(12, 118, 200, 200, 0);
const INNER_PETALS_8 = computeRangoliSymmetryPoints(8, 72, 200, 200, Math.PI / 8);

const RANGOLI_THEMES = [
  {
    id: 'royal-marigold',
    label: 'स्वर्ण गेंदा एवं माणिक्य',
    outerColor: '#f59e0b',
    midColor: '#e11d48',
    innerColor: '#fde047',
    accentColor: '#fb7185',
  },
  {
    id: 'peacock-laxmi',
    label: 'मयूर नीलम एवं कुंदन',
    outerColor: '#eab308',
    midColor: '#9333ea',
    innerColor: '#38bdf8',
    accentColor: '#fde68a',
  },
  {
    id: 'saffron-kumkum',
    label: 'केसर कुमकुम एवं चंदन',
    outerColor: '#ea580c',
    midColor: '#dc2626',
    innerColor: '#fef08a',
    accentColor: '#fdba74',
  },
];

export const MagicalRangoli: React.FC = () => {
  const [litDiyas, setLitDiyas] = useState<boolean[]>(() => Array(8).fill(true));
  const [themeIdx, setThemeIdx] = useState(0);
  const [revealKey, setRevealKey] = useState(0);

  const activeTheme = RANGOLI_THEMES[themeIdx];
  const litCount = litDiyas.filter(Boolean).length;

  const toggleDiya = (index: number) => {
    setLitDiyas((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
    soundEngine.playTempleBell(880 + index * 55, 1.1, 0.12);
  };

  const lightAllDiyas = () => {
    setLitDiyas(Array(8).fill(true));
    setRevealKey((k) => k + 1);
    soundEngine.playGiftOpenFanfare();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-2xl p-6 sm:p-8 gold-border-glow bg-[#0d051d]/90">
      {/* Left Interactive SVG Rangoli Mandala */}
      <div className="lg:col-span-7 flex flex-col items-center justify-center">
        <div
          key={revealKey}
          className="relative w-full max-w-[420px] aspect-square flex items-center justify-center"
        >
          {/* Ambient radial golden aura */}
          <div
            className="absolute inset-6 rounded-full pointer-events-none transition-opacity duration-700"
            style={{
              background: `radial-gradient(circle, ${activeTheme.outerColor}33 0%, ${activeTheme.midColor}1f 48%, transparent 72%)`,
              opacity: 0.35 + (litCount / 8) * 0.65,
            }}
          />

          <svg
            viewBox="0 0 400 400"
            className="w-full h-full overflow-visible select-none"
            role="img"
            aria-label="पारंपरिक भारतीय अष्टदल कमल रंगोली और जलते हुए दीप"
          >
            <defs>
              <radialGradient id="rangoliCenterGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fffbeb" />
                <stop offset="45%" stopColor={activeTheme.innerColor} />
                <stop offset="100%" stopColor={activeTheme.midColor} />
              </radialGradient>
              <linearGradient id="goldStrokeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef3c7" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#fde68a" />
              </linearGradient>
            </defs>

            {/* Outer Scalloped Marigold Garland Ring */}
            <circle
              cx="200"
              cy="200"
              r="158"
              fill="none"
              stroke="url(#goldStrokeGrad)"
              strokeWidth="1.5"
              strokeDasharray="6 6"
              opacity="0.75"
            />
            <circle
              cx="200"
              cy="200"
              r="142"
              fill="#120626"
              stroke={activeTheme.outerColor}
              strokeWidth="2.5"
            />

            {/* 12 Outer Lotus Petals */}
            {LOTUS_PETALS_12.map((pt, i) => (
              <g
                key={`lotus12-${i}`}
                transform={`translate(200, 200) rotate(${pt.angleDeg})`}
              >
                <path
                  d="M 0 -42 C 24 -78, 30 -116, 0 -138 C -30 -116, -24 -78, 0 -42 Z"
                  fill={i % 2 === 0 ? activeTheme.midColor : activeTheme.outerColor}
                  fillOpacity="0.88"
                  stroke="#fde68a"
                  strokeWidth="1.5"
                />
                <circle cx="0" cy="-115" r="3.5" fill="#fffbeb" />
              </g>
            ))}

            {/* Middle Kundan Gold Ring */}
            <circle
              cx="200"
              cy="200"
              r="94"
              fill="#180830"
              stroke="#fde68a"
              strokeWidth="2"
            />

            {/* 8 Inner Sacred Ashta-Dal Lotus Petals */}
            {INNER_PETALS_8.map((pt, i) => (
              <g
                key={`inner8-${i}`}
                transform={`translate(200, 200) rotate(${pt.angleDeg})`}
              >
                <path
                  d="M 0 -18 C 18 -42, 22 -72, 0 -90 C -22 -72, -18 -42, 0 -18 Z"
                  fill={activeTheme.innerColor}
                  fillOpacity="0.92"
                  stroke={activeTheme.midColor}
                  strokeWidth="1.5"
                />
                <circle cx="0" cy="-68" r="2.8" fill={activeTheme.midColor} />
              </g>
            ))}

            {/* Sacred Center Mandala & Swastika/Lotus Core */}
            <circle
              cx="200"
              cy="200"
              r="36"
              fill="url(#rangoliCenterGlow)"
              stroke="#fffbeb"
              strokeWidth="2"
            />
            <circle
              cx="200"
              cy="200"
              r="14"
              fill="#b45309"
              stroke="#fef08a"
              strokeWidth="1.5"
            />
            <circle cx="200" cy="200" r="5" fill="#fffbeb" />

            {/* 8 Interactive Perimeter Diyas */}
            {OUTER_DIYAS.map((pt, idx) => {
              const isLit = litDiyas[idx];
              return (
                <g
                  key={`diya-${idx}`}
                  transform={`translate(${pt.x}, ${pt.y})`}
                  onClick={() => toggleDiya(idx)}
                  className="cursor-pointer"
                  role="button"
                  tabIndex={0}
                  aria-label={`रंगोली दीप ${idx + 1} ${isLit ? 'प्रज्वलित है' : 'प्रज्वलित करें'}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleDiya(idx);
                    }
                  }}
                >
                  {/* Warm Aura when lit */}
                  {isLit && (
                    <circle
                      cx="0"
                      cy="-4"
                      r="24"
                      fill="#f59e0b"
                      opacity="0.32"
                    />
                  )}
                  {/* Terracotta & Gold Diya Bowl */}
                  <path
                    d="M -14 2 Q 0 16 14 2 L 10 -4 L -10 -4 Z"
                    fill="#b45309"
                    stroke="#fde68a"
                    strokeWidth="1.4"
                  />
                  {/* Diya Flame */}
                  {isLit ? (
                    <g>
                      <path
                        d="M 0 -20 C 6 -11, 5 -4, 0 -2 C -5 -4, -6 -11, 0 -20 Z"
                        fill="#fbbf24"
                      />
                      <path
                        d="M 0 -15 C 3 -9, 3 -4, 0 -3 C -3 -4, -3 -9, 0 -15 Z"
                        fill="#fffbeb"
                      />
                    </g>
                  ) : (
                    <circle cx="0" cy="-5" r="2" fill="#78350f" />
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Right Controls & Cultural Story */}
      <div className="lg:col-span-5 space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-medium tracking-wider text-amber-300/90">
            अष्टदल कमल एवं दीप सज्जा · {litCount}/8 दीप प्रज्वलित
          </p>
          <h3 className="text-2xl sm:text-3xl font-hindi-display text-gold-metallic">
            मांगलिक उत्सव रंगोली
          </h3>
          <p className="text-sm sm:text-base text-amber-100/85 leading-relaxed">
            माँ लक्ष्मी के स्वागत हेतु फूलों की पंखुड़ियों, कुमकुम और स्वर्णिम आभा से सजी पारंपरिक रंगोली।
            रंगोली के चारों ओर रखे किसी भी दीपक को स्पर्श करके प्रज्वलित करें या रंग पैलेट बदलें।
          </p>
        </div>

        {/* Palette Selector */}
        <div className="space-y-2.5">
          <p className="text-xs font-medium text-amber-200/80">
            रंगोली पुष्प एवं रत्न संयोजन चुनें:
          </p>
          <div className="flex flex-wrap gap-2">
            {RANGOLI_THEMES.map((theme, idx) => (
              <button
                key={theme.id}
                type="button"
                onClick={() => {
                  setThemeIdx(idx);
                  soundEngine.playTempleBell(987.77, 1.0, 0.1);
                }}
                className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
                  themeIdx === idx
                    ? 'bg-amber-500/25 border-amber-300 text-amber-100 shadow-sm'
                    : 'bg-[#140829] border-amber-500/20 text-amber-200/75 hover:border-amber-400/50'
                }`}
              >
                {theme.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={lightAllDiyas}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-[#090314] hover:brightness-110 transition-all cursor-pointer whitespace-nowrap shrink-0 shadow-md"
          >
            <Flame className="w-4 h-4" />
            <span>सभी ८ दीप प्रज्वलित करें</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setRevealKey((k) => k + 1);
              soundEngine.playTempleBell(1046.5, 1.3, 0.12);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-amber-400/35 bg-[#16082e] text-amber-200 hover:border-amber-300 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
            <span>पुनः सजाएँ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
