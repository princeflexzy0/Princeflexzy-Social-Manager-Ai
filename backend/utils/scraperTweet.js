const { Scraper } = require('@treasure-dev/twitter-scraper');
const logger = require('./logger');

let scraper = null;

async function getScraperClient() {
  if (scraper) {
    const loggedIn = await scraper.isLoggedIn();
    if (loggedIn) return scraper;
  }
  scraper = new Scraper();
  await scraper.login(
    process.env.TWITTER_USERNAME,
    process.env.TWITTER_PASSWORD,
    process.env.TWITTER_EMAIL,
    process.env.TWITTER_API_KEY,
    process.env.TWITTER_API_SECRET,
    process.env.TWITTER_ACCESS_TOKEN,
    process.env.TWITTER_ACCESS_TOKEN_SECRET
  );
  const loggedIn = await scraper.isLoggedIn();
  logger.info(`[ScraperTweet] Login status: ${loggedIn}`);
  return scraper;
}

async function sendTweet(text) {
  try {
    const client = await getScraperClient();
    const result = await client.sendTweet(text);
    logger.info(`[ScraperTweet] Tweeted: ${text}`);
    return true;
  } catch (err) {
    logger.error(`[ScraperTweet] Failed: ${err.message}`);
    return false;
  }
}

module.exports = { sendTweet };
