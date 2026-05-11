const axios = require('axios');
const crypto = require('crypto');
const OAuth = require('oauth-1.0a');
const logger = require('../utils/logger');
const { supabase } = require('../services/pgClient');
const { generateAutoContent, generateSmartReply, getRandomSearchQuery } = require('../utils/autoContent');

function makeOAuth(cred) {
  return OAuth({
    consumer: { key: cred.api_key, secret: cred.api_secret },
    signature_method: 'HMAC-SHA1',
    hash_function(base_string, key) {
      return crypto.createHmac('sha1', key).update(base_string).digest('base64');
    }
  });
}

async function apiCall(method, url, body, cred) {
  const oauth = makeOAuth(cred);
  const token = { key: cred.access_token, secret: cred.access_token_secret };
  const authHeader = oauth.toHeader(oauth.authorize({ url, method }, token));
  const config = { headers: { ...authHeader, 'Content-Type': 'application/json' } };
  if (method === 'GET') return axios.get(url, config);
  return axios.post(url, body, config);
}

async function getMyUserId(cred) {
  try {
    const resp = await apiCall('GET', 'https://api.twitter.com/2/users/me', null, cred);
    return resp.data?.data?.id;
  } catch (err) {
    logger.error(`[TwitterBot] Could not get user ID: ${err.message}`);
    return null;
  }
}

async function postTweet(text, cred) {
  const resp = await apiCall('POST', 'https://api.twitter.com/2/tweets', { text }, cred);
  return resp.data;
}

async function likeTweet(tweetId, userId, cred) {
  try {
    await apiCall('POST', `https://api.twitter.com/2/users/${userId}/likes`, { tweet_id: tweetId }, cred);
    logger.info(`[TwitterBot] Liked tweet ${tweetId}`);
  } catch (err) {
    logger.error(`[TwitterBot] Like failed: ${err.response?.data?.detail || err.message}`);
  }
}

async function replyToTweet(tweetId, text, cred) {
  try {
    await apiCall('POST', 'https://api.twitter.com/2/tweets', { text, reply: { in_reply_to_tweet_id: tweetId } }, cred);
    logger.info(`[TwitterBot] Replied to tweet ${tweetId}`);
  } catch (err) {
    logger.error(`[TwitterBot] Reply failed: ${err.response?.data?.detail || err.message}`);
  }
}

async function searchAndEngage(cred, myUserId) {
  try {
    const query = getRandomSearchQuery();
    logger.info(`[TwitterBot] Searching: ${query}`);
    const url = `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query + ' lang:en -is:retweet')}&max_results=10&tweet.fields=author_id,text`;
    const resp = await apiCall('GET', url, null, cred);
    const tweets = resp.data?.data || [];

    if (!tweets.length) {
      logger.info('[TwitterBot] No tweets found for query');
      return;
    }

    // Pick 2 random tweets to engage with
    const picked = tweets.sort(() => 0.5 - Math.random()).slice(0, 2);

    for (const tweet of picked) {
      if (tweet.author_id === myUserId) continue;

      // Like it
      await likeTweet(tweet.id, myUserId, cred);
      await new Promise(r => setTimeout(r, 2000));

      // Generate smart AI reply based on tweet content
      const reply = await generateSmartReply(tweet.text);
      await replyToTweet(tweet.id, reply, cred);
      await new Promise(r => setTimeout(r, 3000));

      logger.info(`[TwitterBot] Engaged with: "${tweet.text.slice(0, 60)}..."`);
    }
  } catch (err) {
    logger.error(`[TwitterBot] Search/engage failed: ${err.response?.data?.detail || err.message}`);
  }
}

async function logToSupabase(activity) {
  try {
    await supabase.from('engagements').insert([{
      platform: 'twitter', ...activity, created_at: new Date().toISOString()
    }]);
  } catch(e) {}
}

async function runTwitterBot(payload = {}) {
  logger.info('[TwitterBot] Starting');

  const cred = {
    api_key: process.env.TWITTER_API_KEY,
    api_secret: process.env.TWITTER_API_SECRET,
    access_token: process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  };

  if (!cred.api_key || !cred.access_token) {
    logger.error('[TwitterBot] Missing credentials');
    return;
  }

  const myUserId = await getMyUserId(cred);

  // Weighted actions — feels like a real active person
  const roll = Math.random();

  if (roll < 0.4) {
    // 40% — post a tweet
    try {
      const { data: posts } = await supabase
        .from('post_queue').select('*')
        .eq('platform', 'twitter').eq('status', 'pending')
        .order('priority', { ascending: false }).limit(1);

      let text;
      if (posts && posts.length > 0) {
        text = posts[0].caption;
        await supabase.from('post_queue')
          .update({ status: 'posted', last_attempt_at: new Date().toISOString() })
          .eq('id', posts[0].id);
      } else {
        const generated = await generateAutoContent('twitter');
        text = generated.caption;
      }

      const result = await postTweet(text, cred);
      logger.info(`[TwitterBot] Tweeted: ${text}`);
      await logToSupabase({ action: 'tweet', text, resp: result });

    } catch (err) {
      logger.error(`[TwitterBot] Tweet failed: ${err.response?.data?.detail || err.message}`);
    }

  } else {
    // 60% — search and engage (like + smart reply)
    logger.info('[TwitterBot] Engaging mode...');
    if (myUserId) await searchAndEngage(cred, myUserId);
  }

  logger.info('[TwitterBot] Done');
}

module.exports = runTwitterBot;
