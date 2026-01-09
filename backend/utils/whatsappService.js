const logger = require('./logger');
const { getClient, retryableSend } = require('./twilioClient');

async function sendWhatsApp(to, message, opts = {}) {
  const from = process.env.TWILIO_WHATSAPP_FROM; // e.g., '+14155238886' or 'whatsapp:+14155238886'
  if (!from) throw new Error('TWILIO_WHATSAPP_FROM missing');
  const fromAddr = from.startsWith('whatsapp:') ? from : `whatsapp:${from}`;
  const toAddr = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

  const client = await getClient();

  const sendFn = async () => {
    const resp = await client.messages.create({ to: toAddr, from: fromAddr, body: message });
    logger.info(`[WHATSAPP] Sent message sid=${resp.sid} to=${to}`);
    return { success: true, sid: resp.sid };
  };

  return retryableSend(sendFn, { retries: opts.retries, baseMs: opts.baseMs });
}

module.exports = { sendWhatsApp };


