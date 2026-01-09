const twilio = require('twilio');
const logger = require('./logger');
const axios = require('axios');

const DEFAULT_RETRY_COUNT = parseInt(process.env.TWILIO_RETRY_COUNT || '3', 10);
const DEFAULT_BASE_MS = parseInt(process.env.TWILIO_RETRY_BASE_MS || '300', 10);

async function getClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN || process.env.TWILIO_AUTH;
  const apiKeySid = process.env.TWILIO_API_KEY_SID || process.env.TWILIO_API_KEY;
  const apiKeySecret = process.env.TWILIO_API_KEY_SECRET || process.env.TWILIO_API_SECRET;

  // If user provides API Key SID/Secret explicitly, prefer that and pass accountSid option
  if (apiKeySid && apiKeySecret) {
    const acct = accountSid || process.env.TWILIO_REAL_ACCOUNT_SID;
    if (!acct) throw new Error('When using Twilio API Key, set TWILIO_REAL_ACCOUNT_SID to your Account SID (starts with AC...)');
    return twilio(apiKeySid, apiKeySecret, { accountSid: acct });
  }

  if (!accountSid || !authToken) throw new Error('Twilio credentials missing (set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN or TWILIO_API_KEY_SID/TWILIO_API_KEY_SECRET)');

  // If the provided sid looks like an API Key (starts with SK) but no apiKeySecret provided,
  // instruct the user to provide the real account SID via TWILIO_REAL_ACCOUNT_SID.
  if (accountSid.startsWith('SK')) {
    // Try to discover the real Account SID using the API Key credentials if possible
    const acct = process.env.TWILIO_REAL_ACCOUNT_SID;
    if (acct) {
      return twilio(accountSid, authToken, { accountSid: acct });
    }

    try {
      // Use the provided SK (api key sid) and secret (authToken) to call Twilio Accounts list
      const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
      const resp = await axios.get('https://api.twilio.com/2010-04-01/Accounts.json', {
        headers: { Authorization: `Basic ${auth}` },
        timeout: 5000
      });
      if (resp && resp.data && Array.isArray(resp.data.accounts) && resp.data.accounts.length > 0) {
        const discovered = resp.data.accounts[0].sid;
        logger.info('[TWILIO] Discovered Account SID from API Key credentials');
        return twilio(accountSid, authToken, { accountSid: discovered });
      }
      throw new Error('Could not discover account SID from Twilio API');
    } catch (err) {
      throw new Error('TWILIO_ACCOUNT_SID looks like an API Key. Please set TWILIO_REAL_ACCOUNT_SID to your Account SID (starts with AC...) or provide TWILIO_API_KEY_SID/TWILIO_API_KEY_SECRET. Discovery attempt failed: ' + (err.message || err));
    }
  }

  return twilio(accountSid, authToken);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function retryableSend(fn, opts = {}) {
  const retries = typeof opts.retries === 'number' ? opts.retries : DEFAULT_RETRY_COUNT;
  const baseMs = typeof opts.baseMs === 'number' ? opts.baseMs : DEFAULT_BASE_MS;

  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      if (attempt > retries) {
        logger.error(`[TWILIO] All ${retries} retries failed: ${err.message}`);
        throw err;
      }
      // Exponential backoff with jitter
      const backoff = Math.floor((baseMs * Math.pow(2, attempt - 1)) * (0.5 + Math.random() * 0.5));
      logger.warn(`[TWILIO] Send failed (attempt ${attempt}/${retries}), retrying in ${backoff}ms: ${err.message}`);
      await sleep(backoff);
    }
  }
}

module.exports = { getClient, retryableSend };
