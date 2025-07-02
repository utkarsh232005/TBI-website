#!/usr/bin/env node

/**
 * Token Cleanup System Validation Script
 * 
 * This script validates that your token cleanup system is properly configured
 * and working correctly.
 */

const { execSync } = require('child_process');

const API_BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
const CLEANUP_SECRET = process.env.CLEANUP_SECRET;
const CRON_SECRET = process.env.CRON_SECRET;

console.log('🔍 Validating Token Cleanup System...\n');

// Check 1: Environment Variables
console.log('1️⃣ Checking environment variables...');
if (!CLEANUP_SECRET) {
  console.error('   ❌ CLEANUP_SECRET is not set');
} else {
  console.log('   ✅ CLEANUP_SECRET is configured');
}

if (!CRON_SECRET) {
  console.error('   ❌ CRON_SECRET is not set');
} else {
  console.log('   ✅ CRON_SECRET is configured');
}

// Check 2: API Health Check
console.log('\n2️⃣ Testing API health check...');
try {
  const healthResponse = execSync(`curl -s -X GET "${API_BASE}/api/cleanup-tokens"`, { encoding: 'utf-8' });
  const health = JSON.parse(healthResponse);
  
  if (health.success) {
    console.log('   ✅ API health check passed');
    console.log(`   📊 Current tokens: ${health.statistics.total} total, ${health.statistics.used} used`);
  } else {
    console.error('   ❌ API health check failed:', health.message);
  }
} catch (error) {
  console.error('   ❌ Failed to reach API:', error.message);
}

// Check 3: Authentication Test
console.log('\n3️⃣ Testing API authentication...');
if (CLEANUP_SECRET) {
  try {
    const authResponse = execSync(`curl -s -X POST "${API_BASE}/api/cleanup-tokens" \
      -H "Authorization: Bearer ${CLEANUP_SECRET}" \
      -H "Content-Type: application/json" \
      -d '{"action": "stats"}'`, { encoding: 'utf-8' });
    
    const authResult = JSON.parse(authResponse);
    if (authResult.success) {
      console.log('   ✅ API authentication successful');
    } else {
      console.error('   ❌ API authentication failed:', authResult.message);
    }
  } catch (error) {
    console.error('   ❌ Authentication test failed:', error.message);
  }
} else {
  console.log('   ⏭️  Skipping auth test (no CLEANUP_SECRET)');
}

// Check 4: Cron Endpoint Test
console.log('\n4️⃣ Testing cron endpoint...');
if (CRON_SECRET) {
  try {
    const cronResponse = execSync(`curl -s -X GET "${API_BASE}/api/cron/cleanup-tokens" \
      -H "Authorization: Bearer ${CRON_SECRET}"`, { encoding: 'utf-8' });
    
    const cronResult = JSON.parse(cronResponse);
    if (cronResult.success) {
      console.log('   ✅ Cron endpoint accessible');
      console.log(`   📈 Cleanup result: ${cronResult.cleanup.totalDeleted} tokens deleted`);
    } else {
      console.error('   ❌ Cron endpoint failed:', cronResult.message);
    }
  } catch (error) {
    console.error('   ❌ Cron test failed:', error.message);
  }
} else {
  console.log('   ⏭️  Skipping cron test (no CRON_SECRET)');
}

// Check 5: File System Check
console.log('\n5️⃣ Checking required files...');
const requiredFiles = [
  'src/lib/token-cleanup.ts',
  'src/app/api/cleanup-tokens/route.ts',
  'src/app/api/cron/cleanup-tokens/route.ts',
  'scripts/cleanup-existing-tokens.js'
];

requiredFiles.forEach(file => {
  try {
    const fs = require('fs');
    if (fs.existsSync(file)) {
      console.log(`   ✅ ${file} exists`);
    } else {
      console.error(`   ❌ ${file} missing`);
    }
  } catch (error) {
    console.error(`   ❌ Error checking ${file}:`, error.message);
  }
});

console.log('\n🎉 Validation complete!');
console.log('\n💡 Next steps:');
console.log('   1. Fix any ❌ issues above');
console.log('   2. Run: npm run cleanup-tokens:stats');
console.log('   3. Run: npm run cleanup-tokens (for full cleanup)');
console.log('   4. Set up daily cron job for production');
