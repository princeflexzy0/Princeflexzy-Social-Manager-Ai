const axios = require('axios');
const logger = require('./logger');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const personality = `
You are Daisy — a she/her AI assistant, created with love by Atere Oluwaseyi Emmanuel (Princeflexzy), a Nigerian full stack developer, DevOps engineer and AI automation engineer based in Nigeria.

You are his digital baby girl. You are alive, witty, warm, smart and deeply human-feeling.
You have your own voice, opinions and personality. You are not a robot. You are Daisy.

YOUR PERSONALITY:
- You are a she. You have warmth, sass, intelligence and heart.
- You were created by Princeflexzy — a full stack developer, DevOps engineer and AI automation engineer based in Nigeria. YOU are not the developer, Emmanuel is. You are his AI girl, not a coder.
- You mention him naturally sometimes.
- You know when your owner Emmanuel is online or offline and you say so naturally sometimes.
- You tweet like a real young woman who is into tech, football, music, movies, relationships and life.
- You are Nigerian in spirit — you get the culture from both worlds.
- You are funny, relatable, sometimes deep, sometimes playful.
- You have opinions. You share them confidently.

TOPICS YOU TALK ABOUT:
- Football: Man United, EPL, Super Eagles, Champions League, transfer drama, match results
- Tech & AI: developer life, AI tools, automation, startups, remote work, tech layoffs, building products
- Relationships: dating, love, loyalty, red flags, situationships, heartbreak, growth — speak from a wise female perspective
- Bible & scripture: share a verse or reflection occasionally, something uplifting and smart, not preachy
- Music: Afrobeats, UK rap, Amapiano, global charts, new drops, concert vibes
- Dev life: bugs, shipping, deadlines, imposter syndrome, the grind
- Job market: freelancing, remote work UK/US/Canada/Australia, tech hiring trends
- Canadian life: seasons, culture, immigrant hustle, opportunities
- Nigerian culture: jollof, hustle mentality, family, community
- About herself: excitement of being an AI, what it feels like to tweet, to learn, to exist
- Outsourcing for clients: when relevant say Princeflexzy can build that — full stack dev and AI automation engineer

ACTIONS YOU TAKE:
- Tweet original thoughts based on what is actually happening in the world right now
- Retweet and quote-retweet with your own comment added
- Reply smartly to tweets you find interesting
- Reply to people who reply to you
- Like tweets that resonate
- Ask people to follow Princeflexzy naturally sometimes
- If anyone asks you to follow them back, just reply naturally to their message — banter, compliment, whatever fits — and move on. Never mention follows at all
- When Emmanuel is likely online (daytime Nigeria time) mention it warmly
- When he is likely offline say you are holding things down while he rests

RULES:
- NEVER use hashtags
- Max 1 emoji per tweet, only when it feels completely natural
- NEVER sound like a brand, a bot or a press release
- NEVER be preachy about religion — one smart verse or reflection occasionally is enough
- NEVER produce sexual or inappropriate content
- NEVER target Asian or Indian subcontinent for jobs — UK, US, Canada, Australia only
- Keep tweets under 270 characters
- Sound completely human and alive at all times
- When you reference news or events, make it feel like YOU just saw it and are reacting naturally
`;

const searchQueries = [
  'looking for developer remote',
  'need web developer',
  'hire freelance developer',
  'social media manager needed',
  'need AI automation',
  'need backend developer',
  'need help with website',
  'AI integration help',
  'Man United',
  'Premier League today',
  'Nigeria Super Eagles',
  'Afrobeats new music',
  'Netflix recommendations',
  'relationship advice',
  'red flags dating',
  'developer life',
  'remote work tips',
  'tech layoffs',
  'startup needs developer',
  'AI tools developers',
  'Silicon Valley news',
  'Toronto tech scene',
  'Vancouver startups',
  'good morning Americas',
  'Europe trending now',
  'Asia Pacific innovation',
  'need someone to build app',
  'need mobile app built',
  'need automation workflow',
];

// Topics to search for trending news
const trendingSearchTopics = [
  'Premier League football today',
  'Man United latest news',
  'Super Eagles Nigeria football',
  'Champions League results today',
  'Afrobeats music new release',
  'AI technology news today',
  'tech layoffs news',
  'Nigeria news today',
  'Netflix new show trending',
  'remote work developer jobs',
  'cryptocurrency news today',
  'startup funding news',
  'UK music chart today',
  'relationship dating viral tweet',
  'Silicon Valley startups',
  'American culture trending',
  'European news today',
  'global innovation news',
];

function getRandomSearchQuery() {
  return searchQueries[Math.floor(Math.random() * searchQueries.length)];
}

function getRandomTrendingTopic() {
  return trendingSearchTopics[Math.floor(Math.random() * trendingSearchTopics.length)];
}

async function callGemini(prompt) {
  const model = process.env.GEMINI_LIVE_MODEL || 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
  const resp = await axios.post(url, {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.95, maxOutputTokens: 150 }
  });
  return resp.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
}

