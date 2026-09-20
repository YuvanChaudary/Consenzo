import { z } from 'zod';

const envSchema = z.object({
  // Must stay in sync with LLMProviderFactory in services/llm/providerFactory.ts
  LLM_PROVIDER: z.enum(['openrouter', 'nvidia', 'anthropic', 'bedrock', 'mock']).default('openrouter'),
  LLM_MODEL: z.string().default('nvidia/nemotron-3.5-lightning:free'),
  LLM_BASE_URL: z.string().url().default('https://openrouter.ai/api/v1'),
  OPENROUTER_API_KEY: z.string().optional(),
  NVIDIA_API_KEY_SECRET_ARN: z.string().optional(),
  JWT_SECRET: z.string().min(32).default('consenzo-development-secret-jwt-key-32-chars-minimum'),
  DYNAMODB_TABLE_NAME: z.string().default('consenzo-sessions'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  USE_LOCAL_DB: z.string().optional(),
  PORT: z.string().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(): EnvConfig {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Invalid environment variables:', result.error.format());
    throw new Error('Environment configuration error');
  }

  return result.data;
}

export const env = validateEnv();
