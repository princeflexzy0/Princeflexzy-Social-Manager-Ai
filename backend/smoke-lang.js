const { translateText } = require('../utils/translate');
const { generateTranscript, generateGeoAware } = require('../services/aiService');

(async () => {
  console.log('Smoke test: translation, transcript, geo-aware');

  const text = 'Hello world';
  const translated = await translateText(text, 'es');
  console.log('Translated to es:', translated);

  const content = 'This is a sample content about watching the sunset at the beach. It includes details about colors, feelings, and the environment.';
  const transcript = await generateTranscript(content, 'en');
  console.log('Transcript (en):', transcript);

  const geo = generateGeoAware('IN', ['en', 'es', 'hi']);
  console.log('Geo-aware (IN):', geo);

})();