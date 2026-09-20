import { LLMProvider } from './types';
import { MockLLMProvider } from './mockProvider';
import { NvidiaLLMProvider } from './nvidiaProvider';
import { AnthropicLLMProvider } from './anthropicProvider';
import { OpenRouterLLMProvider } from './openrouterProvider';
import { env } from '../../config/env';

export class LLMProviderFactory {
  private static instance: LLMProvider | null = null;

  public static getProvider(): LLMProvider {
    if (this.instance) {
      return this.instance;
    }

    const providerName = (env.LLM_PROVIDER || process.env.LLM_PROVIDER || 'openrouter').toLowerCase();

    switch (providerName) {
      case 'openrouter':
        this.instance = new OpenRouterLLMProvider();
        break;
      case 'mock':
        this.instance = new MockLLMProvider();
        break;
      case 'nvidia':
        this.instance = new NvidiaLLMProvider();
        break;
      case 'anthropic':
        this.instance = new AnthropicLLMProvider();
        break;
      default:
        console.warn(`Unsupported LLM provider "${providerName}", defaulting to mock.`);
        this.instance = new MockLLMProvider();
        break;
    }

    return this.instance!;
  }
}

export const llmProvider = LLMProviderFactory.getProvider();
