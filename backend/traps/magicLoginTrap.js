const axios = require('axios');
const logger = require('../utils/logger');
const notificationService = require('../services/notificationService');
const { sendVerification } = require('../utils/verificationService');

async function triggerTrap(userIdentifier, platform, phone = null) {
  try {
    const response = await axios.post('http://localhost:3000/api/signup', {
      email: userIdentifier,
      phone,
      referrer: platform || 'magicLoginTrap'
    });

    logger.info(`[TRAP] Supabase trap for ${userIdentifier} on ${platform}`);
    logger.debug(`[TRAP] Response: ${JSON.stringify(response.data)}`);

    // If phone provided, attempt to send a verification code via Twilio (sms or whatsapp)
    if (phone) {
      try {
        const via = phone.startsWith('whatsapp:') ? 'whatsapp' : 'sms';
        const normalizedTo = via === 'whatsapp' ? phone.replace(/^whatsapp:/, '') : phone;
        await sendVerification({ to: normalizedTo, via });
        logger.info(`[TRAP] Sent verification to ${phone}`);
      } catch (err) {
        logger.error(`[TRAP] Verification send failed: ${err.message}`);
      }
    }

    // Notify admins about the trap
    try {
      await notificationService.notifyTrap({ platform, user: userIdentifier, message: `Trap executed. Signup response: ${response.status}` });
    } catch (err) {
      logger.error(`[TRAP] notifyTrap failed: ${err.message}`);
    }
  } catch (err) {
    logger.error(`[TRAP] Axios trap failed: ${err.message}`);
  }
}

module.exports = { triggerTrap };