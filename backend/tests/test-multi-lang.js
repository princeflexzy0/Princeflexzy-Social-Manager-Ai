const { generateCaption, generateBlogContent } = require('../services/aiService');
const { translateText, batchTranslate } = require('../utils/translate');

// Mock dependencies
jest.mock('../services/supabaseClient', () => {
  return {
    supabase: {
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              limit: jest.fn(() => ({
                maybeSingle: jest.fn(() => ({ data: null }))
              }))
            }))
          }))
        }))
      })),
      rpc: jest.fn()
    }
  };
});

jest.mock('../services/openaiClient', () => ({
  openai: {
    createCompletion: jest.fn(() => Promise.resolve({
      data: {
        choices: [{ text: 'Hola mundo' }]
      }
    }))
  }
}));

jest.mock('../utils/logger');

// Import mocked supabase after mocking
const { supabase } = require('../services/pgClient');

describe('Multi-Language Support', () => {
  const mockEnglishCaption = "Amazing sunset view!";
  const mockSpanishCaption = "¡Vista increíble del atardecer!";
  const mockHindiCaption = "आश्चर्यजनक सूर्यास्त का दृश्य!";

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('translateText', () => {
    it('should translate text to target language', async () => {
      const text = "Hello world";
      const result = await translateText(text, 'es');
      expect(result).toBe('Hola mundo');
    });

    it('should return original text for same language', async () => {
      const text = "Hello world";
      const result = await translateText(text, 'en', 'en');
      expect(result).toBe(text);
    });

    it('should fallback to English on error', async () => {
      const text = "Hello world";
      // Mock OpenAI to throw error
      require('../services/openaiClient').openai.createCompletion.mockRejectedValueOnce(new Error('API Error'));
      const result = await translateText(text, 'es');
      expect(result).toBe(text);
    });
  });

  describe('generateCaption', () => {
    const mockPrompt = "sunset at beach";
    const mockPlatform = "instagram";

    beforeEach(() => {
      // Mock Supabase cache miss
      supabase.from.mockReturnValue({
        select: () => ({
          eq: () => ({
            eq: () => ({
              limit: () => ({
                maybeSingle: () => ({ data: null })
              })
            })
          })
        })
      });
    });

    it('should generate multi-language captions with geo-aware content', async () => {
      const result = await generateCaption({
        prompt: mockPrompt,
        platform: mockPlatform,
        languages: ['en', 'es', 'hi'],
        geo: 'IN'
      });

      // Check structure
      expect(result).toHaveProperty('captions');
      expect(result).toHaveProperty('transcripts');
      expect(result).toHaveProperty('extras.geoAware');

      // Check languages
      expect(result.captions).toHaveProperty('en');
      expect(result.captions).toHaveProperty('es');
      expect(result.captions).toHaveProperty('hi');

      // Check geo-aware content
      expect(result.extras.geoAware.en).toContain('🇮🇳');
      expect(result.extras.geoAware.hi).toContain('भारत');
    });

    it('should use cache if available', async () => {
      const mockCacheData = {
        captions: {
          en: mockEnglishCaption,
          es: mockSpanishCaption,
          hi: mockHindiCaption
        }
      };

      // Mock Supabase cache hit
      supabase.from.mockReturnValue({
        select: () => ({
          eq: () => ({
            eq: () => ({
              limit: () => ({
                maybeSingle: () => ({ data: { output: mockCacheData } })
              })
            })
          })
        })
      });

      const result = await generateCaption({
        prompt: mockPrompt,
        platform: mockPlatform,
        languages: ['en', 'es', 'hi'],
        geo: 'US'
      });

      expect(result.captions.en).toBe(mockEnglishCaption);
      expect(result.captions.es).toBe(mockSpanishCaption);
      expect(result.captions.hi).toBe(mockHindiCaption);
    });
  });

  describe('generateBlogContent', () => {
    const mockTitle = "Beautiful Sunset";
    const mockPrompt = "Write about watching the sunset";

    it('should generate multi-language blog content', async () => {
      const result = await generateBlogContent({
        title: mockTitle,
        prompt: mockPrompt,
        languages: ['en', 'es', 'hi'],
        geo: 'MX',
        tags: ['nature', 'sunset']
      });

      // Check metadata structure
      expect(result.metadata).toHaveProperty('title');
      expect(result.metadata).toHaveProperty('description');
      expect(result.metadata).toHaveProperty('content_markdown');
      expect(result.metadata).toHaveProperty('content_html');
      expect(result.metadata).toHaveProperty('tags');
      expect(result.metadata).toHaveProperty('transcript');

      // Check languages in each field
      ['title', 'description', 'content_markdown', 'content_html'].forEach(field => {
        expect(result.metadata[field]).toHaveProperty('en');
        expect(result.metadata[field]).toHaveProperty('es');
        expect(result.metadata[field]).toHaveProperty('hi');
      });

      // Check geo-aware content
      expect(result.extras.geoAware.es).toContain('🇲🇽');
    });

    it('should handle missing languages gracefully', async () => {
      const result = await generateBlogContent({
        title: mockTitle,
        prompt: mockPrompt
      });

      // Should default to supported languages from env
      expect(result.metadata.title).toHaveProperty('en');
      expect(result.extras.geoAware).toHaveProperty('en');
    });
  });
});