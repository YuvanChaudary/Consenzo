import { NvidiaLLMProvider } from '../../src/services/llm/nvidiaProvider';
import { getNvidiaApiKey } from '../../src/config/secrets';

describe('NVIDIA Nemotron Smoke Test', () => {
  let provider: NvidiaLLMProvider;

  beforeAll(async () => {
    provider = new NvidiaLLMProvider();
  });

  test('should make a real call to NVIDIA API if key is available', async () => {
    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      console.log('Skipping NVIDIA smoke test: NVIDIA_API_KEY not found in environment.');
      return;
    }

    try {
      const text = await provider.generateText('Hello, this is a smoke test. Reply with "SMOKE_TEST_OK".');
      console.log('NVIDIA Response:', text);
      expect(text).toContain('SMOKE_TEST_OK');
    } catch (error) {
      console.error('NVIDIA Smoke Test Failed:', error);
      throw error;
    }
  });
});
