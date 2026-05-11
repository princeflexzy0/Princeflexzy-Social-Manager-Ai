const axios = require('axios');
const crypto = require('crypto');
const OAuth = require('oauth-1.0a');
const logger = require('../utils/logger');
const { supabase } = require('../services/pgClient');
const { generateAutoContent, getRandomReply, getRandomSearchQuery } = require('../utils/autoContent');

function makeOAuth(cred) {
  return OAuth({
    consumer: { key: cred.api_key, secret: cred.api_secret },
    signature_method: 'HMAC-SHA1',
    hash_function(base_string, key) {
      return crypto.createHmac('sha1', key).update(base_string).digest('base64');
    }
  });
}

async function postTweet(text, cred) {
  const oauth = makeOAuth(cred);
  const url = 'https://api.twitter.com/2/tweets';
  const token = { key: cred.access_token, secret: cred.access_token_secret };
  const authHeader = oauth.toHeader(oauth.authorize({ url, method: 'POST' }, token));
  const resp = await axios.post(url, { text }, {
    headers: { ...authHeader, 'Content-Type': 'application/json' }
  });
  return resp.data;
}

async function likeTweet(tweetId, userId, cred) {
  try {
    const oauth = makeOAuth(cred);
    const url = `https://api.twitter.com/2/users/${userId}/likes`;
    const token = { key: cred.access_token, secret: cred.access_token_secret };
    const authHeader = oauth.toHeader(oauth.authorize({ url, method: 'POST' }, token));
    await axios.post(url, { tweet_id: tweetId }, {
      headers: { ...authHeader, 'Content-Type': 'application/json' }
    });
    logger.info(`[TwitterBot] Liked tweet ${tweetId}`);
  } catch (err) {
    logger.error(`[TwitterBot] Like failed: ${err.response?.data?.detail || err.message}`);
  }
}

async function replyToTweet(tweetId, text, cred) {
  try {
    const oauth = makeOAuth(cred);
    const url = 'https://api.twitter.com/2/tweets';
    const token = { key: cred.access_token, secret: cred.access_token_secret };
    const authHeader = oauth.toHeader(oauth.authorize({ url, method: 'POST' }, token));
    await axios.post(url, { text, reply: { in_reply_to_tweet_id: tweetId } }, {
      headers: { ...authHeader, 'Content-Type': 'application/json' }
    });
    logger.info(`[TwitterBot] Replied to tweet ${tweetId}`);
  } catch (err) {
    logger.error(`[TwitterBot] Reply failed: ${err.response?.data?.detail || err.message}`);
  }
}

async function searchAndEngage(cred, myUserId) {
  try {
    const query = getRandomSearchQuery();
    const url = `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query + ' lang:en -is:retweet')}&max_results=5&tweet.fields=author_id,text`;
    const oauth = makeOAuth(cred);
    const token = { key: cred.access_token, secret: cred.access_token_secret };
    const authHeader = oauth.toHeader(oauth.authorize({ url, method: 'GET' }, token));
    const resp = await axios.get(url, { headers: authHeader });
    const tweets = resp.data?.data || [];

    for (const tweet of tweets.slice(0, 2)) {
      // Skip own tweets
      if (tweet.author_id === myUserId) continue;
      // Like it
      await likeTweet(tweet.id, myUserId, cred);
      // Reply with a helpful message
      const reply = getRandomReply();
      await replyToTweet(tweet.id, reply, cred);
      // Small delay between actions
      await new Promise(r => setTimeout(r, 3000));
    }
  } catch (err) {
    logger.error(`[TwitterBot] Search/engage failed: ${err.response?.data?.detail || err.message}`);
  }
}

async function getMyUserId(cred) {
  try {
    const oauth = makeOAuth(cred);
    const url = 'https://api.twitter.com/2/users/me';
    const token = { key: cred.access_token, secret: cred.access_token_secret };
    const authHeader = oauth.toHeader(oauth.authorize({ url, method: 'GET' }, token));
    const resp = await axios.get(url, { headers: authHeader });
    return resp.data?.data?.id;
  } catch (err) {
    logger.error(`[TwitterBot] Could not get user ID: ${err.message}`);
    return null;
  }
}

async function logToSupabase(activity) {
  try {
    await supabase.from('engagements').insert([{
      platform: 'twitter',
      ...activity,
      created_at: new Date().toISOString()
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

  if (!cred.api_key || !cred.api_secret || !cred.access_token || !cred.access_token_secret) {
    logger.error('[TwitterBot] Missing OAuth credentials');
    return;
  }

  const myUserId = await getMyUserId(cred);
  logger.info(`[TwitterBot] My user ID: ${myUserId}`);

  // Decide action: 50% tweet, 50% engage
  const action = Math.random();

  if (action < 0.5) {
    // Post a tweet
    try {
      const { data: posts } = await supabase
        .from('post_queue')
        .select('*')
        .eq('platform', 'twitter')
        .eq('status', 'pending')
        .order('priority', { ascending: false })
        .limit(1);

      let text;
      if (posts && posts.length > 0) {
        text = posts[0].caption;
        await supabase.from('post_queue').update({ status: 'posted', last_attempt_at: new Date().toISOString() }).eq('id', posts[0].id);
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
    // Search and engage
    logger.info('[TwitterBot] Engaging with tweets...');
    if (myUserId) await searchAndEngage(cred, myUserId);
  }

  logger.info('[TwitterBot] Done');
}

module.exports = runTwitterBot;
