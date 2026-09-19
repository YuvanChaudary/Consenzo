import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { env } from '../config/env';

/**
 * Local In-Memory Single-Table DynamoDB Driver
 * Implements the single-table DynamoDB contract (PK, SK, GSI1_PK, GSI1_SK)
 * for zero-dependency local development and verification.
 */
export class LocalDynamoStore {
  private items = new Map<string, any>();

  public async send(command: any): Promise<any> {
    const name = command?.constructor?.name || '';
    const input = command?.input || {};

    if (name === 'PutCommand' || name === 'PutItemCommand') {
      const item = input.Item;
      if (item && item.PK && item.SK) {
        this.items.set(`${item.PK}#${item.SK}`, { ...item });
      }
      return { Attributes: item };
    }

    if (name === 'GetCommand' || name === 'GetItemCommand') {
      const key = input.Key;
      if (key && key.PK && key.SK) {
        const item = this.items.get(`${key.PK}#${key.SK}`);
        return { Item: item ? { ...item } : undefined };
      }
      return {};
    }

    if (name === 'QueryCommand' || name === 'Query') {
      const values = input.ExpressionAttributeValues || {};
      let matched: any[] = [];

      if (input.IndexName === 'GSI1') {
        const targetGsiPk = values[':code'] || values[':pk'];
        for (const item of this.items.values()) {
          if (item.GSI1_PK === targetGsiPk) {
            matched.push({ ...item });
          }
        }
      } else {
        const targetPk = values[':pk'];
        const targetSkPrefix = values[':sk'];
        for (const item of this.items.values()) {
          if (item.PK === targetPk) {
            if (!targetSkPrefix || (typeof item.SK === 'string' && item.SK.startsWith(targetSkPrefix))) {
              matched.push({ ...item });
            }
          }
        }
      }
      return { Items: matched, Count: matched.length };
    }

    if (name === 'UpdateCommand' || name === 'UpdateItemCommand') {
      const key = input.Key;
      if (key && key.PK && key.SK) {
        const existing = this.items.get(`${key.PK}#${key.SK}`) || { ...key };
        const updateExpr = input.UpdateExpression || '';
        const attrNames = input.ExpressionAttributeNames || {};
        const attrValues = input.ExpressionAttributeValues || {};

        if (updateExpr.includes('#status = :s')) {
          const statusKey = attrNames['#status'] || 'status';
          existing[statusKey] = attrValues[':s'];
        }
        this.items.set(`${key.PK}#${key.SK}`, existing);
        return { Attributes: existing };
      }
      return {};
    }

    if (name === 'ScanCommand' || name === 'Scan') {
      const all = Array.from(this.items.values()).map(i => ({ ...i }));
      return { Items: all, Count: all.length };
    }

    return {};
  }

  public clear(): void {
    this.items.clear();
  }

  public get size(): number {
    return this.items.size;
  }
}

// Determine if local memory store should be used
const shouldUseLocal =
  process.env.USE_LOCAL_DB === 'true' ||
  (!process.env.AWS_ACCESS_KEY_ID &&
    !process.env.AWS_PROFILE &&
    !process.env.AWS_CONTAINER_CREDENTIALS_RELATIVE_URI &&
    !process.env.AWS_EXECUTION_ENV &&
    !process.env.DYNAMODB_ENDPOINT);

let clientInstance: any;

if (shouldUseLocal) {
  clientInstance = new LocalDynamoStore();
} else {
  const client = new DynamoDBClient({
    ...(process.env.DYNAMODB_ENDPOINT ? { endpoint: process.env.DYNAMODB_ENDPOINT } : {}),
  });
  clientInstance = DynamoDBDocumentClient.from(client, {
    marshallOptions: {
      removeUndefinedValues: true,
      convertClassInstanceToMap: true,
    },
  });
}

export const ddbDocClient = clientInstance;
export const DYNAMODB_TABLE = env.DYNAMODB_TABLE_NAME;

