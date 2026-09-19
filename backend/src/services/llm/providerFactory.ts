import { LLMProvider } from './types';
import { MockLLMProvider } from './mockProvider';
import { NvidiaLLMProvider } from './nvidiaProvider';
import { env } from '../../config/env';

export class LLMProviderFactory {
  private static instance: LLMProvider | null = null;

  public static getProvider(): LLMProvider {
    if (this.instance) {
      return this.instance;
    }

    switch (env.LLM_PROVIDER) {
      case 'mock':
        this.instance = new MockLLMProvider();
        break;
      case 'nvidia':
        this.instance = new NvidiaLLMProvider();
        break;
      default:
        throw new Error(`Unsupported LLM provider: ${env.LLM_PROVIDER}`);
    }

    return this.instance;
  }
}

export const llmProvider = LLMProviderFactory.getProvider();
