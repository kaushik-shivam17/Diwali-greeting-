import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { Gift, Sparkles, RotateCcw } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface SurpriseGiftBoxProps {
  isOpened: boolean;
  onOpenGift: () => void;
  onResetGift: () => void;
  senderName: string;
}

export const SurpriseGiftBox: React.FC<SurpriseGiftBoxProps> = ({
  isOpened,
  onOpenGift,
  onResetGift,
  senderName,
}) => {
  const lidRef = useRef<SVGGElement | null>(null);
  const burstRef = useRef<HTMLDivElement | null>(null);
  const blessingCardRef = useRef<HTMLDivElement | null>(null);
  const [animating, setAnimating] = useState(false);

  const handleGiftClick = () => {
    if (isOpened || animating) return;
    setAnimating(true);
    soundEngine.playGiftOpenFanfare();

    if (lidRef.current) {
      gsap.to(lidRef.current, {
        y: -58,
        rotation: -14,
        transformOrigin: 'center center',
        duration: 0.75,
        ease: 'back.out(1.6)',
      });
    }

    if (burstRef.current) {
      gsap.fromTo(
        burstRef.current,
        { scale: 0.4, opacity: 0 },
        { scale: 1.35, opacity: 1, duration: 0.65, ease: 'power3.out' }
      );
    }

    onOpenGift();
    window.setTimeout(() => {
      setAnimating(false);
      if (blessingCardRef.current) {
        gsap.fromTo(
          blessingCardRef.current,
          { y: 24, opacity: 0, scale: 0.95 },
          { y: 0, opacity: 1, scale: 1, duration: 0.65, ease: 'power3.out' }
        );
      }
    }, 180);
  };

  const handleReset = () => {
    if (lidRef.current) {
      gsap.to(lidRef.current, {
        y: 0,
        rotation: 0,
        duration: 0.45,
        ease: 'power2.out',
      });
    }
    onResetGift();
  };

  return (
    <div className="relative rounded-2xl p-6 sm:p-10 gold-border-glow bg-gradient-to-b from-[#130626]/95 via-[#0c041a]/95 to-[#080212]/95 overflow-hidden">
      {/* Golden Ambient Ray Burst */}
      <div
        ref={burstRef}
        className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-700 ${
          isOpened ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div
          className="w-[460px] h-[460px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(253, 224, 71, 0.34) 0%, rgba(245, 158, 11, 0.16) 42%, transparent 70%)',
          }}
        />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center text-center space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-medium tracking-wider text-amber-300/90">
            विशेष दीपावली उपहार · {senderName} की ओर से
          </p>
          <h3 className="text-2xl sm:text-4xl font-hindi-display text-gold-metallic">
            स्वर्णिम मंगल उपहार पेटी
          </h3>
          <p className="text-sm sm:text-base text-amber-100/80 max-w-xl mx-auto">
            {isOpened
              ? 'आपके लिए दिव्य लक्ष्मी आशीर्वाद एवं मंगलकामनाएँ प्रकट हुई हैं!'
              : 'नीचे दी गई स्वर्णिम उपहार पेटी पर क्लिक करें और अपना विशेष दीपावली आशीर्वाद खोलें।'}
          </p>
        </div>

        {/* Interactive 3D Isometric Golden Gift Box SVG + Light Burst */}
        <div className="relative flex flex-col items-center justify-center py-2">
          <button
            type="button"
            onClick={handleGiftClick}
            aria-label={isOpened ? 'उपहार खुल चुका है' : 'उपहार खोलें'}
            data-testid="surprise-gift-button"
            className="group relative focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-2xl p-4 cursor-pointer transition-transform duration-300 hover:scale-105"
          >
            <svg
              viewBox="0 0 280 260"
              className="w-56 h-52 sm:w-64 sm:h-60 overflow-visible drop-shadow-[0_18px_28px_rgba(245,158,11,0.35)]"
            >
              <defs>
                <linearGradient id="goldBoxLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="50%" stopColor="#d97706" />
                  <stop offset="100%" stopColor="#92400e" />
                </linearGradient>
                <linearGradient id="goldBoxRight" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fde68a" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#b45309" />
                </linearGradient>
                <linearGradient id="goldLidTop" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fffbeb" />
                  <stop offset="45%" stopColor="#fde047" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
                <linearGradient id="rubyRibbon" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fb7185" />
                  <stop offset="50%" stopColor="#e11d48" />
                  <stop offset="100%" stopColor="#9f1239" />
                </linearGradient>
                <radialGradient id="innerDivineLight" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="45%" stopColor="#fef08a" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Ground Shadow */}
              <ellipse cx="140" cy="232" rx="88" ry="20" fill="rgba(0,0,0,0.65)" />

              {/* 3D Box Base - Left Face */}
              <polygon
                points="55,118 140,158 140,228 55,188"
                fill="url(#goldBoxLeft)"
                stroke="#fde68a"
                strokeWidth="1.5"
              />
              {/* 3D Box Base - Right Face */}
              <polygon
                points="225,118 140,158 140,228 225,188"
                fill="url(#goldBoxRight)"
                stroke="#fde68a"
                strokeWidth="1.5"
              />
              {/* Box Interior Cavity */}
              <polygon
                points="55,118 140,82 225,118 140,158"
                fill="#451a03"
                stroke="#fbbf24"
                strokeWidth="1"
              />

              {/* Ruby Silk Vertical Ribbons on Base */}
              <polygon
                points="88,133 106,142 106,212 88,203"
                fill="url(#rubyRibbon)"
              />
              <polygon
                points="192,133 174,142 174,212 192,203"
                fill="url(#rubyRibbon)"
              />

              {/* Magical Light Burst Emerging from Inside When Opened */}
              {isOpened && (
                <g>
                  <circle cx="140" cy="112" r="68" fill="url(#innerDivineLight)" />
                  <polygon
                    points="85,120 45,25 118,105"
                    fill="rgba(254, 240, 138, 0.45)"
                  />
                  <polygon
                    points="195,120 235,25 162,105"
                    fill="rgba(254, 240, 138, 0.45)"
                  />
                  <polygon
                    points="115,115 140,10 165,115"
                    fill="rgba(255, 251, 235, 0.65)"
                  />
                  {/* Floating Golden Coins / Kamals */}
                  <circle cx="112" cy="64" r="6" fill="#fef08a" stroke="#f59e0b" strokeWidth="1.5" />
                  <circle cx="168" cy="58" r="5" fill="#fef08a" stroke="#f59e0b" strokeWidth="1.5" />
                  <circle cx="140" cy="44" r="8" fill="#fffbeb" stroke="#f59e0b" strokeWidth="2" />
                </g>
              )}

              {/* 3D Box Lid Group (Animates Upward on Open) */}
              <g
                ref={lidRef}
                style={{
                  transform: isOpened ? 'translateY(-56px) rotate(-12deg)' : undefined,
                  transformOrigin: '140px 100px',
                }}
              >
                {/* Lid Top Diamond */}
                <polygon
                  points="48,102 140,62 232,102 140,142"
                  fill="url(#goldLidTop)"
                  stroke="#fffbeb"
                  strokeWidth="1.5"
                />
                {/* Lid Left Rim */}
                <polygon
                  points="48,102 140,142 140,160 48,120"
                  fill="url(#goldBoxLeft)"
                  stroke="#fde68a"
                  strokeWidth="1.2"
                />
                {/* Lid Right Rim */}
                <polygon
                  points="232,102 140,142 140,160 232,120"
                  fill="url(#goldBoxRight)"
                  stroke="#fde68a"
                  strokeWidth="1.2"
                />
                {/* Lid Cross Ribbon */}
                <polygon
                  points="90,84 106,77 190,120 174,127"
                  fill="url(#rubyRibbon)"
                />
                <polygon
                  points="190,84 174,77 90,120 106,127"
                  fill="url(#rubyRibbon)"
                />
                {/* Royal Bow Knot */}
                <path
                  d="M 140 98 C 110 68, 92 95, 134 104 Z"
                  fill="url(#rubyRibbon)"
                  stroke="#fde68a"
                  strokeWidth="1.5"
                />
                <path
                  d="M 140 98 C 170 68, 188 95, 146 104 Z"
                  fill="url(#rubyRibbon)"
                  stroke="#fde68a"
                  strokeWidth="1.5"
                />
                <circle cx="140" cy="100" r="8" fill="#fde047" stroke="#b45309" strokeWidth="1.5" />
              </g>
            </svg>

            {!isOpened && (
              <span className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-[#090314] shadow-lg group-hover:brightness-110 transition-all whitespace-nowrap shrink-0">
                <Gift className="w-4 h-4" />
                <span>स्वर्णिम उपहार खोलें ✨</span>
              </span>
            )}
          </button>
        </div>

        {/* Revealed Goddess Lakshmi Blessing Card */}
        {isOpened && (
          <div
            ref={blessingCardRef}
            data-testid="gift-blessing-reveal"
            className="w-full max-w-2xl rounded-xl p-6 sm:p-8 bg-[#180832]/95 border border-amber-400/50 shadow-2xl space-y-4"
          >
            <div className="inline-flex items-center gap-2 text-xs font-medium tracking-wider text-amber-300">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>॥ श्री महालक्ष्मी आशीर्वाद ॥</span>
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>

            <p className="text-xl sm:text-3xl font-hindi-display text-gold-metallic leading-relaxed">
              माँ लक्ष्मी की कृपा आप पर सदैव बनी रहे।
              <br />
              आपका जीवन धन-धान्य और खुशियों से भरा रहे।
            </p>

            <div className="pt-2 flex items-center justify-center">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium border border-amber-400/35 bg-[#100422] text-amber-200 hover:border-amber-300 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>उपहार पेटी पुनः बंद करें</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
