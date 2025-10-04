#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🗑️ AgriFinance Database Cleanup');
console.log('================================\n');

console.log('⚠️  WARNING: This will DELETE ALL DATA in your Supabase database!');
console.log('📋 This script will:');
console.log('   - Drop all existing tables');
console.log('   - Recreate all tables with proper schema');
console.log('   - Set up Row Level Security policies');
console.log('   - Insert default system settings');
console.log('   - Create performance indexes\n');

console.log('📝 To proceed:');
console.log('1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/szvslhwyddmcpepfirsh');
console.log('2. Navigate to SQL Editor (left sidebar)');
console.log('3. Copy the contents of scripts/cleanup-database.sql');
console.log('4. Paste and run the SQL script');
console.log('5. Wait for completion (should show success message)');
console.log('6. Test user signup again\n');

console.log('📄 SQL Script Location: scripts/cleanup-database.sql');
console.log('🔗 Supabase Dashboard: https://supabase.com/dashboard/project/szvslhwyddmcpepfirsh');

// Read and display the SQL script
const sqlPath = path.join(__dirname, 'cleanup-database.sql');
if (fs.existsSync(sqlPath)) {
  console.log('\n📋 SQL Script Preview (first 500 characters):');
  console.log('=' .repeat(50));
  const sqlContent = fs.readFileSync(sqlPath, 'utf8');
  console.log(sqlContent.substring(0, 500) + '...');
  console.log('=' .repeat(50));
  console.log(`\n📊 Total script size: ${sqlContent.length} characters`);
  console.log('📁 Full script available at: scripts/cleanup-database.sql');
} else {
  console.log('❌ SQL script not found at scripts/cleanup-database.sql');
}
