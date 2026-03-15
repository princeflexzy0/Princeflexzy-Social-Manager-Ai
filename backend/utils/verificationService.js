const crypto = require('crypto');
const logger = require('./logger');
const { sendSMS } = require('./smsService');
const { sendWhatsApp } = require('./whatsappService');

// Simple in-memory store for verification codes. TTL-based.
// NOTE: This is suitable for small/testing setups. For production use a persistent store (Redis).
const store = new Map(); // key -> { code, expiresAt }

// Rate limiting per phone (and via)
// attemptsStore key -> { count, windowStart }
const attemptsStore = new Map();
const MAX_ATTEMPTS = parseInt(process.env.VERIF_MAX_ATTEMPTS || '5', 10);
const WINDOW_SEC = parseInt(process.env.VERIF_WINDOW_SEC || '3600', 10);

function _attemptKey(via, to) {
  return `att:${via}:${to}`;
}

function _checkAndIncrementAttempts(via, to) {
  const key = _attemptKey(via, to);
  const now = Date.now();
  const windowMs = WINDOW_SEC * 1000;
  const rec = attemptsStore.get(key);
  if (!rec) {
    attemptsStore.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
  }
  if (now - rec.windowStart > windowMs) {
    // Reset window
    attemptsStore.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
  }
  if (rec.count >= MAX_ATTEMPTS) {
    return { allowed: false, remaining: 0, retryAfter: Math.ceil((rec.windowStart + windowMs - now) / 1000) };
  }
  rec.count += 1;
  attemptsStore.set(key, rec);
  return { allowed: true, remaining: MAX_ATTEMPTS - rec.count };
}

function _resetAttemptsForTest(via, to) {
  attemptsStore.delete(_attemptKey(via, to));
}

function generateCode(length = 6) {
  const max = 10 ** length;
  const num = crypto.randomInt(0, max);
  return String(num).padStart(length, '0');
}

async function sendVerification({ to, via = 'sms', ttlSeconds = 300 } = {}) {
  if (!to) throw new Error('Recipient number required');

  // Rate-limit per phone+via
  const attempt = _checkAndIncrementAttempts(via, to);
  if (!attempt.allowed) {
    const err = new Error('rate_limited');
    err.code = 'rate_limited';
    err.retryAfter = attempt.retryAfter;
    throw err;
  }

  const code = generateCode(6);
  const expiresAt = Date.now() + ttlSeconds * 1000;
  const key = `${via}:${to}`;
  store.set(key, { code, expiresAt });

  const message = `Your verification code is: ${code}. It expires in ${Math.floor(ttlSeconds/60)} minute(s).`;

  try {
    if (via === 'whatsapp') {
      await sendWhatsApp(to, message);
      logger.info(`[VERIFICATION] Sent WhatsApp code to ${to}`);
    } else {
      await sendSMS(to, message);
      logger.info(`[VERIFICATION] Sent SMS code to ${to}`);
    }
    return { success: true, code };
  } catch (err) {
    logger.error(`[VERIFICATION] Failed to send code to ${to}: ${err.message}`);
    throw err;
  }
}

function verifyCode({ to, via = 'sms', code } = {}) {
  const key = `${via}:${to}`;
  const rec = store.get(key);
  if (!rec) return { success: false, reason: 'no_code' };
  if (Date.now() > rec.expiresAt) {
    store.delete(key);
    return { success: false, reason: 'expired' };
  }
  if (rec.code !== String(code)) return { success: false, reason: 'mismatch' };
  store.delete(key);
  return { success: true };
}

module.exports = { sendVerification, verifyCode, _resetAttemptsForTest, _clearStoreForTest: () => { store.clear(); } };
