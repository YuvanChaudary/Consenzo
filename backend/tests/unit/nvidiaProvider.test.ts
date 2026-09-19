import { NvidiaLLMProvider } from '../../src/services/llm/nvidiaProvider';
import { getNvidiaApiKey } from '../../src/config/secrets';

jest.mock('../../src/config/secrets');

describe('NvidiaLLMProvider', () => {
  let provider: NvidiaLLMProvider;

  beforeEach(() => {
    provider = new NvidiaLLMProvider();
    (getNvidiaApiKey as jest.Mock).mockResolvedValue('mock-api-key');
    global.fetch = jest.fn();
  });

  test('should send correct request to NVIDIA API', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'Hello World' } }],
      }),
    });

    const text = await provider.generateText('Hello');
    expect(text).toBe('Hello World');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://integrate.api.nvidia.com/v1/chat/completions'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer mock-api-key',
        }),
      })
    );
  });

  test('should handle API errors gracefully', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 429,
      text: async () => 'Rate limit exceeded',
    });

    await expect(provider.generateText('Hello')).rejects.toThrow('NVIDIA API Error (429): Rate limit exceeded');
  });

  test('should parse extracted preferences from XML tags', async () => {
    const mockResponse = `
      <reply>I have extracted your preferences.</reply>
      <candidate_extraction>
        { "constraints": [{ "attribute": "brand", "value": "Samsung", "type": "PREFERENCE" }] }
      </candidate_extraction>
    `;

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: mockResponse } }],
      }),
    });

    const result = await provider.extractStructuredPreferences('transcript', {});
    expect(result.reply).toBe('I have extracted your preferences.');
    expect(result.extractedPreferences).toEqual({
      constraints: [{ attribute: 'brand', value: 'Samsung', type: 'PREFERENCE' }],
    });
  });
});
