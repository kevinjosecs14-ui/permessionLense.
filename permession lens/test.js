/**
 * PermissionLens - Automated Verification Test Suite
 * Run with: npm test
 */

const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log('   PermissionLens Chrome Extension Test Suite');
console.log('====================================================\n');

// 1. Manifest V3 Check
console.log('[1/5] Checking manifest.json...');
const manifestPath = path.join(__dirname, 'manifest.json');
if (!fs.existsSync(manifestPath)) {
  console.error('FAIL: manifest.json not found!');
  process.exit(1);
}
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
if (manifest.manifest_version !== 3) {
  console.error(`FAIL: Expected Manifest V3, got ${manifest.manifest_version}`);
  process.exit(1);
}
console.log(`  ✓ Manifest V3 valid: "${manifest.name}"`);
console.log(`  ✓ Permissions declared: ${manifest.permissions.join(', ')}`);

// 2. Shared Modules
console.log('\n[2/5] Testing Shared Modules & Offline Databases...');
const { PERMISSIONS_DATA, getPermissionById } = require('./shared/permissions-data.js');
const { PROFILES_DATA, getProfileById } = require('./shared/profiles-data.js');

if (!Array.isArray(PERMISSIONS_DATA) || PERMISSIONS_DATA.length === 0) {
  console.error('FAIL: PERMISSIONS_DATA is empty!');
  process.exit(1);
}
console.log(`  ✓ Loaded ${PERMISSIONS_DATA.length} permission guides.`);

if (!Array.isArray(PROFILES_DATA) || PROFILES_DATA.length === 0) {
  console.error('FAIL: PROFILES_DATA is empty!');
  process.exit(1);
}
console.log(`  ✓ Loaded ${PROFILES_DATA.length} pre-seeded application profiles.`);

// 3. Permission Impact Simulator Engine
console.log('\n[3/5] Testing Permission Impact Simulator Engine...');
const { PermissionImpactSimulator } = require('./shared/simulator.js');
const diff = PermissionImpactSimulator.compareProfiles(
  ['camera', 'microphone', 'contacts'],
  ['camera', 'location', 'notifications'],
  getPermissionById
);

if (diff.stats.addedCount !== 2 || diff.stats.removedCount !== 2 || diff.stats.unchangedCount !== 1) {
  console.error('FAIL: Simulator diff calculation mismatch!');
  process.exit(1);
}
console.log(`  ✓ Simulator diff accurate: +${diff.stats.addedCount} Added, -${diff.stats.removedCount} Removed, =${diff.stats.unchangedCount} Unchanged.`);
console.log(`  ✓ Delta Risk Score: ${diff.stats.deltaScore} (${diff.assessment.title})`);

// 4. Icon Integrity Check
console.log('\n[4/5] Checking Branding Icons...');
[16, 32, 48, 128].forEach(size => {
  const iconPath = path.join(__dirname, 'icons', `icon-${size}.png`);
  if (!fs.existsSync(iconPath) || fs.statSync(iconPath).size === 0) {
    console.error(`FAIL: Missing icon-${size}.png`);
    process.exit(1);
  }
});
console.log('  ✓ All 4 icon assets verified (16, 32, 48, 128px PNG).');

// 5. DOM Element ID Mapping Check
console.log('\n[5/5] Checking DOM Element ID Consistency...');
function verifyHtmlJsMatch(htmlRel, jsRel) {
  const html = fs.readFileSync(path.join(__dirname, htmlRel), 'utf8');
  const js = fs.readFileSync(path.join(__dirname, jsRel), 'utf8');
  const regex = /getElementById\(["']([^"']+)["']\)/g;
  let match;
  let count = 0;
  while ((match = regex.exec(js)) !== null) {
    count++;
    const id = match[1];
    if (!html.includes(`id="${id}"`) && !html.includes(`id='${id}'`)) {
      console.error(`FAIL: ${jsRel} references #${id} which is missing in ${htmlRel}`);
      process.exit(1);
    }
  }
  console.log(`  ✓ ${htmlRel} <-> ${jsRel}: All ${count} elements verified.`);
}

verifyHtmlJsMatch('popup/popup.html', 'popup/popup.js');
verifyHtmlJsMatch('sidepanel/sidepanel.html', 'sidepanel/sidepanel.js');
verifyHtmlJsMatch('dashboard/dashboard.html', 'dashboard/dashboard.js');

console.log('\n====================================================');
console.log('  ✓ ALL PERMISSIONLENS TESTS PASSED (100% HEALTHY)');
console.log('====================================================\n');
