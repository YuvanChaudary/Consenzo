import { APIGatewayProxyEvent } from 'aws-lambda';
import { ddbDocClient, DYNAMODB_TABLE } from '../services/dynamoClient';
import { successResponse, errorResponse } from '../utils/response';
import { CorrelationContext } from '../middleware/correlation';

export interface BackendCartItem {
  productId: string;
  name: string;
  brand: string;
  priceInr: number;
  quantity: number;
  image?: string;
  category: string;
  lockState?: 'pending' | 'agreed' | 'rejected';
  voteCount?: number;
  totalVoters?: number;
}

export interface BackendCart {
  cartId: string;
  cartType: 'individual' | 'consensus';
  roomId?: string;
  userId?: string;
  items: BackendCartItem[];
  subtotal: number;
  updatedAt: string;
}

export class CartHandler {
  /**
   * POST /api/v2/cart
   * Sync or save cart items
   */
  async saveCart(event: APIGatewayProxyEvent, correlation: CorrelationContext) {
    let body: any;
    try {
      body = JSON.parse(event.body || '{}');
    } catch {
      return errorResponse('BAD_REQUEST', 'Invalid JSON body', 400);
    }

    const cartId = body.cartId || `cart_${Date.now()}`;
    const cartType = body.cartType || 'individual';
    const items: BackendCartItem[] = body.items || [];
    const roomId = body.roomId;
    const userId = body.userId;

    const subtotal = items.reduce((sum, i) => sum + (i.priceInr || 0) * (i.quantity || 1), 0);

    const cart: BackendCart = {
      cartId,
      cartType,
      roomId,
      userId,
      items,
      subtotal,
      updatedAt: new Date().toISOString(),
    };

    // Save cart metadata
    await ddbDocClient.send({
      constructor: { name: 'PutCommand' },
      input: {
        TableName: DYNAMODB_TABLE,
        Item: {
          PK: `CART#${cartId}`,
          SK: 'METADATA',
          ...cart,
        },
      },
    });

    return successResponse(cart, 200, {
      requestId: correlation.requestId,
      correlationId: correlation.correlationId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * GET /api/v2/cart/{cartId}
   */
  async getCart(event: APIGatewayProxyEvent, correlation: CorrelationContext) {
    const cartId = event.pathParameters?.cartId;
    if (!cartId) {
      return errorResponse('BAD_REQUEST', 'cartId is required', 400);
    }

    const res = await ddbDocClient.send({
      constructor: { name: 'GetCommand' },
      input: {
        TableName: DYNAMODB_TABLE,
        Key: {
          PK: `CART#${cartId}`,
          SK: 'METADATA',
        },
      },
    });

    if (!res?.Item) {
      return errorResponse('NOT_FOUND', `Cart not found: ${cartId}`, 404);
    }

    return successResponse(res.Item, 200, {
      requestId: correlation.requestId,
      correlationId: correlation.correlationId,
      timestamp: new Date().toISOString(),
    });
  }
}

export const cartHandler = new CartHandler();
