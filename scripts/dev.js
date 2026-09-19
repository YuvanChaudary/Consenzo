const { spawn } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

console.log('====================================================');
console.log(' Starting Consenzo Full Stack Development Environment');
console.log(' Backend Port:  3001');
console.log(' Frontend Port: 5173');
console.log('====================================================\n');

// 1. Spawn Backend Server
const backend = spawn('node', [
  '--env-file=backend/.env.local',
  'backend/dist/backend/src/localServer.js'
], {
  cwd: rootDir,
  shell: true,
  stdio: 'pipe'
});

backend.stdout.on('data', (data) => {
  process.stdout.write(`\x1b[36m[Backend]\x1b[0m ${data}`);
});
backend.stderr.on('data', (data) => {
  process.stderr.write(`\x1b[31m[Backend Error]\x1b[0m ${data}`);
});

// 2. Spawn Frontend Vite Dev Server
const frontend = spawn('npx', [
  'vite',
  '--port', '5173',
  '--host'
], {
  cwd: path.resolve(rootDir, 'frontend'),
  shell: true,
  stdio: 'pipe'
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
