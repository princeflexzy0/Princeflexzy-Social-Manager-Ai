require('dotenv').config();
const notificationService = require('../services/notificationService');
const { sendVerification } = require('../utils/verificationService');
const logger = require('../utils/logger');

(async function main(){
  try {
    const testPhone = process.env.TEST_PHONE || process.env.ALERT_SMS_TO;
    if (!testPhone) {
      console.error('No TEST_PHONE or ALERT_SMS_TO configured in .env; aborting real send');
      process.exit(1);
    }

    console.log('Sending administrative notification via Twilio (sms & whatsapp if enabled)');
    await notificationService.notifyTrap({ platform: 'test-run', user: 'tester', message: 'This is a test admin notification (automated).' });
    console.log('Admin notification attempted');

    console.log(`Sending verification code to ${testPhone} via sms`);
    const res = await sendVerification({ to: testPhone, via: 'sms', ttlSeconds: 300 });
    console.log('Verification send result:', { success: true, code: (process.env.NODE_ENV === 'production' ? 'hidden' : res.code) });

    // Optionally send whatsapp verification if enabled and WhatsApp recipient exists
    const testWa = process.env.TEST_PHONE_WA || process.env.ALERT_WHATSAPP_TO;
    if (testWa) {
      console.log(`Sending verification code to ${testWa} via whatsapp`);
      const res2 = await sendVerification({ to: testWa, via: 'whatsapp', ttlSeconds: 300 });
      console.log('WhatsApp verification send result:', { success: true, code: (process.env.NODE_ENV === 'production' ? 'hidden' : res2.code) });
    }

    console.log('Done');
    process.exit(0);
  } catch (err) {
    logger.error('Real send failed: ' + (err && err.message));
    console.error(err);
    process.exit(2);
  }
})();
