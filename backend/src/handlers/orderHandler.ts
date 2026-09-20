import { APIGatewayProxyEvent } from 'aws-lambda';
import { ddbDocClient, DYNAMODB_TABLE } from '../services/dynamoClient';
import { successResponse, errorResponse } from '../utils/response';
import { CorrelationContext } from '../middleware/correlation';

export interface OrderItem {
  productId: string;
  name: string;
  brand: string;
  priceInr: number;
  quantity: number;
}

export interface Address {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface OrderRecord {
  orderId: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  address: Address;
  paymentMethod: 'card' | 'upi';
  status: 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED';
  createdAt: string;
}

export class OrderHandler {
  /**
   * POST /api/v2/orders
   * Place an order (simulated backend verification & confirmation)
   */
  async createOrder(event: APIGatewayProxyEvent, correlation: CorrelationContext) {
    let body: any;
    try {
      body = JSON.parse(event.body || '{}');
    } catch {
      return errorResponse('BAD_REQUEST', 'Invalid JSON body', 400);
    }

    const userId = body.userId || 'usr_guest';
    const orderId = body.orderId || `NXS-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    const items: OrderItem[] = body.items || [];
    const address: Address = body.address || {};
    const paymentMethod = body.paymentMethod || 'card';

    if (items.length === 0) {
      return errorResponse('BAD_REQUEST', 'Order items cannot be empty', 400);
    }

    const subtotal = items.reduce((sum, i) => sum + (i.priceInr || 0) * (i.quantity || 1), 0);
    const tax = Math.round(subtotal * 0.18);
    const shipping = subtotal > 999 ? 0 : 99;
    const total = subtotal + tax + shipping;

    const order: OrderRecord = {
      orderId,
      userId,
      items,
      subtotal,
      tax,
      shipping,
      total,
      address,
      paymentMethod,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
    };

    // Store in DynamoDB single-table:
    // PK: USER#<userId>, SK: ORDER#<orderId>
    await ddbDocClient.send({
      constructor: { name: 'PutCommand' },
      input: {
        TableName: DYNAMODB_TABLE,
        Item: {
          PK: `USER#${userId}`,
          SK: `ORDER#${orderId}`,
          ...order,
        },
      },
    });

    return successResponse(order, 201, {
      requestId: correlation.requestId,
      correlationId: correlation.correlationId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * GET /api/v2/orders/{userId}
   * Get all orders for a user
   */
  async listOrders(event: APIGatewayProxyEvent, correlation: CorrelationContext) {
    const userId = event.pathParameters?.userId || 'usr_guest';

    const res = await ddbDocClient.send({
      constructor: { name: 'QueryCommand' },
      input: {
        TableName: DYNAMODB_TABLE,
        ExpressionAttributeValues: {
          ':pk': `USER#${userId}`,
          ':sk': 'ORDER#',
        },
      },
    });

    return successResponse(
      {
        userId,
        count: res?.Items?.length || 0,
        orders: res?.Items || [],
      },
      200,
      {
        requestId: correlation.requestId,
        correlationId: correlation.correlationId,
        timestamp: new Date().toISOString(),
      }
    );
  }
}

export const orderHandler = new OrderHandler();
