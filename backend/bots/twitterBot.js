const axios = require('axios');
const crypto = require('crypto');
const OAuth = require('oauth-1.0a');
const logger = require('../utils/logger');
const { supabase } = require('../services/pgClient');
const {
  generateAutoContent,
  generateSmartReply,
  generateQuoteRetweet,
  getRandomSearchQuery,
} = require('../utils/autoContent');

let oauth2AccessToken = process.env.TWITTER_OAUTH2_ACCESS_TOKEN;

async function refreshOAuth2Token() {
  try {
    const clientId = process.env.TWITTER_CLIENT_ID;
    const clientSecret = process.env.TWITTER_CLIENT_SECRET;
    const refreshToken = process.env.TWITTER_OAUTH2_REFRESH_TOKEN;
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const resp = await axios.post('https://api.twitter.com/2/oauth2/token',
      new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken, client_id: clientId }).toString(),
      { headers: { 'Authorization': `Basic ${basicAuth}`, 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    oauth2AccessToken = resp.data.access_token;
    logger.info('[TwitterBot] OAuth2 token refreshed');
    return oauth2AccessToken;
  } catch (err) {
    logger.error(`[TwitterBot] Token refresh failed: ${err.message}`);
    return null;
  }
}

async function apiCallOAuth2(method, url, body) {
  const headers = { 'Authorization': `Bearer ${oauth2AccessToken}`, 'Content-Type': 'application/json' };
  try {
    if (method === 'GET') return await axios.get(url, { headers });
    return await axios.post(url, body, { headers });
  } catch (err) {
    if (err.response?.status === 401) {
      logger.warn('[TwitterBot] OAuth2 token expired, refreshing...');
      await refreshOAuth2Token();
      const newHeaders = { 'Authorization': `Bearer ${oauth2AccessToken}`, 'Content-Type': 'application/json' };
      if (method === 'GET') return await axios.get(url, { headers: newHeaders });
      return await axios.post(url, body, { headers: newHeaders });
    }
    throw err;
  }
}

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

async function replyToTweet(tweetId, text, cred) {
  try {
    await apiCall('POST', 'https://api.twitter.com/2/tweets', {
      text,
      reply: { in_reply_to_tweet_id: tweetId }
    }, cred);
    logger.info(`[TwitterBot] Replied to ${tweetId}`);
  } catch (err) {
    logger.error(`[TwitterBot] Reply failed: ${err.response?.data?.detail || err.message}`);
  }
}

async function quoteTweet(tweetId, comment, cred) {
  try {
    await apiCall('POST', 'https://api.twitter.com/2/tweets', {
      text: comment,
      quote_tweet_id: tweetId
    }, cred);
    logger.info(`[TwitterBot] Quote tweeted ${tweetId}`);
  } catch (err) {
    logger.error(`[TwitterBot] Quote tweet failed: ${err.response?.data?.detail || err.message}`);
    throw err;
  }
}

async function searchAndEngage(cred, myUserId) {
  try {
    const query = getRandomSearchQuery();
    logger.info(`[TwitterBot] Searching: "${query}"`);
    const url = `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query + ' lang:en -is:retweet -is:nullcast')}&max_results=15&tweet.fields=author_id,text,public_metrics,reply_settings&expansions=author_id&user.fields=verified,verified_type`;
    const resp = await apiCall('GET', url, null, cred);
    const tweets = resp.data?.data || [];
    if (!tweets.length) { logger.info('[TwitterBot] No tweets found'); return; }
    const openTweets = tweets.filter(t => t.author_id !== myUserId && (t.reply_settings === 'everyone' || !t.reply_settings));
    if (!openTweets.length) { logger.info('[TwitterBot] No open tweets found'); return; }
    const target = openTweets[Math.floor(Math.random() * openTweets.length)];
    if (!target) return;
    const roll = Math.random();
    if (roll < 0.5) {
      const reply = await generateSmartReply(target.text);
      await replyToTweet(target.id, reply, cred);
      logger.info(`[TwitterBot] Smart replied: "${reply}"`);
    } else {
      try {
        const comment = await generateQuoteRetweet(target.text);
        await quoteTweet(target.id, comment, cred);
        logger.info(`[TwitterBot] Quote tweeted: "${comment}"`);
      } catch (qErr) {
        logger.warn('[TwitterBot] Quote blocked, falling back to reply');
        const reply = await generateSmartReply(target.text);
        await replyToTweet(target.id, reply, cred);
        logger.info(`[TwitterBot] Fallback replied: "${reply}"`);
      }
    }
  } catch (err) {
    logger.error(`[TwitterBot] Engage failed: ${err.response?.data?.detail || err.message}`);
  }
}

async function runTwitterBot(payload = {}) {
  logger.info('[TwitterBot] Canadian Spirit waking up...');
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
  const roll = Math.random();
  if (roll < 1.00) {
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
    } catch (err) {
      logger.error(`[TwitterBot] Tweet failed: ${err.response?.data?.detail || err.message}`);
    }
  } else {
    logger.info('[TwitterBot] Engaging mode...');
    if (myUserId) await searchAndEngage(cred, myUserId);
  }
  logger.info('[TwitterBot] Canadian Spirit done for this cycle.');
}

module.exports = runTwitterBot;
