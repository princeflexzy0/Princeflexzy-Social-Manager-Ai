const logger = require('./logger');
const { getClient, retryableSend } = require('./twilioClient');

async function sendSMS(to, message, opts = {}) {
  const from = process.env.TWILIO_SMS_FROM;
  if (!from) throw new Error('TWILIO_SMS_FROM missing');

  const client = await getClient();

  const sendFn = async () => {
    const resp = await client.messages.create({ to, from, body: message });
    logger.info(`[SMS] Sent message sid=${resp.sid} to=${to}`);
    return { success: true, sid: resp.sid };
  };

  return retryableSend(sendFn, { retries: opts.retries, baseMs: opts.baseMs });
}

module.exports = { sendSMS };


