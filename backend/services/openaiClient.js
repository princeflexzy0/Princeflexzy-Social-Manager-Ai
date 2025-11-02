const OpenAI = require('openai');

let openai;

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
} else {
  // Export a mock openai client with the methods our code expects
  console.warn('[OpenAI] OPENAI_API_KEY not set. Exporting mock OpenAI client.');

  const sampleChatChoices = [{ message: { content: 'Generated content' } }];

  openai = {
    createCompletion: async (opts) => ({ data: { choices: [{ text: 'Hola mundo' }] } }),
    // chat.completions.create pattern used in aiService — return both shapes (.choices and .data.choices)
    chat: {
      completions: {
        create: async (opts) => ({ choices: sampleChatChoices, data: { choices: sampleChatChoices } })
      }
    }
  };
}

module.exports = { openai };
