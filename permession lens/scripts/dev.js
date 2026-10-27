/**
 * PermissionLens - Local Development Launcher
 * Triggered by: npm run dev
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('====================================================');
console.log('       PermissionLens — Local Dev Launcher          ');
console.log('====================================================\n');

// First run validation
console.log('Validating extension files before launch...');
require('../test.js');

const extensionDir = path.resolve(__dirname, '..');
console.log(`Loading extension from: ${extensionDir}`);

// Candidate Chrome paths on Windows
const chromeCandidates = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe'
];

let chromePath = null;
for (const p of chromeCandidates) {
  if (p && fs.existsSync(p)) {
    chromePath = p;
    break;
  }
}

if (chromePath) {
  console.log(`Found Chrome executable at: ${chromePath}`);
  console.log('Launching Chrome with PermissionLens pre-loaded...\n');

  const chromeProc = spawn(chromePath, [
    `--load-extension=${extensionDir}`,
    'https://github.com'
  ], {
    detached: true,
    stdio: 'ignore'
  });

  chromeProc.unref();

  console.log('----------------------------------------------------');
  console.log('✓ Chrome launched successfully with PermissionLens!');
  console.log('  1. Look at the open Chrome browser window.');
  console.log('  2. Click the puzzle icon in Chrome and pin PermissionLens.');
  console.log('  3. Click the PermissionLens icon on any website.');
  console.log('----------------------------------------------------\n');
} else {
  console.log('Chrome executable path not automatically resolved.');
  console.log('To load manually in your browser:');
  console.log('  1. Open Chrome and go to: chrome://extensions');
  console.log('  2. Enable "Developer mode" (top right toggle)');
  console.log('  3. Click "Load unpacked" and select: ' + extensionDir);
}
