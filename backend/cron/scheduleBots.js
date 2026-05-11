const cron = require('node-cron');
const twitterBot = require('../bots/twitterBot');
const logger = require('../utils/logger');

module.exports = function startCronJobs() {
  logger.info('[CRON] Canadian Spirit Social Media Manager starting...');

  // Fires every 15 minutes — tweets OR engages (likes/replies)
  cron.schedule('*/15 * * * *', async () => {
    logger.info('[CRON] Firing Twitter bot...');
    try {
      await twitterBot();
    } catch (err) {
      logger.error('[CRON] Twitter bot error:', err.message);
    }
  });

  logger.info('[CRON] Twitter bot scheduled every 15 minutes.');
};
