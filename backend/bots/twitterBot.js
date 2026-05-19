const { sendToZapier } = require("../utils/zapierTweet");
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
    logger.info(`[TwitterBot] Liked ${tweetId}`);
  } catch (err) {
    logger.error(`[TwitterBot] Like failed: ${err.response?.data?.detail || err.message}`);
  }
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
  }
}

async function searchAndEngage(cred, myUserId) {
  try {
    const query = getRandomSearchQuery();
    logger.info(`[TwitterBot] Searching: "${query}"`);

    const url = `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query + ' lang:en -is:retweet -is:nullcast')}&max_results=15&tweet.fields=author_id,text,public_metrics&expansions=author_id&user.fields=verified,verified_type`;
    const resp = await apiCall('GET', url, null, cred);
    const tweets = resp.data?.data || [];

    if (!tweets.length) { logger.info('[TwitterBot] No tweets found'); return; }

    const users = resp.data?.includes?.users || [];
    const verifiedUsers = new Set(users.filter(u => u.verified || u.verified_type).map(u => u.id));
    const verifiedTweets = tweets.filter(t => verifiedUsers.has(t.author_id));
    if (!verifiedTweets.length) { logger.info("[TwitterBot] No verified tweets found"); return; }
    const picked = verifiedTweets.sort(() => 0.5 - Math.random()).slice(0, 3);

    for (const tweet of picked) {
      if (tweet.author_id === myUserId) continue;

      const roll = Math.random(); // Always tweet for now — search needs paid API

      // Like every tweet we engage with
      await likeTweet(tweet.id, myUserId, cred);
      await new Promise(r => setTimeout(r, 2000));

      if (roll < 0.5) {
        // Reply smartly
        const reply = await generateSmartReply(tweet.text);
        await replyToTweet(tweet.id, reply, cred);
        logger.info(`[TwitterBot] Smart replied: "${reply}"`);
      } else {
        // Quote retweet with comment — fallback to reply if blocked
        try {
          const comment = await generateQuoteRetweet(tweet.text);
          await quoteTweet(tweet.id, comment, cred);
          logger.info(`[TwitterBot] Quote tweeted: "${comment}"`);
        } catch (qErr) {
          logger.warn(`[TwitterBot] Quote blocked, falling back to reply`);
          const reply = await generateSmartReply(tweet.text);
          await replyToTweet(tweet.id, reply, cred);
          logger.info(`[TwitterBot] Fallback replied: "${reply}"`);
        }
      }

      await new Promise(r => setTimeout(r, 4000));
    }
  } catch (err) {
    logger.error(`[TwitterBot] Engage failed: ${err.response?.data?.detail || err.message}`);
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

  // Weighted action mix — feels like a real active person
  const roll = Math.random(); // Always tweet for now — search needs paid API

  if (roll < 0.35) {
    // 35% — post original tweet
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
    // 65% — search, like, reply or quote retweet
    logger.info('[TwitterBot] Engaging mode...');
    if (myUserId) await searchAndEngage(cred, myUserId);
  }

  logger.info('[TwitterBot] Canadian Spirit done for this cycle.');
}

module.exports = runTwitterBot;