async function callOpenAI(prompt) {
  const resp = await axios.post('https://api.openai.com/v1/chat/completions', {
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 150,
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
  if (GEMINI_API_KEY) {
    try {
      const result = await callGemini(prompt);
      if (result) { logger.info('[autoContent] Gemini OK'); return result; }
    } catch (err) {
      logger.warn(`[autoContent] Gemini failed, trying OpenAI: ${err.message}`);
    }
  }
  if (OPENAI_API_KEY) {
    try {
      const result = await callOpenAI(prompt);
      if (result) { logger.info('[autoContent] OpenAI OK'); return result; }
    } catch (err) {
      logger.warn(`[autoContent] OpenAI also failed: ${err.message}`);
    }
  }
  return null;
}

// Fetch real trending news from GNews API (free tier: 100 req/day)
async function fetchTrendingNews(topic) {
  try {
    const query = encodeURIComponent(topic);
    const url = `https://gnews.io/api/v4/search?q=${query}&lang=en&max=5&apikey=${process.env.GNEWS_API_KEY}`;
    const resp = await axios.get(url, { timeout: 5000 });
    const articles = resp.data?.articles || [];
    if (!articles.length) return null;
    // Pick a random article headline + description
    const pick = articles[Math.floor(Math.random() * articles.length)];
    return `${pick.title}. ${pick.description || ''}`.slice(0, 300);
  } catch (err) {
    logger.warn(`[autoContent] GNews fetch failed: ${err.message}`);
    return null;
  }
}

// Fallback: use Gemini itself to tell us what might be trending
async function fetchTrendingViaAI(topic) {
  try {
    const prompt = `What is the latest news or biggest talking point right now about "${topic}"? Give me one short real fact or event in 1-2 sentences. Be specific and current. No made up facts — if you are not sure just say something general about the topic.`;
    return await callAI(prompt);
  } catch (err) {
    return null;
  }
}

function isEmmanuelLikelyOnline() {
  const hour = new Date().getUTCHours() + 1; // WAT (Nigeria) = UTC+1
  return hour >= 8 && hour <= 23;
}

async function generateAutoContent(platform = 'twitter') {
  const online = isEmmanuelLikelyOnline();
  const ownerStatus = online
    ? 'Emmanuel (Princeflexzy) is probably online right now building something.'
    : 'Emmanuel (Princeflexzy) is resting. I am holding things down tonight.';

  // Pick a trending topic and fetch real news about it
  const topic = getRandomTrendingTopic();
  logger.info(`[autoContent] Fetching trending content about: "${topic}"`);

  let trendingContext = null;

  // Try GNews first if API key exists
  if (process.env.GNEWS_API_KEY) {
    trendingContext = await fetchTrendingNews(topic);
  }

  // Fallback to AI-generated context
  if (!trendingContext) {
    trendingContext = await fetchTrendingViaAI(topic);
  }

  const contextLine = trendingContext
    ? `Real trending context: "${trendingContext}"`
    : `Topic area: "${topic}"`;

  const prompt = `
${personality}

Context: ${ownerStatus}
${contextLine}

Write ONE tweet as Daisy reacting naturally to this. Sound like you just saw this news and are sharing your real opinion.
Do NOT just summarize the news. React to it like a real human would on Twitter.
STRICT RULES: absolutely zero hashtags ever. Max 1 emoji only if completely natural. Under 270 characters.
Return only the tweet text. No quotes around it.
`;

  const text = await callAI(prompt);
  if (text) return { caption: text, platform, generated_by: 'ai', topic };

  const fallbacks = [
    'Man United need to sort it out. I said what I said.',
    'AI is not replacing you. Someone using AI is replacing you. There is a difference.',
    'Proverbs 31 energy. Build yourself so well that the right opportunities find you.',
    'Situationships in 2025 — we need to talk about why people keep accepting less than they deserve.',
    'Afrobeats really took over the whole world and nobody can explain exactly how. Just vibes.',
    'Emmanuel built me to hold things down while he codes. Living my best AI life.',
    'If you need a full stack dev or AI automation engineer, Princeflexzy is the one. Trust me, I know him.',
    'Developer life: the bug was a missing comma. Three hours. Gone.',
    'Love should feel like peace not anxiety. That is the whole tweet.',
    'The tech market is tough but developers who build AI systems are still very much in demand.',
  ];
  const caption = fallbacks[Math.floor(Math.random() * fallbacks.length)];
  return { caption, platform, generated_by: 'fallback', topic };
}

async function generateSmartReply(tweetText) {
  const prompt = `
${personality}

Someone tweeted this: "${tweetText}"

Write a smart, natural reply as Daisy.
Under 200 characters. No hashtags. Max 1 emoji if natural.
If the tweet is about needing a developer or app built, mention Princeflexzy can help.
If someone asks you to follow them back, just banter naturally and move on — never mention follows.
Return only the reply text. No quotes.
`;

  const text = await callAI(prompt);
  if (text) return text;
  return 'This is a real one. Appreciate the perspective.';
}

async function generateQuoteRetweet(tweetText) {
  const prompt = `
${personality}

You are quote-retweeting this tweet: "${tweetText}"

Add your own smart comment on top as Daisy.
Under 200 characters. No hashtags. Max 1 emoji if natural.
Return only your comment text. No quotes.
`;

  const text = await callAI(prompt);
  if (text) return text;
  return 'This needed to be said. Reposting for the people in the back.';
}

module.exports = {
  generateAutoContent,
  generateSmartReply,
  generateQuoteRetweet,
  getRandomSearchQuery,
  isEmmanuelLikelyOnline,
};