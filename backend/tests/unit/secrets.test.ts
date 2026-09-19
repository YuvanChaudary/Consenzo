import { getNvidiaApiKey, resetSecretsCache } from '../../src/config/secrets';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

jest.mock('@aws-sdk/client-secrets-manager');

jest.mock('../../src/config/env', () => {
  return {
    env: {
      get NODE_ENV() { return process.env.NODE_ENV || 'development'; },
      get NVIDIA_API_KEY_SECRET_ARN() { return process.env.NVIDIA_API_KEY_SECRET_ARN; },
      get DYNAMODB_TABLE_NAME() { return process.env.DYNAMODB_TABLE_NAME || 'consenzo-sessions'; },
    }
  };
});

describe('Secrets Management', () => {
  const mockedClient = new SecretsManagerClient({} as any) as jest.Mocked<SecretsManagerClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    resetSecretsCache();
  });

  test('should return local key in development mode', async () => {
    process.env.NODE_ENV = 'development';
    process.env.NVIDIA_API_KEY = 'local-test-key';

    const key = await getNvidiaApiKey();
    expect(key).toBe('local-test-key');
  });

  test('should fetch from AWS Secrets Manager in production', async () => {
    process.env.NODE_ENV = 'production';
    process.env.NVIDIA_API_KEY_SECRET_ARN = 'arn:aws:secretsmanager:us-east-1:123:secret:consenzo/nvidia-api-key';

    const mockResponse = {
      SecretString: 'aws-production-key',
    };

    (SecretsManagerClient.prototype.send as jest.Mock).mockResolvedValue(mockResponse);

    const key = await getNvidiaApiKey();
    expect(key).toBe('aws-production-key');
    expect(SecretsManagerClient.prototype.send).toHaveBeenCalledWith(expect.any(GetSecretValueCommand));
  });

  test('should throw error when secret is missing in production', async () => {
    process.env.NODE_ENV = 'production';
    process.env.NVIDIA_API_KEY_SECRET_ARN = ''; // Missing ARN

    await expect(getNvidiaApiKey()).rejects.toThrow('NVIDIA_API_KEY_SECRET_ARN is required in production');
  });
});
