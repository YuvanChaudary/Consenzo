import http from 'http';
import { URL } from 'url';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { routeRequest } from './router';
import { getCorrelationContext } from './middleware/correlation';

const PORT = parseInt(process.env.PORT || '3001', 10);

export const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  const method = (req.method || 'GET').toUpperCase();

  // Convert Node incoming headers to APIGateway headers format
  const headers: Record<string, string> = {};
  for (const [key, val] of Object.entries(req.headers)) {
    if (typeof val === 'string') {
      headers[key.toLowerCase()] = val;
    } else if (Array.isArray(val)) {
      headers[key.toLowerCase()] = val.join(',');
    }
  }

  const correlation = getCorrelationContext(headers);

  // Read request body
  const bodyChunks: Buffer[] = [];
  for await (const chunk of req) {
    bodyChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const rawBody = Buffer.concat(bodyChunks).toString('utf-8');

  // Query parameters map
  const queryParams: Record<string, string> = {};
  parsedUrl.searchParams.forEach((value, key) => {
    queryParams[key] = value;
  });

  const event: APIGatewayProxyEvent = {
    httpMethod: method,
    path: pathname,
    headers,
    body: rawBody || null,
    isBase64Encoded: false,
    pathParameters: null,
    queryStringParameters: Object.keys(queryParams).length ? queryParams : null,
    multiValueHeaders: {},
    multiValueQueryStringParameters: null,
    stageVariables: null,
    resource: pathname,
    requestContext: {
      accountId: 'local-account',
      apiId: 'consenzo-local-api',
      authorizer: null,
      protocol: 'HTTP/1.1',
      httpMethod: method,
      identity: {
        accessKey: null,
        accountId: null,
        apiKey: null,
        apiKeyId: null,
        caller: null,
        clientCert: null,
        cognitoAuthenticationProvider: null,
        cognitoAuthenticationType: null,
        cognitoIdentityId: null,
        cognitoIdentityPoolId: null,
        principalOrgId: null,
        sourceIp: req.socket.remoteAddress || '127.0.0.1',
        user: null,
        userAgent: headers['user-agent'] || null,
        userArn: null,
      },
      path: pathname,
      stage: 'dev',
      requestId: correlation.requestId,
      requestTimeEpoch: Date.now(),
      resourceId: 'local-resource',
      resourcePath: pathname,
    },
  };

  const start = Date.now();

  try {
    const result = await routeRequest(event, correlation);
    const duration = Date.now() - start;

    console.log(`[${new Date().toISOString()}] ${method} ${pathname} -> ${result.statusCode} (${duration}ms)`);

    const responseHeaders: Record<string, string> = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Correlation-Id,Idempotency-Key',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      ...(result.headers as Record<string, string> || {}),
    };

    res.writeHead(result.statusCode, responseHeaders);
    res.end(result.body);
  } catch (error: any) {
    const duration = Date.now() - start;
    console.error(`[${new Date().toISOString()}] ${method} ${pathname} -> 500 (${duration}ms):`, error);

    res.writeHead(500, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(JSON.stringify({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error?.message || 'Server error',
      },
    }));
  }
});

// Start listening if executed directly
if (require.main === module) {
  server.listen(PORT, '0.0.0.0', () => {
    console.log('================================================================');
    console.log(` Consenzo Backend API Server Running Locally`);
    console.log(` URL:          http://localhost:${PORT}`);
    console.log(` Health Check: http://localhost:${PORT}/health`);
    console.log(` Storage:      ${process.env.USE_LOCAL_DB === 'true' ? 'In-Memory Single-Table DynamoDB' : 'AWS DynamoDB'}`);
    console.log(` LLM Model:    ${process.env.LLM_MODEL || 'nvidia/nemotron-3.5-lightning-30b-a3b'}`);
    console.log('================================================================');
  });
}
