/**
 * Canadian Spirit Social Media Manager
 * Auto-generates Emmanuel's personal content for Twitter/X
 * - No hashtags
 * - No porn/inappropriate content
 * - Job bidding (UK, US, Canada, Australia only)
 * - Client hunting for social media AI manager
 * - Personal voice: Nigerian-Canadian dev
 */

const tweetTopics = [
  // Tech & AI
  'Just shipped something wild with AI automation — the future is already here and most people are sleeping on it',
  'Full stack dev life: fixing a bug at 2am only to realize it was a missing semicolon. Classic.',
  'AI tools are replacing junior devs who refuse to learn AI tools. Adapt or get left behind.',
  'Built an entire backend in 3 hours with the right stack. DevOps is the cheat code nobody talks about enough.',
  'Docker, Kubernetes, CI/CD — not just buzzwords. These separate a hobby project from a production system.',
  'Blockchain is still underrated for escrow and trustless payment systems. Too much hype, not enough builders.',
  'The developers eating in the next 5 years are the ones building with AI, not fighting against it.',
  'Remote work from Canada, clients across 3 continents. The internet really changed everything.',
  'Hot take: most startups do not need a $50k/month AWS bill. Proper DevOps cuts that by 80%.',
  'Everyone talking about AI taking jobs. I am busy using AI to take on more clients. Perspective matters.',

  // Nigerian-Canadian life
  'Nigerian-Canadian life hits different. You get jollof rice AND poutine. Cannot complain.',
  'Canada is cold but the opportunities are warm. Worth every winter.',
  'Naija people will debug code for 6 hours before Googling the error. We do not give up easily.',
  'The tech ecosystem in Nigeria is growing fast. Give it 5 years and people will be shocked.',

  // Football
  'Nigeria vs anybody — always nervous, always optimistic. That is the Super Eagles effect.',
  'EPL weekend is therapy. Nothing clears my head like 90 minutes of football.',

  // Engagement
  'Drop your biggest tech project below. Want to see what the community is building.',
  'What one tool completely changed how you work? Mine was n8n for automation.',
  'What is the most underrated programming language right now? I will start: Go.',
  'Be honest — how many browser tabs do you have open right now?',
  'Name a tech skill that will still be relevant in 10 years. I will go first: systems thinking.',

  // Job bidding - UK, US, Canada, Australia only
  'Looking for a full stack developer who actually ships? I build AI-powered web apps, automation systems and APIs. Based in Canada, working with UK, US and Australian teams. DM me.',
  'If your startup needs a backend that scales, automated workflows, or an AI integration — I am available for new projects. Canada based, open to UK, US, Australia remote contracts.',
  'Actively taking on new clients for Q2. Full stack development, AI automation, social media systems. I work with businesses in Canada, UK, US and Australia. DM if interested.',
  'Not just a developer — I build systems that run themselves. AI agents, automation pipelines, smart bots. Open to contracts from UK, US, Canada and Australian companies.',

  // Client hunting - Social Media AI Manager
  'Is your business still posting manually on social media in 2025? I build AI social media managers that post, engage and grow your audience on autopilot. Let us talk.',
  'Your competitors are already using AI to manage their social media. Are you? I build custom AI social media agents for businesses. DM me to find out more.',
  'Any business owner tired of spending hours on social media content? I built an AI system that handles it all — posting, engagement, growth. Open to new clients.',
  'If you run a business and social media feels like a full time job, that is because it is — unless you automate it. I build the automation. DM me.',
  'Looking for businesses in Canada, UK, US or Australia that need an AI social media manager. I build and run the whole system for you. Interested? Let us talk.',
];

const replyTemplates = [
  'Honestly agree with this. Seen it firsthand building production systems.',
  'This is underrated. More people need to hear it.',
  'Facts. The people sleeping on this will regret it in 2 years.',
  'Exactly this. Been saying the same thing for months.',
  'Strong take. I would add that the real unlock is combining this with automation.',
  'This hits. Especially for developers who are still doing everything manually.',
  '100 percent. The builders who get this early will have a massive advantage.',
  'Real talk. Most people overcomplicate this when the simple approach works fine.',
  'Solid point. The tools exist, people just need to commit to learning them.',
  'This is why I keep saying systems thinking is the most underrated dev skill.',
];

const searchQueries = [
  'looking for developer',
  'need web developer',
  'hire developer remote',
  'social media manager needed',
  'need AI automation',
  'looking for freelance developer',
  'startup needs developer',
  'need backend developer',
  'social media help needed',
  'AI integration help',
];

function getRandomTopic() {
  return tweetTopics[Math.floor(Math.random() * tweetTopics.length)];
}

function getRandomReply() {
  return replyTemplates[Math.floor(Math.random() * replyTemplates.length)];
}

function getRandomSearchQuery() {
  return searchQueries[Math.floor(Math.random() * searchQueries.length)];
}

async function generateAutoContent(platform = 'twitter') {
  const topic = getRandomTopic();
  return {
    caption: topic,
    platform,
    generated_by: 'canadian-spirit-ai',
    topic,
  };
}

module.exports = { generateAutoContent, getRandomTopic, getRandomReply, getRandomSearchQuery, tweetTopics };
