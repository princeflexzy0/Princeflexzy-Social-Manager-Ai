const axios = require('axios');
const logger = require('./logger');

const ZAPIER_WEBHOOK = 'https://princeflexzy.app.n8n.cloud/webhook/a102283f-8fec-47f8-9fdd-413c46dcd23c';

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
