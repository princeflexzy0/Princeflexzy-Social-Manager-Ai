const cron = require('node-cron');
const twitterBot = require('../bots/twitterBot');
const logger = require('../utils/logger');

// Canadian Spirit Social Media Manager
// Only X (Twitter) is active. All other bots are paused.
// Tweets fire on a randomized human-feeling schedule.

function getRandomMinutes() {
  // Pick 6 random minutes spread across the hour to feel natural
  const mins = new Set();
  while (mins.size < 6) {
    mins.add(Math.floor(Math.random() * 60));
  }
  return Array.from(mins).sort((a, b) => a - b).join(',');
}

module.exports = function startCronJobs() {
  const mins = getRandomMinutes();
  logger.info(`[CRON] Canadian Spirit Social Media Manager starting...`);
  logger.info(`[CRON] Twitter bot will fire at minutes: ${mins}`);

  // Twitter fires ~6 times per hour at randomized minutes
  cron.schedule(`${mins} * * * *`, async () => {
    logger.info('[CRON] Firing Twitter bot...');
    try {
      await twitterBot();
    } catch (err) {
      logger.error('[CRON] Twitter bot error:', err.message);
    }
  });

  // ---- ALL OTHER BOTS PAUSED ----
  // instagramBot  — paused
  // facebookBot   — paused
  // redditBot     — paused
  // telegramBot   — paused
  // tiktokBot     — paused
  // pinterestBot  — paused
  // gmbBot        — paused

  logger.info('[CRON] All bots scheduled. Only Twitter/X is active.');
};
