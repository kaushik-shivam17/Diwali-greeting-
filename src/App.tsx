/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Share2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  UserPen,
  Send,
} from 'lucide-react';
import {
  validateSenderName,
  parseSenderFromQuery,
  buildShareableUrl,
  buildWhatsAppShareUrl,
  DEFAULT_SENDER_NAME,
} from './utils/greetingLogic';
import { soundEngine } from './utils/soundEngine';
import { PalaceScene3D, CameraPreset } from './components/PalaceScene3D';
import { FireworksCanvas } from './components/FireworksCanvas';
import { MagicalRangoli } from './components/MagicalRangoli';
import { SurpriseGiftBox } from './components/SurpriseGiftBox';
import { RoyalPeacockCrest } from './components/RoyalPeacockCrest';

async function copyTextWithFallback(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to textarea fallback for sandboxed iframes
    }
  }
  if (typeof document === 'undefined') return false;
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', 'true');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const copied = document.execCommand('copy');
    document.body.removeChild(textarea);
    return copied;
  } catch {
    return false;
  }
}

export default function App() {
  const initialQuery = parseSenderFromQuery(
    typeof window !== 'undefined' ? window.location.search : ''
  );

  const [senderName, setSenderName] = useState<string>(
    initialQuery.senderName || DEFAULT_SENDER_NAME
  );
  const [showIntroModal, setShowIntroModal] = useState<boolean>(
    !initialQuery.senderName && !initialQuery.autostart
  );

  // Intro Modal Personalization Form State
  const [nameInput, setNameInput] = useState<string>(
    initialQuery.senderName || ''
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  // Footer "Create Your Own Greeting" Form State (Independent to prevent hidden state bugs)
  const [footerNameInput, setFooterNameInput] = useState<string>('');
  const [footerError, setFooterError] = useState<string | null>(null);
  const [footerSuccess, setFooterSuccess] = useState<string | null>(null);

  // 3D Scene & Interactive States
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>(
    initialQuery.senderName || initialQuery.autostart ? 'palace' : 'intro'
  );
  const [giftOpened, setGiftOpened] = useState<boolean>(false);
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(false);
  const [fireworkSignal, setFireworkSignal] = useState<number>(0);

  // Audio state
  const [isPlayingMusic, setIsPlayingMusic] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Share state
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  // Refs for GSAP animations
  const introCardRef = useRef<HTMLDivElement | null>(null);
  const heroGreetingRef = useRef<HTMLDivElement | null>(null);
  const wishesSectionRef = useRef<HTMLElement | null>(null);

  const currentShareUrl = buildShareableUrl(
    typeof window !== 'undefined' ? window.location.href : 'https://diwali.example.com/',
    senderName
  );
  const whatsappShareUrl = buildWhatsAppShareUrl(senderName, currentShareUrl);

  // Sync URL query parameter safely when senderName is personalized
  const updateUrlQueryParam = (cleanName: string) => {
    if (typeof window === 'undefined') return;
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('from', cleanName);
      window.history.replaceState({}, '', url.toString());
    } catch {
      // Ignore history replace errors in restricted environments
    }
  };

  // GSAP Entrance Animation on Mount
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    if (showIntroModal && introCardRef.current) {
      gsap.fromTo(
        introCardRef.current,
        { y: 24, opacity: 0, scale: 0.97 },
        { y: 0, opacity: 1, scale: 1, duration: 0.75, ease: 'power3.out' }
      );
    }
  }, [showIntroModal]);

  const applyNewSenderName = (cleanName: string) => {
    setSenderName(cleanName);
    setNameInput(cleanName);
    setShowIntroModal(false);
    setCameraPreset('palace');
    updateUrlQueryParam(cleanName);

    const started = soundEngine.startMusic();
    setIsPlayingMusic(started);
    soundEngine.playGiftOpenFanfare();
    setFireworkSignal((s) => s + 1);

    if (heroGreetingRef.current) {
      gsap.fromTo(
        heroGreetingRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.75, ease: 'power3.out' }
      );
    }
  };

  const handlePersonalizeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateSenderName(nameInput);
    if (!result.isValid) {
      setValidationError(
        result.errorHindi || 'कृपया शुभकामनाएँ भेजने के लिए अपना नाम लिखें।'
      );
      return;
    }

    setValidationError(null);
    applyNewSenderName(result.sanitizedName);
  };

  const handleFooterPersonalizeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateSenderName(footerNameInput);
    if (!result.isValid) {
      setFooterSuccess(null);
      setFooterError(
        result.errorHindi || 'कृपया शुभकामनाएँ भेजने के लिए अपना नाम लिखें।'
      );
      return;
    }

    setFooterError(null);
    setFooterNameInput('');
    applyNewSenderName(result.sanitizedName);
    setFooterSuccess(
      `अब यह शुभकामना संदेश "${result.sanitizedName}" के नाम से तैयार है! ऊपर दिए गए बटन से साझा करें।`
    );
  };

  const handleToggleMusic = () => {
    const playing = soundEngine.togglePlay();
    setIsPlayingMusic(playing);
  };

  const handleToggleMute = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  const handleCopyShareLink = async () => {
    const ok = await copyTextWithFallback(currentShareUrl);
    setCopiedLink(true);
    setShareFeedback(
      ok
        ? 'आपका व्यक्तिगत शुभकामना लिंक कॉपी हो गया है!'
        : 'नीचे दिए गए लिंक को कॉपी करके साझा करें।'
    );
    soundEngine.playTempleBell(1174.66, 1.2, 0.12);
    window.setTimeout(() => {
      setCopiedLink(false);
    }, 3500);
  };

  const handleNativeShare = async () => {
    soundEngine.playTempleBell(1046.5, 1.2, 0.12);
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `॥ शुभ दीपावली ॥ — ${senderName} की ओर से शुभकामनाएँ`,
          text: `${senderName} ने आपके और आपके परिवार के लिए विशेष 3D दीपावली शुभकामना संदेश भेजा है! ✨`,
          url: currentShareUrl,
        });
        setShareFeedback('शुभकामना संदेश सफलतापूर्वक साझा किया गया!');
        return;
      } catch {
        // Fallback to copy link if user cancels or share fails
      }
    }
    await handleCopyShareLink();
  };

  const openNameEditorModal = () => {
    setNameInput(senderName === DEFAULT_SENDER_NAME ? '' : senderName);
    setValidationError(null);
    setShowIntroModal(true);
    setCameraPreset('intro');
  };

  const enterPalaceDirectly = () => {
    setShowIntroModal(false);
    setCameraPreset('palace');
    const started = soundEngine.startMusic();
    setIsPlayingMusic(started);
  };

  return (
    <div
      data-state={showIntroModal ? 'intro' : 'celebration'}
      className="min-h-screen bg-[#07030d] text-[#fff8eb] flex flex-col relative selection:bg-amber-500/30"
    >
      {/* TOP BAR CONTRACT: Strictly 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-40 flex items-center justify-between gap-4 sm:gap-8 px-4 sm:px-8 py-3 bg-[#090314]/95 border-b border-amber-500/20">
        {/* Zone 1: Single text element Brand Wordmark */}
        <a
          href="#palace-stage"
          onClick={() => {
            if (showIntroModal) enterPalaceDirectly();
          }}
          className="text-base sm:text-xl font-hindi-display text-gold-metallic whitespace-nowrap shrink-0"
        >
          ॥ शुभ दीपावली ॥
        </a>

        {/* Zone 2: 5 concise single-line navigation links */}
        <nav
          aria-label="मुख्य अनुभाग"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-amber-100/80"
        >
          <a
            href="#palace-stage"
            onClick={() => {
              if (showIntroModal) enterPalaceDirectly();
            }}
            className="hover:text-amber-300 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            महल दर्शन
          </a>
          <a
            href="#hindi-wishes"
            className="hover:text-amber-300 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            मंगल कामनाएँ
          </a>
          <a
            href="#fireworks-section"
            className="hover:text-amber-300 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            आतिशबाजी
          </a>
          <a
            href="#rangoli-section"
            className="hover:text-amber-300 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            मांगलिक रंगोली
          </a>
          <a
            href="#gift-section"
            className="hover:text-amber-300 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            लक्ष्मी उपहार
          </a>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#final-greeting-share"
            className="px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-[#090314] hover:brightness-110 transition-all whitespace-nowrap shrink-0 shadow-md"
          >
            शुभकामनाएँ साझा करें
          </a>
        </div>
      </header>

      <main className="flex-1">
        {/* SECTION 1, 2 & 3: GRAND 3D INDIAN PALACE STAGE & INTRO PERSONALIZATION OVERLAY */}
        <section
          id="palace-stage"
          className="relative w-full h-[88vh] min-h-[600px] max-h-[920px] overflow-hidden border-b border-amber-500/20"
        >
          {/* Full-Viewport Three.js 3D Indian Palace, Glowing Diyas, Lanterns & Rangoli */}
          <div className="absolute inset-0 z-0">
            <PalaceScene3D
              cameraPreset={cameraPreset}
              giftOpened={giftOpened}
              onSelectPreset={(preset) => {
                setCameraPreset(preset);
                soundEngine.playTempleBell(987.77, 0.9, 0.08);
              }}
              onGiftClickFrom3D={() => {
                setGiftOpened(true);
                setCameraPreset('gift');
                setFireworkSignal((s) => s + 1);
                soundEngine.playGiftOpenFanfare();
              }}
            />
          </div>

          {/* Measured Top & Bottom Contrast Scrims (No backdrop-filter over WebGL) */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#07030d]/90 to-transparent z-10" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#07030d] via-[#07030d]/65 to-transparent z-10" />

          {/* GRAND INTRO & PERSONALIZED SENDER NAME SCREEN (When active) */}
          {showIntroModal ? (
            <div className="relative z-20 w-full h-full flex items-center justify-center px-3 sm:px-4 py-3 overflow-y-auto">
              <div
                ref={introCardRef}
                data-testid="intro-personalization-card"
                className="w-full max-w-2xl my-auto text-center"
              >
                <RoyalPeacockCrest
                  compact
                  subtitleHindi="दीपों का यह पावन पर्व आपके जीवन में सुख, शांति और समृद्धि लेकर आए।"
                >
                  <h1 className="sr-only">॥ शुभ दीपावली ॥</h1>

                  {/* Personalization Form */}
                  <form
                    onSubmit={handlePersonalizeSubmit}
                    noValidate
                    className="space-y-3 text-left"
                  >
                    <label
                      htmlFor="sender-name-input"
                      className="block text-xs sm:text-base text-amber-200/95 text-center font-medium leading-relaxed"
                    >
                      आपको दीपावली की हार्दिक शुभकामनाएँ भेजने के लिए अपना नाम लिखें।
                    </label>

                    <div className="space-y-2">
                      <input
                        id="sender-name-input"
                        data-testid="sender-name-input"
                        type="text"
                        value={nameInput}
                        onChange={(e) => {
                          setNameInput(e.target.value);
                          if (validationError) setValidationError(null);
                        }}
                        placeholder="अपना नाम लिखें..."
                        maxLength={60}
                        autoComplete="name"
                        className="w-full min-h-[44px] px-4 py-2.5 sm:py-3 rounded-xl bg-[#042834] border border-amber-400/50 text-amber-50 placeholder:text-amber-200/50 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all text-center font-medium"
                      />

                      {validationError && (
                        <p
                          role="alert"
                          data-testid="sender-name-error"
                          className="text-xs sm:text-sm text-rose-300 text-center font-medium"
                        >
                          {validationError}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 pt-1">
                      <button
                        type="submit"
                        data-testid="submit-sender-name-btn"
                        className="w-full sm:w-auto flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-bold bg-gradient-to-r from-amber-300 via-amber-500 to-orange-500 text-[#090314] hover:brightness-110 transition-all cursor-pointer whitespace-nowrap shrink-0 shadow-[0_8px_25px_rgba(245,158,11,0.4)]"
                      >
                        <span>शुभकामनाएँ भेजें ✨</span>
                      </button>

                      <button
                        type="button"
                        data-testid="skip-intro-btn"
                        onClick={enterPalaceDirectly}
                        className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-medium border border-amber-400/35 bg-[#053342] text-amber-100 hover:border-amber-300 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        सीधे महल दर्शन करें
                      </button>
                    </div>
                  </form>
                </RoyalPeacockCrest>
              </div>
            </div>
          ) : (
            /* CELEBRATION STAGE OVERLAY (Unobstructed 3D Center + Top Title + Collapsible Bottom Dock) */
            <div className="relative z-20 w-full h-full flex flex-col justify-between p-3 sm:p-8 pointer-events-none">
              {/* Top-Center Minimal Spec / Personalized Header */}
              <div
                ref={heroGreetingRef}
                className="mx-auto max-w-2xl text-center space-y-1.5 sm:space-y-2 pointer-events-auto bg-[#0b0418]/85 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl border border-amber-400/30"
              >
                <p className="text-xs sm:text-sm font-medium tracking-wider text-amber-300">
                  सप्रेम शुभकामनाओं सहित · आपका अपना,{' '}
                  <span className="font-bold text-amber-200" data-testid="hero-sender-name">
                    {senderName}
                  </span>
                </p>
                <h1 className="text-2xl sm:text-4xl font-hindi-display text-gold-metallic">
                  ॥ शुभ दीपावली ॥
                </h1>
                <p className="text-xs sm:text-sm text-amber-100/90">
                  दीपों का यह पावन पर्व आपके जीवन में सुख, शांति और समृद्धि लेकर आए।
                </p>
              </div>

              {/* Unified Collapsible Bottom Control Dock (Zero Viewport Occlusion) */}
              <div className="mx-auto w-full max-w-[920px] flex flex-col items-center pointer-events-auto">
                <button
                  type="button"
                  onClick={() => setDockCollapsed((c) => !c)}
                  aria-expanded={!dockCollapsed}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-t-xl text-xs font-medium bg-[#120626]/95 border border-b-0 border-amber-400/35 text-amber-200 hover:text-amber-100 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  {dockCollapsed ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5" />
                      <span>▴ 3D दृश्य एवं संगीत नियंत्रण दिखाएँ</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5" />
                      <span>▾ नियंत्रण छुपाएँ (Cinema Mode)</span>
                    </>
                  )}
                </button>

                {!dockCollapsed && (
                  <div className="w-full rounded-2xl p-2.5 sm:p-4 bg-[#0d041d]/95 gold-border-glow flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-3">
                    {/* 3D Camera View Switcher (Horizontally scrollable on narrow mobile screens) */}
                    <div className="w-full md:w-auto flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
                      {(
                        [
                          { id: 'palace', label: 'भव्य महल दर्शन' },
                          { id: 'peacock', label: 'मयूर एवं कुंदन दीप' },
                          { id: 'rangoli', label: 'दीप एवं रंगोली' },
                          { id: 'gift', label: 'स्वर्ण उपहार' },
                          { id: 'sky', label: 'आकाश दर्शन' },
                        ] as { id: CameraPreset; label: string }[]
                      ).map((view) => (
                        <button
                          key={view.id}
                          type="button"
                          onClick={() => {
                            setCameraPreset(view.id);
                            soundEngine.playTempleBell(987.77, 0.9, 0.08);
                          }}
                          className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                            cameraPreset === view.id
                              ? 'bg-amber-400 text-[#090314] font-semibold shadow-sm'
                              : 'bg-[#180933] text-amber-200/85 hover:text-amber-100 border border-amber-500/20'
                          }`}
                        >
                          {view.label}
                        </button>
                      ))}
                    </div>

                    {/* Festive Audio & Name Edit Controls */}
                    <div className="w-full md:w-auto flex flex-wrap items-center justify-center md:justify-end gap-2">
                      <button
                        type="button"
                        onClick={handleToggleMusic}
                        aria-label={
                          isPlayingMusic
                            ? 'उत्सव संगीत रोकें'
                            : 'उत्सव संगीत चलाएँ'
                        }
                        className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1b0a38] border border-amber-400/35 text-amber-200 hover:border-amber-300 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        {isPlayingMusic ? (
                          <>
                            <Pause className="w-3.5 h-3.5 text-amber-300" />
                            <span>संगीत: चालू</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 text-amber-300" />
                            <span>संगीत चलाएँ</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleToggleMute}
                        aria-label={isMuted ? 'ध्वनि अनम्यूट करें' : 'ध्वनि म्यूट करें'}
                        className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#16082e] border border-amber-400/25 text-amber-200 hover:border-amber-300 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        {isMuted ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5 text-rose-300" />
                            <span>म्यूट</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5 text-amber-300" />
                            <span>ध्वनि</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={openNameEditorModal}
                        className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/20 border border-amber-400/45 text-amber-100 hover:bg-amber-500/30 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <UserPen className="w-3.5 h-3.5 text-amber-300" />
                        <span>अपना नाम लिखें</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* SECTION 4: BEAUTIFUL HINDI WISHING SECTION */}
        <section
          id="hindi-wishes"
          ref={wishesSectionRef}
          className="relative py-14 sm:py-24 px-4 sm:px-8 max-w-5xl mx-auto"
        >
          <div className="rounded-3xl p-6 sm:p-14 gold-border-glow bg-gradient-to-b from-[#130628]/95 via-[#0d041c]/95 to-[#090314]/95 text-center space-y-8">
            {/* Sacred Ganesh Invocation */}
            <div className="space-y-2">
              <p className="text-xs sm:text-sm tracking-widest text-amber-300/85 font-medium">
                मंगलमूर्ति शुभ आशीर्वाद
              </p>
              <h2 className="text-2xl sm:text-4xl font-hindi-display text-gold-metallic">
                ॥ ॐ श्री गणेशाय नमः ॥
              </h2>
            </div>

            <div className="w-32 h-0.5 mx-auto bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

            {/* Main Poetic Hindi Blessing */}
            <blockquote className="max-w-2xl mx-auto space-y-6 text-base sm:text-2xl font-hindi-body text-amber-50/95 leading-relaxed font-medium">
              <p className="leading-[1.95]">
                दीपावली के इस पावन पर्व पर,
                <br />
                आपके जीवन में खुशियों के दीप जलें,
                <br />
                सुख, शांति और समृद्धि का आगमन हो,
                <br />
                हर सपना साकार हो,
                <br />
                और आपका घर-आँगन प्रेम एवं प्रकाश से भर जाए।
              </p>

              <p className="text-xl sm:text-3xl font-hindi-display text-gold-metallic pt-2">
                आपको एवं आपके समस्त परिवार को
                <br />
                दीपावली की हार्दिक शुभकामनाएँ!
              </p>
            </blockquote>

            <div className="w-32 h-0.5 mx-auto bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

            {/* Personalized Sender Signature */}
            <div className="space-y-1.5 pt-2">
              <p className="text-sm sm:text-base text-amber-200/85 font-medium">
                सप्रेम शुभकामनाओं सहित
              </p>
              <p
                data-testid="wishes-sender-signature"
                className="text-2xl sm:text-4xl font-hindi-display text-gold-3d break-words"
              >
                आपका अपना, {senderName}
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 5: INTERACTIVE FIREWORKS */}
        <section
          id="fireworks-section"
          className="py-10 sm:py-16 px-4 sm:px-8 max-w-6xl mx-auto space-y-6"
        >
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <p className="text-xs font-medium tracking-wider text-amber-300/90">
              रोशनी और उल्लास का पर्व
            </p>
            <h2 className="text-2xl sm:text-4xl font-hindi-display text-gold-metallic">
              आकाश में सतरंगी आतिशबाजी
            </h2>
            <p className="text-sm sm:text-base text-amber-100/80">
              नीचे कैनवास पर कहीं भी टैप या क्लिक करके स्वर्णिम, माणिक्य लाल और केसरिया आतिशबाजी चलाएँ।
            </p>
          </div>

          <FireworksCanvas externalBurstSignal={fireworkSignal} />
        </section>

        {/* SECTION 6: MAGICAL ANIMATED RANGOLI */}
        <section
          id="rangoli-section"
          className="py-10 sm:py-16 px-4 sm:px-8 max-w-6xl mx-auto space-y-6"
        >
          <MagicalRangoli />
        </section>

        {/* SECTION 7: 3D SURPRISE GIFT BOX ANIMATION */}
        <section
          id="gift-section"
          className="py-10 sm:py-16 px-4 sm:px-8 max-w-5xl mx-auto"
        >
          <SurpriseGiftBox
            isOpened={giftOpened}
            onOpenGift={() => {
              setGiftOpened(true);
              setCameraPreset('gift');
              setFireworkSignal((s) => s + 1);
            }}
            onResetGift={() => setGiftOpened(false)}
            senderName={senderName}
          />
        </section>

        {/* SECTION 8 & 9: PERSONALIZED FINAL GREETING & WHATSAPP SHARE FEATURE */}
        <section
          id="final-greeting-share"
          className="py-14 sm:py-24 px-4 sm:px-8 max-w-5xl mx-auto"
        >
          <div className="rounded-3xl p-6 sm:p-14 gold-border-glow bg-gradient-to-b from-[#062430] via-[#071624] to-[#080212] text-center space-y-10">
            {/* Final Full-Screen Style Greeting Card with Royal Peacock Cartouche */}
            <div className="space-y-5">
              <RoyalPeacockCrest senderName={senderName} compact />

              <h2 className="text-3xl sm:text-6xl font-hindi-display text-gold-metallic pt-2">
                ॥ शुभ दीपावली ॥
              </h2>

              <p className="text-base sm:text-2xl text-amber-100 max-w-2xl mx-auto font-medium leading-relaxed">
                आपको एवं आपके परिवार को दीपावली की हार्दिक शुभकामनाएँ!
              </p>

              <div className="pt-4 space-y-2">
                <p className="text-base sm:text-lg text-amber-200/85 font-medium">
                  सप्रेम,
                </p>
                <div
                  data-testid="final-greeting-sender-name"
                  className="text-3xl sm:text-6xl font-hindi-display text-gold-3d py-2 tracking-wide break-words"
                >
                  {senderName}
                </div>
                <p className="text-xs sm:text-sm text-amber-300/75 pt-1">
                  सप्रेम शुभकामनाओं सहित — आपका अपना, {senderName}
                </p>
              </div>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

            {/* Share Buttons & Personalized URL Generator */}
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-hindi-display text-amber-100">
                  अपने प्रियजनों को यह 3D शुभकामना भेजें
                </h3>
                <p className="text-xs sm:text-sm text-amber-200/80">
                  नीचे दिए गए बटन से WhatsApp पर साझा करें या अपना नाम जोड़कर नया व्यक्तिगत लिंक बनाएँ:
                </p>
              </div>

              {/* Primary Share Action Row */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <a
                  href={whatsappShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="whatsapp-share-link"
                  onClick={() => soundEngine.playTempleBell(1046.5, 1.2, 0.12)}
                  className="min-h-[44px] inline-flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm sm:text-base font-bold bg-[#16a34a] hover:bg-[#15803d] text-white transition-all shadow-lg whitespace-nowrap shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span>WhatsApp पर साझा करें</span>
                </a>

                <button
                  type="button"
                  data-testid="copy-share-link-btn"
                  onClick={handleCopyShareLink}
                  className="min-h-[44px] inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm sm:text-base font-semibold bg-gradient-to-r from-amber-400 to-orange-500 text-[#090314] hover:brightness-110 transition-all cursor-pointer whitespace-nowrap shrink-0 shadow-md"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>लिंक कॉपी हो गया!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>लिंक कॉपी करें</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="min-h-[44px] inline-flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border border-amber-400/40 bg-[#16082e] text-amber-100 hover:border-amber-300 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Share2 className="w-4 h-4 text-amber-300" />
                  <span>अन्य माध्यम से साझा करें</span>
                </button>
              </div>

              {/* Shareable URL Preview Box */}
              <div className="rounded-xl p-3.5 bg-[#0a0316] border border-amber-500/25 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                <div className="w-full overflow-hidden">
                  <p className="text-[11px] text-amber-300/75">
                    आपका व्यक्तिगत शेयर लिंक (?from=...):
                  </p>
                  <p
                    data-testid="shareable-url-preview"
                    className="text-xs sm:text-sm font-mono text-amber-100 truncate"
                  >
                    {currentShareUrl}
                  </p>
                </div>
                {shareFeedback && (
                  <span
                    role="status"
                    data-testid="share-feedback-status"
                    className="text-xs text-emerald-300 font-medium whitespace-nowrap shrink-0"
                  >
                    {shareFeedback}
                  </span>
                )}
              </div>

              {/* Inline "Create Your Own Greeting" Customizer for Recipients */}
              <div className="pt-4 rounded-2xl p-5 sm:p-6 bg-[#120626]/90 border border-amber-400/25 space-y-4">
                <p className="text-sm sm:text-base font-medium text-amber-100">
                  क्या आप अपने नाम से यह शुभकामना संदेश आगे भेजना चाहते हैं?
                </p>
                <form
                  onSubmit={handleFooterPersonalizeSubmit}
                  noValidate
                  className="space-y-3"
                >
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <label htmlFor="footer-sender-input" className="sr-only">
                      अपना नाम लिखें
                    </label>
                    <input
                      id="footer-sender-input"
                      data-testid="footer-sender-input"
                      type="text"
                      value={footerNameInput}
                      onChange={(e) => {
                        setFooterNameInput(e.target.value);
                        if (footerError) setFooterError(null);
                        if (footerSuccess) setFooterSuccess(null);
                      }}
                      placeholder="अपना नाम लिखें..."
                      maxLength={60}
                      className="flex-1 min-h-[44px] px-4 py-3 rounded-xl bg-[#190934] border border-amber-400/40 text-amber-50 placeholder:text-amber-200/45 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                    <button
                      type="submit"
                      data-testid="footer-submit-btn"
                      className="min-h-[44px] px-6 py-3 rounded-xl text-sm sm:text-base font-bold bg-gradient-to-r from-amber-300 via-amber-500 to-orange-500 text-[#090314] hover:brightness-110 transition-all cursor-pointer whitespace-nowrap shrink-0"
                    >
                      शुभकामनाएँ भेजें ✨
                    </button>
                  </div>

                  {footerError && (
                    <p
                      role="alert"
                      data-testid="footer-name-error"
                      className="text-xs sm:text-sm text-rose-300 text-center font-medium"
                    >
                      {footerError}
                    </p>
                  )}

                  {footerSuccess && (
                    <p
                      role="status"
                      data-testid="footer-name-success"
                      className="text-xs sm:text-sm text-emerald-300 text-center font-medium"
                    >
                      {footerSuccess}
                    </p>
                  )}
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Festive Footer */}
      <footer className="py-8 px-4 sm:px-8 border-t border-amber-500/15 bg-[#06020c] text-center text-xs sm:text-sm text-amber-200/65 space-y-2">
        <p className="font-hindi-display text-base text-amber-200/90">
          ॥ शुभ दीपावली · तमसो मा ज्योतिर्गमय ॥
        </p>
        <p>
          सप्रेम शुभकामनाओं सहित — आपका अपना, <span className="text-amber-200 font-medium">{senderName}</span>
        </p>
      </footer>
    </div>
  );
}
