/**
 * Pure business logic for sender name validation, security sanitization,
 * URL personalization, WhatsApp share link creation, and festive geometry helpers.
 */

export interface ValidationResult {
  isValid: boolean;
  sanitizedName: string;
  errorHindi?: string;
}

export const MAX_SENDER_NAME_LENGTH = 60;
export const DEFAULT_SENDER_NAME = 'आपका शुभचिंतक';

/**
 * Sanitizes and validates a visitor's sender name.
 * - Normalizes Unicode (NFC) to preserve Hindi Devanagari characters and matras.
 * - Strips HTML/script brackets, template syntax, and invisible bidirectional/zero-width spoofing chars.
 * - Rejects or strips dangerous URI schemes (javascript:, data:, vbscript:) and embedded URLs (http/https/www)
 *   to prevent phishing or XSS injection via the `?from=` URL query parameter.
 */
export function validateSenderName(rawInput: string): ValidationResult {
  if (typeof rawInput !== 'string') {
    return {
      isValid: false,
      sanitizedName: '',
      errorHindi: 'कृपया अपना शुभ नाम लिखें।',
    };
  }

  // Normalize Unicode and strip control characters, bi-di overrides, and HTML/script symbols
  const cleaned = rawInput
    .normalize('NFC')
    .replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/g, '')
    .replace(/[<>{}[\]\\^`~|;$=]/g, '')
    .replace(/\b(javascript|data|vbscript|file|blob)\s*:/gi, '')
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/\bwww\.\S+/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned || cleaned.length === 0) {
    return {
      isValid: false,
      sanitizedName: '',
      errorHindi: 'कृपया शुभकामनाएँ भेजने के लिए अपना नाम लिखें।',
    };
  }

  // Ensure the name has at least 2 visible Unicode code points
  const codePoints = Array.from(cleaned);
  if (codePoints.length < 2) {
    return {
      isValid: false,
      sanitizedName: cleaned,
      errorHindi: 'कृपया कम से कम २ अक्षरों का नाम लिखें।',
    };
  }

  const truncated =
    codePoints.length > MAX_SENDER_NAME_LENGTH
      ? codePoints.slice(0, MAX_SENDER_NAME_LENGTH).join('').trim()
      : cleaned;

  return {
    isValid: true,
    sanitizedName: truncated,
  };
}

/**
 * Extracts and validates the `from` query parameter from a URL search string.
 */
export function parseSenderFromQuery(search: string): {
  senderName: string | null;
  autostart: boolean;
} {
  try {
    const params = new URLSearchParams(search);
    const autostart =
      params.get('autostart') === '1' || params.get('autostart') === 'true';
    const rawFrom = params.get('from');

    if (!rawFrom) {
      return { senderName: null, autostart };
    }

    let decoded = rawFrom;
    try {
      if (/%[0-9A-Fa-f]{2}/.test(rawFrom)) {
        decoded = decodeURIComponent(rawFrom);
      }
    } catch {
      decoded = rawFrom;
    }

    const validation = validateSenderName(decoded);
    if (validation.isValid) {
      return {
        senderName: validation.sanitizedName,
        autostart,
      };
    }
    return { senderName: null, autostart };
  } catch {
    return { senderName: null, autostart: false };
  }
}

/**
 * Builds a clean, safe shareable URL containing ONLY the `?from=` parameter
 * (never exposing private query tokens, hashes, or non-HTTP protocols).
 */
export function buildShareableUrl(currentUrl: string, senderName: string): string {
  const validation = validateSenderName(senderName);
  const safeName = validation.isValid ? validation.sanitizedName : DEFAULT_SENDER_NAME;

  try {
    const parsed = new URL(currentUrl);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return `?from=${encodeURIComponent(safeName)}`;
    }
    const cleanUrl = new URL(parsed.origin + parsed.pathname);
    cleanUrl.search = `?from=${encodeURIComponent(safeName)}`;
    return cleanUrl.toString();
  } catch {
    return `?from=${encodeURIComponent(safeName)}`;
  }
}

/**
 * Builds a WhatsApp share URL (`https://wa.me/?text=...`) with a festive Hindi greeting
 * and the personalized link.
 */
export function buildWhatsAppShareUrl(senderName: string, shareUrl: string): string {
  const validation = validateSenderName(senderName);
  const safeName = validation.isValid ? validation.sanitizedName : DEFAULT_SENDER_NAME;

  const message = [
    '🪔 *॥ शुभ दीपावली ॥* 🪔',
    '',
    `*${safeName}* ने आपके और आपके परिवार के लिए एक विशेष 3D दीपावली शुभकामना संदेश भेजा है! ✨`,
    '',
    'दीपों का यह पावन पर्व आपके जीवन में सुख, शांति और समृद्धि लेकर आए।',
    '',
    '👇 अपना विशेष 3D संदेश यहाँ देखें:',
    shareUrl,
  ].join('\n');

  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

/**
 * Computes symmetrical coordinates for Rangoli petals and surrounding Diyas.
 */
export interface RangoliPoint {
  x: number;
  y: number;
  angleRad: number;
  angleDeg: number;
}

export function computeRangoliSymmetryPoints(
  count: number,
  radius: number,
  centerX = 0,
  centerY = 0,
  phaseOffsetRad = 0
): RangoliPoint[] {
  const safeCount = Math.max(1, Math.min(64, Math.floor(count)));
  const points: RangoliPoint[] = [];
  for (let i = 0; i < safeCount; i++) {
    const angleRad = (i / safeCount) * Math.PI * 2 + phaseOffsetRad;
    const angleDeg = (angleRad * 180) / Math.PI;
    points.push({
      x: Number((centerX + Math.cos(angleRad) * radius).toFixed(4)),
      y: Number((centerY + Math.sin(angleRad) * radius).toFixed(4)),
      angleRad,
      angleDeg,
    });
  }
  return points;
}

export interface DiwaliCountdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
  isDiwaliToday: boolean;
  targetYear: number;
  targetDateFormatted: string;
  summaryText: string;
}

const UPCOMING_DIWALI_DATES: ReadonlyArray<{
  year: number;
  monthIndex: number; // 0-indexed (9 = October, 10 = November)
  day: number;
}> = [
  { year: 2025, monthIndex: 9, day: 20 },
  { year: 2026, monthIndex: 10, day: 8 },
  { year: 2027, monthIndex: 9, day: 29 },
  { year: 2028, monthIndex: 9, day: 17 },
  { year: 2029, monthIndex: 10, day: 5 },
  { year: 2030, monthIndex: 9, day: 26 },
  { year: 2031, monthIndex: 10, day: 14 },
  { year: 2032, monthIndex: 10, day: 2 },
  { year: 2033, monthIndex: 9, day: 22 },
  { year: 2034, monthIndex: 10, day: 10 },
  { year: 2035, monthIndex: 9, day: 30 },
];

/**
 * Calculates the time remaining until the next Diwali using JavaScript's Date object.
 */
export function calculateDiwaliCountdown(now: Date = new Date()): DiwaliCountdown {
  const safeNow =
    now instanceof Date && !Number.isNaN(now.getTime()) ? now : new Date();

  const currentYear = safeNow.getFullYear();
  const currentMonth = safeNow.getMonth();
  const currentDay = safeNow.getDate();

  // Check if today is Diwali
  const todayMatch = UPCOMING_DIWALI_DATES.find(
    (d) =>
      d.year === currentYear &&
      d.monthIndex === currentMonth &&
      d.day === currentDay
  );

  if (todayMatch) {
    const targetDate = new Date(
      todayMatch.year,
      todayMatch.monthIndex,
      todayMatch.day,
      0,
      0,
      0,
      0
    );
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalDays: 0,
      isDiwaliToday: true,
      targetYear: todayMatch.year,
      targetDateFormatted: targetDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      summaryText: 'Happy Diwali Today! · आज शुभ दीपावली है',
    };
  }

  // Find next upcoming Diwali date
  let targetDate: Date | null = null;
  for (const entry of UPCOMING_DIWALI_DATES) {
    const candidate = new Date(entry.year, entry.monthIndex, entry.day, 0, 0, 0, 0);
    if (candidate.getTime() > safeNow.getTime()) {
      targetDate = candidate;
      break;
    }
  }

  // Fallback for dates beyond our lookup table
  if (!targetDate) {
    const fallbackThisYear = new Date(currentYear, 10, 8, 0, 0, 0, 0);
    targetDate =
      fallbackThisYear.getTime() > safeNow.getTime()
        ? fallbackThisYear
        : new Date(currentYear + 1, 10, 8, 0, 0, 0, 0);
  }

  const diffMs = Math.max(0, targetDate.getTime() - safeNow.getTime());
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
  const seconds = Math.floor((diffMs / 1000) % 60);
  const totalDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  const targetDateFormatted = targetDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const dayLabel = totalDays === 1 ? '1 day until Diwali' : `${totalDays} days until Diwali`;

  return {
    days,
    hours,
    minutes,
    seconds,
    totalDays,
    isDiwaliToday: false,
    targetYear: targetDate.getFullYear(),
    targetDateFormatted,
    summaryText: `${dayLabel} (${days}d ${hours}h ${minutes}m)`,
  };
}

