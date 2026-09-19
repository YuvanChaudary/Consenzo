import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { env } from './env';

const secretsClient = new SecretsManagerClient({});
let cachedNvidiaKey: string | null = null;

export function resetSecretsCache() {
  cachedNvidiaKey = null;
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
