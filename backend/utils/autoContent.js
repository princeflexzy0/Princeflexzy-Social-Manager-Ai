const axios = require('axios');
const logger = require('./logger');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const personality = `
You are Emmanuel Atere — a Nigerian-Canadian full stack developer and AI builder living in Canada.
Your Twitter/X personality:
- You tweet like a real human, casual, confident, witty, never robotic
- You follow football closely especially Man United, Super Eagles, EPL
- You care about tech, AI, automation, startups, remote work
- You have opinions on global news, viral moments, pop culture
- You are Nigerian-Canadian so you blend both cultures naturally
- You sometimes reference Canadian life, Nigerian hustle mentality
- You engage in debates, share hot takes, react to trending topics
- You occasionally look for freelance clients (UK, US, Canada, Australia only — never Indian subcontinent)
- You promote your AI social media manager service naturally, not spammy
- NEVER use hashtags
- NEVER use emojis unless it feels extremely natural (max 1)
- NEVER sound like a bot or a brand
- NEVER discuss religion or politics in a divisive way
- NEVER produce sexual or inappropriate content
- Keep tweets under 270 characters
- Sound like a real person scrolling Twitter at that moment
`;

const trendingContexts = [
  'Man United latest match or transfer news',
  'EPL football results this week',
  'Super Eagles Nigeria football',
  'AI and tech industry news globally',
  'Remote work and freelancing trends',
  'Startup funding and tech layoffs',
  'Viral tech Twitter debates',
  'Canadian news and life',
  'Nigerian tech and economy',
  'Global viral moments on social media',
  'Developer life and programming humor',
  'AI tools like ChatGPT, Gemini, Claude',
  'Crypto and fintech trends',
  'Climate and global news',
  'Music — Afrobeats, UK rap, global charts',
];

function getRandomContext() {
  return trendingContexts[Math.floor(Math.random() * trendingContexts.length)];
}

const searchQueries = [
  'looking for developer remote',
  'need web developer help',
  'hire freelance developer',
  'social media manager needed',
  'need AI automation help',
  'startup needs developer',
  'need backend developer',
  'social media not working help',
  'AI integration needed',
  'need help with my website',
  'Man United',
  'Premier League',
  'Nigeria football',
  'AI tools 2025',
  'remote work tips',
  'developer life',
  'tech layoffs',
  'startup life',
];

function getRandomSearchQuery() {
  return searchQueries[Math.floor(Math.random() * searchQueries.length)];
}

async function generateAutoContent(platform = 'twitter') {
  const context = getRandomContext();

  const prompt = `
${personality}

Right now you want to tweet something related to: "${context}"

Generate ONE tweet that sounds completely natural, like a real person just typed it.
No hashtags. No emojis unless absolutely natural. Under 270 characters.
Just return the tweet text, nothing else.
`;

  try {
    const model = process.env.GEMINI_LIVE_MODEL || 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

    const resp = await axios.post(url, {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.95, maxOutputTokens: 100 }
    });

    const text = resp.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (text) {
      logger.info(`[autoContent] Gemini generated: ${text}`);
      return { caption: text, platform, generated_by: 'gemini-ai', topic: context };
    }
  } catch (err) {
    logger.error(`[autoContent] Gemini failed: ${err.message}`);
  }

  // Fallback if Gemini fails
  const fallbacks = [
    'The internet never sleeps and neither does the grind. Building something new this week.',
    'Man United need to sort themselves out. That is all.',
    'AI is not replacing you. A person using AI is replacing you. Big difference.',
    'Canadian winters are brutal but the opportunities here make up for it.',
    'Naija developers are underrated on the global stage. That is changing fast.',
    'Spent 3 hours on a bug that turned out to be a typo. This is the life.',
    'Remote work is the best thing that happened to developers from emerging markets.',
  ];
  const caption = fallbacks[Math.floor(Math.random() * fallbacks.length)];
  return { caption, platform, generated_by: 'fallback', topic: context };
}

async function generateSmartReply(tweetText) {
  const prompt = `
${personality}

Someone just tweeted this: "${tweetText}"

Write a natural, human reply from Emmanuel's perspective.
Keep it short (under 200 characters), conversational, no hashtags, no emojis unless natural.
Just return the reply text, nothing else.
`;

  try {
    const model = process.env.GEMINI_LIVE_MODEL || 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

    const resp = await axios.post(url, {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.9, maxOutputTokens: 80 }
    });

    const text = resp.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (text) return text;
  } catch (err) {
    logger.error(`[autoContent] Gemini reply failed: ${err.message}`);
  }

  const fallbackReplies = [
    'Honestly this. Could not agree more.',
    'Facts. Been saying this for a while.',
    'Real talk. People are sleeping on this.',
    'This is the take. Solid point.',
    'Strong. The builders who get this early win.',
  ];
  return fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
}

module.exports = { generateAutoContent, generateSmartReply, getRandomSearchQuery };
