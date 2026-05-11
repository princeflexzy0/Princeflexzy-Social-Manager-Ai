const axios = require('axios');
const logger = require('./logger');

const ZAPIER_WEBHOOK = 'https://hook.eu1.make.com/okbyorjyitxw37oih16o5m9k9rre85sg';

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
