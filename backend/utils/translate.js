const { openai } = require('../services/openaiClient');
const logger = require('./logger');
const retry = require('./retry');

const supportedLangs = process.env.SUPPORTED_LANGS?.split(',') || ['en', 'es', 'hi'];

/**
 * Translates text to target language using OpenAI with tone preservation
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code (en, es, hi)
 * @param {string} sourceLang - Source language code (defaults to 'en')
 * @returns {Promise<string>} - Translated text or original on error
 */
async function translateText(text, targetLang, sourceLang = 'en') {
  try {
    // Return original if same language or unsupported
    if (targetLang === sourceLang || !supportedLangs.includes(targetLang)) {
      return text;
    }

    // Map language codes to full names for better context
    const langMap = {
      en: 'English',
      es: 'Spanish',
      hi: 'Hindi'
    };

    const prompt = `Translate the following text from ${langMap[sourceLang]} to ${langMap[targetLang]}, preserving tone, style, and formatting:

${text}

Translation:`;

    const completion = await retry(() => openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3, // Lower temperature for more accurate translations
      max_tokens: Math.min(text.length * 2, 2000), // Dynamic token limit based on input
      n: 1,
      presence_penalty: 0
    }), 2, 150);

    const translation = completion?.choices?.[0]?.message?.content?.trim();
    if (!translation) {
      logger.warn('Empty translation result', { text, targetLang, sourceLang });
      return text;
    }

    return translation;

  } catch (error) {
    logger.error('Translation failed', { 
      error: error.message,
      text: text.substring(0, 100) + '...',
      targetLang,
      sourceLang 
    });
    return text; // Fallback to original text on error
  }
}

/**
 * Batch translate text to multiple languages in parallel
 * @param {string} text - Text to translate
 * @param {string[]} targetLangs - Array of target language codes
 * @param {string} sourceLang - Source language code
 * @returns {Promise<Object>} - Object with translations keyed by language code
 */
async function batchTranslate(text, targetLangs = supportedLangs, sourceLang = 'en') {
  try {
    const result = {};
    await Promise.all(targetLangs.map(async lang => {
      try {
        const translated = await translateText(text, lang, sourceLang);
        result[lang] = translated;
      } catch (err) {
        logger.error('Translation failed for language', { lang, err: err.message });
        // fallback to original text for this language
        result[lang] = text;
      }
    }));

    return result;

  } catch (error) {
    logger.error('Batch translation failed', { error: error.message });
    // Return object with original text for all languages on error
    return targetLangs.reduce((acc, lang) => {
      acc[lang] = text;
      return acc;
    }, {});
  }
}

module.exports = {
  translateText,
  batchTranslate,
  supportedLangs
};