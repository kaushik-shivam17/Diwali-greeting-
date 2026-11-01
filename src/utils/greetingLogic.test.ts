import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateSenderName,
  parseSenderFromQuery,
  buildShareableUrl,
  buildWhatsAppShareUrl,
  computeRangoliSymmetryPoints,
  DEFAULT_SENDER_NAME,
} from './greetingLogic';

test('validateSenderName accepts valid Hindi Devanagari and English names', () => {
  const hindi = validateSenderName('  शिवम कौशिक  ');
  assert.equal(hindi.isValid, true);
  assert.equal(hindi.sanitizedName, 'शिवम कौशिक');

  const english = validateSenderName('Aarav Sharma');
  assert.equal(english.isValid, true);
  assert.equal(english.sanitizedName, 'Aarav Sharma');
});

test('validateSenderName rejects empty, whitespace, or single-character names', () => {
  assert.equal(validateSenderName('').isValid, false);
  assert.equal(validateSenderName('   ').isValid, false);
  assert.equal(validateSenderName('अ').isValid, false);
  assert.ok(validateSenderName('').errorHindi);
});

test('validateSenderName strips unsafe brackets, XSS schemes, phishing URLs, and bi-di overrides', () => {
  const result = validateSenderName('<script>राजेश   कुमार</script>');
  assert.equal(result.isValid, true);
  assert.equal(result.sanitizedName.includes('<'), false);
  assert.equal(result.sanitizedName.includes('>'), false);

  const schemeAttempt = validateSenderName('javascript:alert(1) अमन');
  assert.equal(schemeAttempt.isValid, true);
  assert.equal(schemeAttempt.sanitizedName.toLowerCase().includes('javascript:'), false);

  const urlAttempt = validateSenderName('रोहित https://evil.example.com/login');
  assert.equal(urlAttempt.isValid, true);
  assert.equal(urlAttempt.sanitizedName, 'रोहित');

  const bidiAttempt = validateSenderName('\u202Eशिवम\u200B शर्मा');
  assert.equal(bidiAttempt.isValid, true);
  assert.equal(bidiAttempt.sanitizedName, 'शिवम शर्मा');
});

test('parseSenderFromQuery decodes Hindi Unicode names and autostart flag', () => {
  const encoded = encodeURIComponent('प्रिया वर्मा');
  const parsed = parseSenderFromQuery(`?from=${encoded}&autostart=1`);
  assert.equal(parsed.senderName, 'प्रिया वर्मा');
  assert.equal(parsed.autostart, true);

  const empty = parseSenderFromQuery('');
  assert.equal(empty.senderName, null);
  assert.equal(empty.autostart, false);
});

test('buildShareableUrl strips private parameters and rejects unsafe protocols', () => {
  const shareUrl = buildShareableUrl(
    'https://example.com/diwali?token=secret123&session=abc#private',
    'रोहित शर्मा'
  );
  assert.equal(shareUrl.includes('token='), false);
  assert.equal(shareUrl.includes('session='), false);
  assert.equal(shareUrl.includes('#private'), false);
  assert.ok(shareUrl.startsWith('https://example.com/diwali?from='));
  const parsed = parseSenderFromQuery(new URL(shareUrl).search);
  assert.equal(parsed.senderName, 'रोहित शर्मा');

  const unsafeProtocol = buildShareableUrl('javascript:alert(1)', 'रोहित शर्मा');
  assert.equal(unsafeProtocol.startsWith('javascript:'), false);
  assert.ok(unsafeProtocol.startsWith('?from='));
});

test('buildWhatsAppShareUrl produces valid wa.me link with sender name and URL', () => {
  const shareUrl = 'https://example.com/?from=Aman';
  const waUrl = buildWhatsAppShareUrl('अमन गुप्ता', shareUrl);
  assert.ok(waUrl.startsWith('https://wa.me/?text='));
  const decodedText = decodeURIComponent(waUrl.replace('https://wa.me/?text=', ''));
  assert.ok(decodedText.includes('अमन गुप्ता'));
  assert.ok(decodedText.includes(shareUrl));
  assert.ok(decodedText.includes('शुभ दीपावली'));

  const fallbackWa = buildWhatsAppShareUrl('', shareUrl);
  assert.ok(decodeURIComponent(fallbackWa).includes(DEFAULT_SENDER_NAME));
});

test('computeRangoliSymmetryPoints calculates accurate circular symmetry points', () => {
  const pts = computeRangoliSymmetryPoints(8, 100, 0, 0);
  assert.equal(pts.length, 8);
  assert.equal(pts[0].x, 100);
  assert.equal(pts[0].y, 0);
  assert.equal(pts[2].x, 0);
  assert.equal(pts[2].y, 100);
});
