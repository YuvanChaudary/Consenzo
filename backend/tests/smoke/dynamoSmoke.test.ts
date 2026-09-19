import { ddbDocClient, DYNAMODB_TABLE } from '../../src/services/dynamoClient';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';

describe('DynamoDB Smoke Test', () => {
  test('should connect to DynamoDB and perform a read-only scan', async () => {
    try {
      const result = await ddbDocClient.send(new ScanCommand({
        TableName: DYNAMODB_TABLE,
        Limit: 1,
      }));
      console.log('DynamoDB Smoke Test successful. Found items:', result.Count);
      expect(result).toBeDefined();
    } catch (error: any) {
      if (error.name === 'ResourceNotFoundException') {
        console.log('DynamoDB Table not found. Skipping smoke test (expected if table is not created).');
        return;
      }
      if (error.message?.includes('credentials') || error.name?.includes('Credentials')) {
        console.log('AWS credentials not found. Skipping DynamoDB smoke test.');
        return;
      }
      console.error('DynamoDB Smoke Test Failed:', error);
      throw error;
    }
  });
});
