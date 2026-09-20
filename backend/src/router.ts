import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CorrelationContext } from './middleware/correlation';
import { handleError } from './middleware/error';
import { successResponse, errorResponse } from './utils/response';
import { groupController } from './controllers/groupController';
import { conversationController } from './controllers/conversationController';
import { preferenceController } from './controllers/preferenceController';
import { catalogService } from './services/catalogService';
import { preferenceRepository } from './repositories/preferenceRepository';
import { catalogHandler } from './handlers/catalogHandler';
import { cartHandler } from './handlers/cartHandler';
import { orderHandler } from './handlers/orderHandler';

type Handler = (event: APIGatewayProxyEvent, context: CorrelationContext) => Promise<any>;

interface Route {
  method: string;
  path: string;
  handler: Handler;
}

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Correlation-Id,Idempotency-Key',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
};

const routes: Route[] = [
  // ─── API v2 Storefront Endpoints ──────────────────────────────────────────
  {
    method: 'GET',
    path: '/api/v2/products',
    handler: (event, correlation) => catalogHandler.listProducts(event, correlation),
  },
  {
    method: 'GET',
    path: '/api/v2/products/{id}',
    handler: (event, correlation) => catalogHandler.getProduct(event, correlation),
  },
  {
    method: 'GET',
    path: '/api/v2/categories',
    handler: (event, correlation) => catalogHandler.listCategories(event, correlation),
  },
  {
    method: 'GET',
    path: '/api/v2/categories/{category}/schema',
    handler: (event, correlation) => catalogHandler.getCategorySchema(event, correlation),
  },
  {
    method: 'POST',
    path: '/api/v2/cart',
    handler: (event, correlation) => cartHandler.saveCart(event, correlation),
  },
  {
    method: 'GET',
    path: '/api/v2/cart/{cartId}',
    handler: (event, correlation) => cartHandler.getCart(event, correlation),
  },
  {
    method: 'POST',
    path: '/api/v2/orders',
    handler: (event, correlation) => orderHandler.createOrder(event, correlation),
  },
  {
    method: 'GET',
    path: '/api/v2/orders/{userId}',
    handler: (event, correlation) => orderHandler.listOrders(event, correlation),
  },

  // ─── Legacy & Common Endpoints ─────────────────────────────────────────────
  {
    method: 'GET',
    path: '/catalog',
    handler: async (_event, correlation) => {
      const categories = catalogService.getCategories();
      const allData = catalogService.getAllCategoriesData();
      return successResponse({
        categories,
        inventory: allData,
        totalProducts: Object.values(allData).reduce((acc, curr) => acc + curr.length, 0),
      }, 200, {
        requestId: correlation.requestId,
        correlationId: correlation.correlationId,
        timestamp: new Date().toISOString(),
      });
    },
  },
  {
    method: 'GET',
    path: '/catalog/{category}',
    handler: async (event, correlation) => {
      const category = event.pathParameters?.category || 'smart_tvs';
      const products = catalogService.getAll(category);
      return successResponse({
        category,
        count: products.length,
        products,
      }, 200, {
        requestId: correlation.requestId,
        correlationId: correlation.correlationId,
        timestamp: new Date().toISOString(),
      });
    },
  },
  {
    method: 'GET',
    path: '/health',
    handler: async (_event, correlation) => {
      let dbStatus = 'healthy';
      try {
        await groupController.getGroup({ pathParameters: { groupId: 'health_check_ping' } } as any).catch(() => null);
      } catch (err: any) {
        dbStatus = `degraded: ${err?.message || 'unknown'}`;
      }

      const categories = catalogService.getCategories();

      return successResponse({
        status: 'healthy',
        platform: 'Shippyfy Full E-Commerce Platform',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
        database: {
          status: dbStatus,
          mode: process.env.USE_LOCAL_DB === 'true' ? 'in-memory-local' : 'aws-dynamodb',
        },
        services: {
          llm: {
            provider: process.env.LLM_PROVIDER || 'nvidia',
            model: process.env.LLM_MODEL || 'nvidia/nemotron-3.5-lightning-30b-a3b',
          },
          catalog: {
            categories,
            totalProducts: categories.reduce((acc, c) => acc + c.count, 0),
          },
        },
      }, 200, {
        requestId: correlation.requestId,
        correlationId: correlation.correlationId,
        timestamp: new Date().toISOString(),
      });
    },
  },
  {
    method: 'POST',
    path: '/groups',
    handler: (event) => groupController.createGroup(event),
  },
  {
    method: 'POST',
    path: '/groups/join',
    handler: (event) => groupController.joinGroup(event),
  },
  {
    method: 'POST',
    path: '/groups/{groupId}/join',
    handler: (event) => groupController.joinGroup(event),
  },
  {
    method: 'GET',
    path: '/groups/{groupId}',
    handler: (event) => groupController.getGroup(event),
  },
  {
    method: 'POST',
    path: '/groups/{groupId}/analysis',
    handler: (event) => groupController.runAnalysis(event),
  },
  {
    method: 'POST',
    path: '/groups/{groupId}/votes',
    handler: (event) => groupController.castVote(event),
  },
  {
    method: 'POST',
    path: '/conversations',
    handler: (event) => conversationController.startConversation(event),
  },
  {
    method: 'GET',
    path: '/conversations/{conversationId}',
    handler: (event) => conversationController.getConversation(event),
  },
  {
    method: 'POST',
    path: '/conversations/{conversationId}/messages',
    handler: (event) => conversationController.sendMessage(event),
  },
  {
    method: 'GET',
    path: '/groups/{groupId}/events',
    handler: async (event, correlation) => {
      const groupId = event.pathParameters?.['groupId'];
      const sinceParam = event.queryStringParameters?.['since'];
      const since = sinceParam ? Number(sinceParam) : undefined;
      const events = await preferenceRepository.getGroupEvents(groupId || '', since);
      return successResponse({ groupId, events }, 200, {
        requestId: correlation.requestId,
        correlationId: correlation.correlationId,
        timestamp: new Date().toISOString(),
      });
    },
  },
  {
    method: 'GET',
    path: '/groups/{groupId}/analysis',
    handler: (event) => groupController.getAnalysis(event),
  },
  {
    method: 'GET',
    path: '/participants/{participantId}/preferences',
    handler: (event) => preferenceController.getPreferences(event),
  },
  {
    method: 'PUT',
    path: '/participants/{participantId}/preferences',
    handler: (event) => preferenceController.updatePreferences(event),
  },
  {
    method: 'POST',
    path: '/participants/{participantId}/preferences',
    handler: (event) => preferenceController.updatePreferences(event),
  },
  {
    method: 'POST',
    path: '/participants/{participantId}/preferences/confirm',
    handler: (event) => preferenceController.confirmPreferences(event),
  },
];

