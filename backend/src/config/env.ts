import { z } from 'zod';

const envSchema = z.object({
  LLM_PROVIDER: z.enum(['nvidia', 'bedrock', 'mock']).default('nvidia'),
  LLM_MODEL: z.string().default('nvidia/nemotron-3.5-lightning-30b-a3b'),
  LLM_BASE_URL: z.string().url().default('https://integrate.api.nvidia.com/v1'),
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
