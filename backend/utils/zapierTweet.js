const axios = require('axios');
const logger = require('./logger');

const ZAPIER_WEBHOOK = 'https://hooks.zapier.com/hooks/catch/27564361/4yzw0vu/';

async function sendToZapier(text) {
  try {
    await axios.post(ZAPIER_WEBHOOK, { caption: text });
    logger.info(`[Zapier] Tweet sent: ${text}`);
    return true;
  } catch (err) {
    logger.error(`[Zapier] Failed: ${err.message}`);
    return false;
  }
}

module.exports = { sendToZapier };