export async function routeRequest(
  event: APIGatewayProxyEvent,
  correlation: CorrelationContext
): Promise<APIGatewayProxyResult> {
  const httpMethod = event.httpMethod || (event.requestContext as any)?.http?.method || 'GET';
  const rawPath = (event as any).rawPath || event.path || '';
  const normalizedPath = rawPath.replace(/^\/dev(?=\/|$)/, '') || '/';

  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'OK' }),
      headers: CORS_HEADERS,
    };
  }

  const route = routes.find(r => {
    if (r.method !== httpMethod) return false;
    if (r.path.includes('{')) {
      const keys: string[] = [];
      const regexStr = '^' + r.path.replace(/\{(\w+)\}/g, (_, key) => {
        keys.push(key);
        return '([^/]+)';
      }) + '$';
      const match = normalizedPath.match(new RegExp(regexStr));
      if (match) {
        event.pathParameters = event.pathParameters || {};
        keys.forEach((k, idx) => {
          if (!event.pathParameters![k]) {
            event.pathParameters![k] = match[idx + 1];
          }
        });
        return true;
      }
      return false;
    }
    return r.path === normalizedPath;
  });

  if (!route) {
    return {
      statusCode: 404,
      body: JSON.stringify(errorResponse('NOT_FOUND', 'The requested endpoint does not exist', 404, undefined, {
        requestId: correlation.requestId,
        correlationId: correlation.correlationId,
        timestamp: new Date().toISOString(),
      })),
      headers: CORS_HEADERS,
    };
  }

  try {
    const result = await route.handler(event, correlation);
    return {
      statusCode: result.statusCode || 200,
      body: JSON.stringify(result),
      headers: CORS_HEADERS,
    };
  } catch (error) {
    const errorPayload = handleError(error, {
      requestId: correlation.requestId,
      correlationId: correlation.correlationId,
      timestamp: new Date().toISOString(),
    });

    return {
      statusCode: (error as any).statusCode || 500,
      body: JSON.stringify(errorPayload),
      headers: CORS_HEADERS,
    };
  }
}
