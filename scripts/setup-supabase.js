#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 AgriFinance Supabase Setup');
console.log('============================\n');

// Create frontend .env
const frontendEnvPath = path.join(__dirname, '..', 'frontend', '.env');
const frontendEnvContent = `# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Development OTP Code (optional - for testing)
VITE_DEV_OTP_CODE=123456
`;

if (!fs.existsSync(frontendEnvPath)) {
  fs.writeFileSync(frontendEnvPath, frontendEnvContent);
  console.log('✅ Created frontend/.env');
} else {
  console.log('⚠️  frontend/.env already exists');
}

// Create admin-frontend .env
const adminEnvPath = path.join(__dirname, '..', 'admin-frontend', '.env');
const adminEnvContent = `# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
`;

if (!fs.existsSync(adminEnvPath)) {
  fs.writeFileSync(adminEnvPath, adminEnvContent);
  console.log('✅ Created admin-frontend/.env');
} else {
  console.log('⚠️  admin-frontend/.env already exists');
}

console.log('\n📋 Next Steps:');
console.log('1. Go to https://supabase.com and create a new project');
console.log('2. Get your Project URL and anon key from Settings → API');
console.log('3. Update the .env files with your actual Supabase credentials');
console.log('4. Run the SQL script from SUPABASE_SETUP.md in your Supabase SQL Editor');
console.log('5. Start your frontend: npm run dev');
console.log('\n📖 See SUPABASE_SETUP.md for detailed instructions');
