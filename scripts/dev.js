/**
 * Consenzo Full-Stack Local Development Launcher
 *
 * Usage:  npm run dev        (builds backend first, then starts both servers)
 *         npm run dev:backend
 *         npm run dev:frontend
 *
 * Behaviour:
 *  - Backend (port 3001): defaults to LLM_PROVIDER=mock + USE_LOCAL_DB=true so the
 *    stack runs fully offline (no NVIDIA/Anthropic key, no AWS account needed).
 *    If backend/.env.local exists, its values are loaded first and the defaults
 *    below only fill any gaps.
 *  - Frontend (port 5173): Vite dev server with VITE_API_BASE_URL pointed at the
 *    local backend so the SPA exercises the real API instead of mocks.
 */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

// ---------------------------------------------------------------------------
// 1. Load backend/.env.local if present (KEY=VALUE lines), else use safe defaults
// ---------------------------------------------------------------------------
const envFilePath = path.join(rootDir, 'backend', '.env.local');
const backendEnv = {
  // Safe offline defaults — overridden by .env.local when it exists
  LLM_PROVIDER: 'mock',
  LLM_MODEL: 'nvidia/nemotron-3.5-lightning-30b-a3b',
  LLM_BASE_URL: 'https://integrate.api.nvidia.com/v1',
  USE_LOCAL_DB: 'true',
  JWT_SECRET: 'consenzo-development-secret-jwt-key-32-chars-minimum',
  PORT: '3001',
};

if (fs.existsSync(envFilePath)) {
  const lines = fs.readFileSync(envFilePath, 'utf-8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq > 0) {
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
      if (key) backendEnv[key] = value;
    }
  }
  console.log('[Env] Loaded backend/.env.local');
} else {
  console.log('[Env] backend/.env.local not found — using offline defaults (mock LLM, in-memory DB).');
}

console.log('====================================================');
console.log(' Starting Consenzo Full Stack Development Environment');
console.log(' Backend Port:  3001   (LLM provider: ' + backendEnv.LLM_PROVIDER + ', DB: ' + (backendEnv.USE_LOCAL_DB === 'true' ? 'in-memory' : 'AWS DynamoDB') + ')');
console.log(' Frontend Port: 5173');
console.log('====================================================\n');

// ---------------------------------------------------------------------------
// 2. Spawn Backend Server (no --env-file: missing file must not crash startup)
// ---------------------------------------------------------------------------
const backend = spawn('node', ['backend/dist/backend/src/localServer.js'], {
  cwd: rootDir,
  shell: true,
  stdio: 'pipe',
  env: { ...process.env, ...backendEnv },
});

backend.stdout.on('data', (data) => {
  process.stdout.write(`\x1b[36m[Backend]\x1b[0m ${data}`);
});
backend.stderr.on('data', (data) => {
  process.stderr.write(`\x1b[31m[Backend Error]\x1b[0m ${data}`);
});

// ---------------------------------------------------------------------------
// 3. Spawn Frontend Vite Dev Server, wired to the LOCAL backend
// ---------------------------------------------------------------------------
const frontend = spawn('npx', ['vite', '--port', '5173', '--host'], {
  cwd: path.resolve(rootDir, 'frontend'),
  shell: true,
  stdio: 'pipe',
  env: {
    ...process.env,
    VITE_API_BASE_URL: 'http://localhost:3001',
    VITE_USE_MOCKS: 'false',
  },
});

frontend.stdout.on('data', (data) => {
  process.stdout.write(`\x1b[32m[Frontend]\x1b[0m ${data}`);
});
frontend.stderr.on('data', (data) => {
  process.stderr.write(`\x1b[33m[Frontend Info]\x1b[0m ${data}`);
});

function cleanup() {
  console.log('\nShutting down Consenzo processes...');
  try { backend.kill(); } catch (e) {}
  try { frontend.kill(); } catch (e) {}
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
