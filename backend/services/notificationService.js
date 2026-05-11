const axios = require('axios');
const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

async function sendEmailAlert(subject, message) {
  if (process.env.ENABLE_EMAIL !== 'true') return;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.NOTIFY_EMAIL,
      subject,
      text: message
    });
  } catch (err) {
    logger.error(`[EMAIL] Failed: ${err.message}`);
  }
}

async function sendTelegramAlert(message) {
  if (process.env.ENABLE_TELEGRAM !== 'true') return;

  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
    return logger.info('[TELEGRAM] Missing token or chat_id');
  }

  try {
    await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: process.env.TELEGRAM_CHAT_ID,
      text: message,
    });
  } catch (err) {
    logger.error(`[TELEGRAM] Failed: ${err.message}`);
  }
}

const { getClient, retryableSend } = require('../utils/twilioClient');

async function sendTwilioAlert(message, via = 'sms') {
  const enabled = via === 'sms' ? process.env.ENABLE_SMS : process.env.ENABLE_WHATSAPP;
  if (enabled !== 'true') return;

  const from = via === 'whatsapp' ? process.env.TWILIO_WHATSAPP_FROM : process.env.TWILIO_SMS_FROM;
  const to = via === 'whatsapp' ? process.env.ALERT_WHATSAPP_TO : process.env.ALERT_SMS_TO;

  if (!from || !to) {
    return logger.info(`[TWILIO-${via}] Missing sender/recipient`);
  }

  const client = await getClient();
  const retries = parseInt(process.env.TWILIO_RETRY_COUNT || '3', 10);
  const baseMs = parseInt(process.env.TWILIO_RETRY_BASE_MS || '300', 10);

  try {
    await retryableSend(async () => {
      return client.messages.create({ body: message, from, to });
    }, { retries, baseMs });
  } catch (err) {
    logger.error(`[TWILIO-${via}] Failed: ${err.message}`);
  }
}

async function notifyTrap({ platform, user, message }) {
  logger.info(`[NOTIFY] ${message}`);

  const finalMessage = ` Trap Triggered!\n Platform: ${platform}\n User: ${user}\n Details: ${message}`;

  await sendEmailAlert(`Trap Alert: ${platform}`, finalMessage);
  await sendTelegramAlert(finalMessage);
  await sendTwilioAlert(finalMessage, 'sms');
  await sendTwilioAlert(finalMessage, 'whatsapp');
}

module.exports = { notifyTrap };
