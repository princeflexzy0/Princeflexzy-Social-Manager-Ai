const logger = require('../utils/logger');
const { sendVerification, verifyCode } = require('../utils/verificationService');

// POST /verify/start
async function startVerification(req, res) {
  const { to, via = 'sms', ttlSeconds } = req.body || {};
  if (!to) return res.status(400).json({ error: 'to is required' });

  try {
    const result = await sendVerification({ to, via, ttlSeconds });
    // Don't return the code in production. For testing we include it when NODE_ENV !== 'production'
    const payload = { success: true };
    if (process.env.NODE_ENV !== 'production') payload.code = result.code;
    return res.json(payload);
  } catch (err) {
    logger.error(`[VERIFICATION] start failed: ${err.message}`);
    return res.status(500).json({ error: 'failed to send verification' });
  }
}

// POST /verify/confirm
async function confirmVerification(req, res) {
  const { to, via = 'sms', code } = req.body || {};
  if (!to || !code) return res.status(400).json({ error: 'to and code are required' });

  try {
    const result = verifyCode({ to, via, code });
    if (!result.success) return res.status(400).json({ success: false, reason: result.reason });
    return res.json({ success: true });
  } catch (err) {
    logger.error(`[VERIFICATION] confirm failed: ${err.message}`);
    return res.status(500).json({ error: 'verification check failed' });
  }
}

module.exports = { startVerification, confirmVerification };
