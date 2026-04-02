const { Scraper } = require('@the-convocation/twitter-scraper');
const logger = require('./logger');

async function sendTweet(text) {
  try {
    const scraper = new Scraper();
    await scraper.login(
      process.env.TWITTER_USERNAME,
      process.env.TWITTER_PASSWORD
    );
    const loggedIn = await scraper.isLoggedIn();
    logger.info(`[ScraperTweet] Logged in: ${loggedIn}`);
    if (!loggedIn) throw new Error('Login failed');
    await scraper.sendTweet(text);
    logger.info(`[ScraperTweet] Tweeted: ${text}`);
    return true;
  } catch (err) {
    logger.error(`[ScraperTweet] Failed: ${err.message}`);
    return false;
  }
}

module.exports = { sendTweet };
