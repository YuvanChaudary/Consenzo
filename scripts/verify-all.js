/**
 * Consenzo Full Stack Verification Script
 * Validates:
 *   1. Database (Single-table DynamoDB operations, GSI1 lookups, update expressions)
 *   2. Backend (HTTP routes, JWT auth, conversation engine, voting engine, /health check)
 *   3. Frontend (Vite server running, HTML delivery, client assets)
 */

const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

const BACKEND_PORT = 3001;
const FRONTEND_PORT = 5173;

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, body: json });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error(`Request timed out to ${options.path}`));
    });

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function verifyStack() {
  console.log('=============================================================');
  console.log('       CONSENZO END-TO-END STACK VERIFICATION');
  console.log('=============================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assertTest(name, condition, details = '') {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  [PASS] ${name} ${details ? '(' + details + ')' : ''}`);
    } else {
      console.error(`  [FAIL] ${name} ${details ? ': ' + details : ''}`);
    }
  }

  // -------------------------------------------------------------
  // 1. DIRECT DATABASE OPERATIONS VERIFICATION
  // -------------------------------------------------------------
  console.log('--- 1. Testing Database Layer (Single-Table DynamoDB Contract) ---');
  
  // Dynamically import compiled DynamoDB client
  const { ddbDocClient, DYNAMODB_TABLE } = require('../backend/dist/backend/src/services/dynamoClient');
  const { PutCommand, GetCommand, QueryCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

  const testGroupId = 'grp_verify_' + Date.now();
  const testInvite = 'PIN-' + Math.floor(1000 + Math.random() * 9000);

  // Put Item
  await ddbDocClient.send(new PutCommand({
    TableName: DYNAMODB_TABLE,
    Item: {
      PK: `SESSION#${testGroupId}`,
      SK: 'METADATA',
      title: 'Verification Suite TV Room',
      category: 'smart_tvs',
      status: 'JOINING',
      createdAt: new Date().toISOString()
    }
  }));

  // Put GSI Index Item (Invite Code)
  await ddbDocClient.send(new PutCommand({
    TableName: DYNAMODB_TABLE,
    Item: {
      PK: `INVITE#${testInvite}`,
      SK: `SESSION#${testGroupId}`,
      GSI1_PK: `INVITE#${testInvite}`,
      GSI1_SK: `SESSION#${testGroupId}`
    }
  }));

  // Put Participant
  await ddbDocClient.send(new PutCommand({
    TableName: DYNAMODB_TABLE,
    Item: {
      PK: `SESSION#${testGroupId}`,
      SK: 'PART#usr_lead_01',
      GSI1_PK: 'PART#usr_lead_01',
      GSI1_SK: `SESSION#${testGroupId}`,
      displayName: 'Room Admin',
      role: 'COORDINATOR'
    }
  }));

  // Get Item
  const getRes = await ddbDocClient.send(new GetCommand({
    TableName: DYNAMODB_TABLE,
    Key: { PK: `SESSION#${testGroupId}`, SK: 'METADATA' }
  }));
  assertTest('Database Put & Get Metadata', getRes.Item && getRes.Item.title === 'Verification Suite TV Room');

  // GSI1 Query
  const gsiRes = await ddbDocClient.send(new QueryCommand({
    TableName: DYNAMODB_TABLE,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1_PK = :code',
    ExpressionAttributeValues: { ':code': `INVITE#${testInvite}` }
  }));
  assertTest('Database GSI1 Index Query (Invite PIN -> Group ID)', gsiRes.Items && gsiRes.Items.length > 0 && gsiRes.Items[0].SK.includes(testGroupId));

  // Prefix Query (Participants)
  const partRes = await ddbDocClient.send(new QueryCommand({
    TableName: DYNAMODB_TABLE,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: { ':pk': `SESSION#${testGroupId}`, ':sk': 'PART#' }
  }));
  assertTest('Database Range Key Prefix Query (begins_with PART#)', partRes.Items && partRes.Items.length === 1 && partRes.Items[0].displayName === 'Room Admin');

  // Update Item
  await ddbDocClient.send(new UpdateCommand({
    TableName: DYNAMODB_TABLE,
    Key: { PK: `SESSION#${testGroupId}`, SK: 'METADATA' },
    UpdateExpression: 'SET #status = :s',
    ExpressionAttributeNames: { '#status': 'status' },
    ExpressionAttributeValues: { ':s': 'INTERVIEWING' }
  }));

  const updatedGet = await ddbDocClient.send(new GetCommand({
    TableName: DYNAMODB_TABLE,
    Key: { PK: `SESSION#${testGroupId}`, SK: 'METADATA' }
  }));
  assertTest('Database Update Command (status -> INTERVIEWING)', updatedGet.Item && updatedGet.Item.status === 'INTERVIEWING');

  // -------------------------------------------------------------
  // 2. BACKEND API SERVER VERIFICATION
  // -------------------------------------------------------------
  console.log('\n--- 2. Testing Backend API Server (HTTP / REST / JWT / Consensus) ---');

  // Check /health
  const healthRes = await makeRequest({
    hostname: 'localhost',
    port: BACKEND_PORT,
    path: '/health',
    method: 'GET'
  });
  assertTest('Backend Health Check (GET /health)', healthRes.status === 200 && healthRes.body?.data?.status === 'healthy', `Database: ${healthRes.body?.data?.database?.status}`);

  // Create Group
  const createGroupRes = await makeRequest({
    hostname: 'localhost',
    port: BACKEND_PORT,
    path: '/groups',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    title: 'Living Room TV Choice',
    category: 'smart_tvs',
    creatorDisplayName: 'Aarav (Dad)',
    targetParticipantCount: 3
  });

  const createdGroup = createGroupRes.body?.data;
  const coordinatorToken = createdGroup?.token || createdGroup?.creatorToken;
  const groupId = createdGroup?.groupId;
  const inviteCode = createdGroup?.inviteCode;
  assertTest('Create Decision Room (POST /groups)', createGroupRes.status === 201 && !!groupId, `GroupId: ${groupId}, PIN: ${inviteCode}`);

  // Join Group with PIN
  const joinRes = await makeRequest({
    hostname: 'localhost',
    port: BACKEND_PORT,
    path: '/groups/join',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    inviteCode: inviteCode,
    displayName: 'Priya (Mom)'
  });
  const participantToken = joinRes.body?.data?.token;
  const participantId = joinRes.body?.data?.participantId;
  assertTest('Join Decision Room with PIN (POST /groups/join)', joinRes.status === 201 && !!participantToken, `User: Priya, ID: ${participantId}`);

  // Get Group Details
  const getGroupRes = await makeRequest({
    hostname: 'localhost',
    port: BACKEND_PORT,
    path: `/groups/${groupId}`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${coordinatorToken}`
    }
  });
  const roster = getGroupRes.body?.data?.roster || [];
  assertTest('Fetch Decision Room & Roster (GET /groups/:id)', getGroupRes.status === 200 && roster.length >= 2, `Roster count: ${roster.length}`);

  // Start Interview Conversation
  const convRes = await makeRequest({
    hostname: 'localhost',
    port: BACKEND_PORT,
    path: '/conversations',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${coordinatorToken}`
    }
  }, {
    participantId: createdGroup?.creator?.participantId
  });
  const conversationId = convRes.body?.data?.conversationId;
  assertTest('Initiate 1-on-1 AI Interview (POST /conversations)', convRes.status === 200 && !!conversationId, `ConversationId: ${conversationId}`);

  // Send Message in Interview
  const msgRes = await makeRequest({
    hostname: 'localhost',
    port: BACKEND_PORT,
    path: `/conversations/${conversationId}/messages`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${coordinatorToken}`
    }
  }, {
    message: 'We want a 55 inch 4K TV with good sound, budget under 60000 rupees for family movies.'
  });
  assertTest('Send Message to Dialogue Engine (POST /conversations/:id/messages)', msgRes.status === 200 && !!msgRes.body?.data?.reply, `Turns: ${msgRes.body?.data?.turnCount}`);

  // Ratify / Confirm Preferences
  const confirmRes = await makeRequest({
    hostname: 'localhost',
    port: BACKEND_PORT,
    path: `/participants/${createdGroup?.creator?.participantId}/preferences/confirm`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${coordinatorToken}`
    }
  }, {
    confirmed: true
  });
  assertTest('Ratify Structured Preferences (POST /participants/:id/preferences/confirm)', confirmRes.status === 200 && confirmRes.body?.data?.confirmed === true);

  // Cast Ratification Vote
  const voteRes = await makeRequest({
    hostname: 'localhost',
    port: BACKEND_PORT,
    path: `/groups/${groupId}/votes`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${coordinatorToken}`
    }
  }, {
    productId: 'tv_samsung_cu7700_55'
  });
  assertTest('Cast Product Consensus Vote (POST /groups/:id/votes)', voteRes.status === 200 && voteRes.body?.data?.productId === 'tv_samsung_cu7700_55', `Approvals: ${voteRes.body?.data?.approvalsCount}`);

  // -------------------------------------------------------------
  // 3. FRONTEND DEV SERVER VERIFICATION
  // -------------------------------------------------------------
  console.log('\n--- 3. Testing Frontend Client (React 18 + Vite SPA) ---');
  
  const frontendRes = await makeRequest({
    hostname: 'localhost',
    port: FRONTEND_PORT,
    path: '/',
    method: 'GET'
  });

  const htmlContent = frontendRes.raw || '';
  const hasRootDiv = htmlContent.includes('<div id="root"></div>') || htmlContent.includes('id="root"');
  const hasMainScript = htmlContent.includes('/src/main.tsx') || htmlContent.includes('index-');
  assertTest('Frontend Server Running (GET http://localhost:5173)', frontendRes.status === 200, `HTTP Status: ${frontendRes.status}`);
  assertTest('Frontend HTML Document Structure', hasRootDiv && hasMainScript, 'Root mount point and bundle entry found');

  // Summary
  console.log('\n=============================================================');
  console.log(` VERIFICATION RESULT: ${passedTests} / ${totalTests} TESTS PASSED`);
  if (passedTests === totalTests) {
    console.log(' ALL SYSTEMS FULLY OPERATIONAL (BACKEND, FRONTEND, DATABASE)');
  } else {
    console.error(' SOME TESTS FAILED. PLEASE REVIEW LOGS ABOVE.');
    process.exitCode = 1;
  }
  console.log('=============================================================\n');
}

verifyStack().catch((err) => {
  console.error('Verification encountered an unexpected error:', err);
  process.exit(1);
});
