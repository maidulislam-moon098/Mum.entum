#!/usr/bin/env node

/**
 * Generate VAPID keys for Web Push notifications
 * Run: node scripts/generate-vapid-keys.js
 */

import webpush from 'web-push';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔑 Generating VAPID keys for Mum.entum...\n');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('✅ Keys generated successfully!\n');
console.log('Public Key:');
console.log(vapidKeys.publicKey);
console.log('\nPrivate Key:');
console.log(vapidKeys.privateKey);

console.log('\n📝 Add these to your backend/.env file:\n');
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log(`VAPID_SUBJECT=mailto:support@mumentum.app`);

// Optionally write to a .env.example file
const envExample = `# Web Push Notification Keys (VAPID)
# Generate new keys with: node scripts/generate-vapid-keys.js
VAPID_PUBLIC_KEY=${vapidKeys.publicKey}
VAPID_PRIVATE_KEY=${vapidKeys.privateKey}
VAPID_SUBJECT=mailto:support@mumentum.app

# Other environment variables
# OPENAI_API_KEY=your_openai_key_here
# SUPABASE_URL=your_supabase_url
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
`;

const envPath = path.join(__dirname, '..', 'backend', '.env.example');

try {
  fs.writeFileSync(envPath, envExample);
  console.log(`\n✅ Created ${envPath}`);
  console.log('Copy this to .env and fill in other variables');
} catch (error) {
  console.error('\n⚠️  Could not write .env.example:', error.message);
}

console.log('\n⚠️  IMPORTANT: Keep these keys secret! Never commit them to git.\n');
