/**
 * Canadian Spirit Social Media Manager
 * Auto-generates Emmanuel's personal content for Twitter/X
 */

const topics = [
  // Tech & AI
  'Just shipped something wild with AI automation — the future is already here and most people are sleeping on it',
  'Full stack dev life: fixing a bug at 2am only to realize the bug was a missing semicolon. Classic.',
  'AI tools are replacing junior devs who refuse to learn AI tools. Adapt or get left behind.',
  'Built an entire backend in 3 hours with the right stack. DevOps is the cheat code nobody talks about enough.',
  'Docker, Kubernetes, CI/CD — not just buzzwords. These are what separate a hobby project from a production system.',
  'Blockchain is still underrated for escrow and trustless payment systems. People focus too much on the hype.',
  
  // Nigeria & Canada life
  'Nigerian-Canadian life hits different. You get jollof rice AND poutine. Cannot complain.',
  'Canada is cold but the opportunities are warm. Worth it.',
  'Naija people will debug code for 6 hours before they Google the error. We do not give up easily.',
  'The tech ecosystem in Nigeria is growing fast. Give it 5 years and people will be shocked.',
  
  // Football
  'Nigeria vs anybody — I am always nervous and always optimistic at the same time. That is the Super Eagles effect.',
  'EPL weekend is therapy. Nothing clears my head like 90 minutes of football.',
  
  // Economy & life
  'Everyone is talking about AI taking jobs. I am busy using AI to take on more clients. Perspective matters.',
  'The developers who will eat in the next 5 years are the ones building with AI, not fighting against it.',
  'Remote work from Canada, clients across 3 continents. The internet really changed everything.',
  
  // Viral/engagement
  'Drop your biggest tech project below. I want to see what the community is building.',
  'What is one tool that completely changed how you work? Mine was n8n for automation.',
  'Hot take: most startups do not need a $50k/month AWS bill. Proper DevOps cuts that by 80%.',
];

function getRandomTopic() {
  return topics[Math.floor(Math.random() * topics.length)];
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

module.exports = { generateAutoContent, topics, getRandomTopic };
