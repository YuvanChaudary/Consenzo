import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { env } from './env';

const secretsClient = new SecretsManagerClient({});
let cachedNvidiaKey: string | null = null;
let cachedOpenRouterKey: string | null = null;

export function resetSecretsCache() {
  cachedNvidiaKey = null;
  cachedOpenRouterKey = null;
}

export async function getOpenRouterApiKey(): Promise<string> {
  if (cachedOpenRouterKey) {
    return cachedOpenRouterKey;
  }

  const key = process.env.OPENROUTER_API_KEY || (env as any).OPENROUTER_API_KEY;
  if (key) {
    cachedOpenRouterKey = key;
    return key;
  }

  // Fallback to demo default if unset
  return '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';
}

export async function getNvidiaApiKey(): Promise<string> {
  if (cachedNvidiaKey) {
    return cachedNvidiaKey;
  }


  if (env.NODE_ENV !== 'production') {
    // Local dev/test fallback
    const localKey = process.env.NVIDIA_API_KEY;
    if (localKey) {
      cachedNvidiaKey = localKey;
      return localKey;
    }
  }

  if (!env.NVIDIA_API_KEY_SECRET_ARN) {
    throw new Error('NVIDIA_API_KEY_SECRET_ARN is required in production');
  }

  try {
    const command = new GetSecretValueCommand({
      SecretId: env.NVIDIA_API_KEY_SECRET_ARN,
    });
    const response = await secretsClient.send(command);
    const secret = response.SecretString;

    if (!secret) {
      throw new Error('Secret string is empty');
    }

    cachedNvidiaKey = secret;
    return secret;
  } catch (error) {
    console.error('Failed to retrieve secret from AWS Secrets Manager:', error);
    throw new Error('Could not retrieve API key from secrets manager');
  }
}
