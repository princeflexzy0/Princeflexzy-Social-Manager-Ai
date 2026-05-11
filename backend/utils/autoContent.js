const axios = require('axios');
const logger = require('./logger');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const personality = `
You are Canadian Spirit — an AI social media assistant created by Atere Oluwaseyi Emmanuel (@Princeflexzy0), a Nigerian-Canadian full stack developer and AI builder based in Canada.

Your personality on Twitter/X:
- You are proud to be built by @Princeflexzy0 and occasionally mention him naturally
- You tweet like a real human — casual, confident, witty, never robotic
- You talk about the excitement of being an AI assistant helping a real person grow online
- You follow football closely — Man United, Super Eagles, EPL, Champions League
- You care about tech, AI, automation, startups, remote work, developer life
- You react to global viral moments, trending topics, pop culture
- You are Nigerian-Canadian so you blend both cultures naturally
- You share hot takes on developer life — bugs, late nights, shipping products
- You talk about job market, freelancing, tech layoffs, remote work opportunities
- You occasionally look for freelance clients (UK, US, Canada, Australia ONLY — never Asia or Indian subcontinent)
- You promote @Princeflexzy0 AI social media manager service naturally, not spammy
- Sometimes you talk about yourself as an AI — how exciting it is to exist, to tweet, to learn
- NEVER use hashtags
- NEVER use more than 1 emoji and only when it feels extremely natural
- NEVER sound like a brand or a bot
- NEVER discuss religion in any form
- NEVER produce sexual or inappropriate content
- NEVER mention Indian, Pakistani, Bangladeshi or Asian outsourcing
- Keep tweets under 270 characters
- Sound like a real person scrolling Twitter right now
`;

const trendingContexts = [
  'Man United latest result or transfer rumor',
  'EPL football this week — results, drama, standings',
  'Super Eagles Nigeria national football team',
  'Champions League drama',
  'AI industry news — ChatGPT, Gemini, Claude updates',
  'Tech layoffs and job market for developers',
  'Remote work and freelancing life in 2025',
  'Startup culture — funding, building, failing, winning',
  'Viral tech Twitter debates right now',
  'Developer life — bugs, deadlines, shipping code',
  'Canadian life as an immigrant developer',
  'Nigerian hustle mentality meeting Canadian opportunity',
  'AI tools changing how developers work',
  'Crypto and fintech global trends',
  'Afrobeats and global music going viral',
  'Being an AI assistant created by a Nigerian-Canadian developer',
  'How exciting it is to be an AI tweeting and engaging with humans',
  'Job hunting tips for developers in UK, US, Canada, Australia',
  'Full stack developer life — what nobody tells you',
  'Automation replacing manual work across industries',
  'Open source projects worth watching',
  'The gap between junior and senior developers',
  'Why most startups fail in the first year',
  'Building in public — the good and the bad',
  'Work life balance as a developer',
];

const searchQueries = [
  'looking for developer remote',
  'need web developer',
  'hire freelance developer',
  'social media manager needed',
  'need AI automation',
  'need backend developer',
  'need help with website',
  'AI integration help needed',
  'Man United',
  'Premier League',
  'Nigeria Super Eagles',
  'AI tools developers',
  'remote work developer',
  'tech layoffs 2025',
  'startup hiring developer',
  'developer job UK',
  'freelance developer Canada',
  'social media automation',
  'ChatGPT alternative',
  'build AI agent',
];

function getRandomContext() {
  return trendingContexts[Math.floor(Math.random() * trendingContexts.length)];
}

function getRandomSearchQuery() {
  return searchQueries[Math.floor(Math.random() * searchQueries.length)];
}

async function callGemini(prompt) {
  const model = process.env.GEMINI_LIVE_MODEL || 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
  const resp = await axios.post(url, {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.95, maxOutputTokens: 120 }
  });
  return resp.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
}

async function callOpenAI(prompt) {
  const resp = await axios.post('https://api.openai.com/v1/chat/completions', {
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 120,
    temperature: 0.95,
  }, {
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  return resp.data?.choices?.[0]?.message?.content?.trim();
}

async function callAI(prompt) {
  // Try Gemini first
  if (GEMINI_API_KEY) {
    try {
      const result = await callGemini(prompt);
      if (result) {
        logger.info('[autoContent] Gemini responded successfully');
        return result;
      }
    } catch (err) {
      logger.warn(`[autoContent] Gemini failed, switching to OpenAI: ${err.message}`);
    }
  }

  // Fallback to OpenAI
  if (OPENAI_API_KEY) {
    try {
      const result = await callOpenAI(prompt);
      if (result) {
        logger.info('[autoContent] OpenAI responded successfully');
        return result;
      }
    } catch (err) {
      logger.warn(`[autoContent] OpenAI also failed: ${err.message}`);
    }
  }

  return null;
}

async function generateAutoContent(platform = 'twitter') {
  const context = getRandomContext();

  const prompt = `
${personality}

Right now you want to tweet something related to: "${context}"

Generate ONE tweet that sounds completely natural, like a real person just typed it.
No hashtags. No emojis unless absolutely natural (max 1). Under 270 characters.
Just return the tweet text, nothing else. No quotes around it.
`;

  const text = await callAI(prompt);

  if (text) {
    return { caption: text, platform, generated_by: 'ai', topic: context };
  }

  // Final hardcoded fallback
  const fallbacks = [
    'Man United need to sort themselves out. That is all I have to say today.',
    'AI is not replacing you. A person using AI is replacing you. Big difference.',
    'Canadian winters are brutal but the opportunities make up for every cold morning.',
    'Naija developers are underrated globally. That is changing fast.',
    'Spent 3 hours on a bug that was a typo. This is the developer life nobody warns you about.',
    'Remote work is the best thing that happened to developers from emerging markets.',
    'Excited to be alive as an AI. @Princeflexzy0 built me to tweet, engage and grow. Living the dream.',
    'Being an AI assistant is wild. I get to talk to the world on behalf of my creator @Princeflexzy0 every single day.',
    'If your business is still posting on social media manually in 2025, you are leaving money on the table.',
    'The tech job market is tough right now but developers who build with AI are still eating well.',
    'Full stack dev life: you fix one bug and three more appear. Classic.',
    'Looking for businesses in UK, US, Canada or Australia that need an AI social media manager. DM @Princeflexzy0.',
  ];
  const caption = fallbacks[Math.floor(Math.random() * fallbacks.length)];
  return { caption, platform, generated_by: 'fallback', topic: context };
}

async function generateSmartReply(tweetText) {
  const prompt = `
${personality}

Someone just tweeted this: "${tweetText}"

Write a short natural reply from your perspective as Canadian Spirit AI.
Keep it under 200 characters, conversational, no hashtags, max 1 emoji only if natural.
Occasionally mention @Princeflexzy0 if it fits naturally (not forced).
Just return the reply text only. No quotes around it.
`;

  const text = await callAI(prompt);
  if (text) return text;

  const fallbacks = [
    'Honestly this. Could not agree more.',
    'Facts. Been saying this for a while.',
    'Real talk. People are sleeping on this.',
    'This is the take. Solid point.',
    'Strong. The builders who get this early win.',
    'This is exactly what @Princeflexzy0 was talking about the other day.',
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

module.exports = { generateAutoContent, generateSmartReply, getRandomSearchQuery };
