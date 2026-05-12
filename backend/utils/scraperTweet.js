const { Scraper } = require('@treasure-dev/twitter-scraper');
const logger = require('./logger');

let scraper = null;

async function getScraperClient() {
  if (scraper && await scraper.isLoggedIn()) {
    return scraper;
  }
  scraper = new Scraper();
  await scraper.login(
    process.env.TWITTER_USERNAME,
    process.env.TWITTER_PASSWORD,
    process.env.TWITTER_EMAIL
  );
  logger.info('[ScraperTweet] Logged in successfully');
  return scraper;
}

async function sendTweet(text) {
  try {
    const client = await getScraperClient();
    await client.sendTweet(text);
    logger.info(`[ScraperTweet] Tweeted: ${text}`);
    return true;
  } catch (err) {
    logger.error(`[ScraperTweet] Failed: ${err.message}`);
    return false;
  }
}

module.exports = { sendTweet };
