const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

console.log('🔍 AgriFinance Database Diagnostic Tool');
console.log('=====================================\n');

// Read environment variables
const frontendEnvPath = path.join(__dirname, '..', 'frontend', '.env');
let supabaseUrl = '';
let supabaseKey = '';

if (fs.existsSync(frontendEnvPath)) {
  const envContent = fs.readFileSync(frontendEnvPath, 'utf8');
  const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.+)/);
  const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/);
  
  if (urlMatch) supabaseUrl = urlMatch[1].trim();
  if (keyMatch) supabaseKey = keyMatch[1].trim();
}

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project') || supabaseKey.includes('your-anon')) {
  console.log('❌ Invalid Supabase credentials in frontend/.env');
  console.log('Please update your .env file with real Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabase() {
  console.log('📊 Testing Database Connection...');
  
  try {
    // Test 1: Check if tables exist
    console.log('\n1️⃣ Checking table existence...');
    const tables = ['users', 'farmers', 'lenders', 'buyers', 'admin_users'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1);
        
        if (error) {
          console.log(`   ❌ Table '${table}': ${error.message}`);
        } else {
          console.log(`   ✅ Table '${table}': Exists`);
        }
      } catch (err) {
        console.log(`   ❌ Table '${table}': ${err.message}`);
      }
    }

    // Test 2: Check RLS policies
    console.log('\n2️⃣ Testing RLS policies...');
    
    // Test without authentication (should fail)
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          user_id: '00000000-0000-0000-0000-000000000000',
          email: 'test@example.com',
          first_name: 'Test',
          last_name: 'User',
          role: 'user'
        }])
        .select();
      
      if (error) {
        console.log(`   ✅ RLS working: ${error.message}`);
      } else {
        console.log(`   ⚠️  RLS might be disabled: Insert succeeded without auth`);
      }
    } catch (err) {
      console.log(`   ✅ RLS working: ${err.message}`);
    }

    // Test 3: Check auth.uid() function
    console.log('\n3️⃣ Testing auth.uid() function...');
    try {
      const { data, error } = await supabase.rpc('auth_uid_test');
      if (error) {
        console.log(`   ⚠️  auth.uid() test failed: ${error.message}`);
      } else {
        console.log(`   ✅ auth.uid() function available`);
      }
    } catch (err) {
      console.log(`   ⚠️  auth.uid() test failed: ${err.message}`);
    }

    // Test 4: Check system settings
    console.log('\n4️⃣ Checking system settings...');
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .limit(5);
      
      if (error) {
        console.log(`   ❌ System settings error: ${error.message}`);
      } else {
        console.log(`   ✅ System settings: ${data.length} records found`);
      }
    } catch (err) {
      console.log(`   ❌ System settings error: ${err.message}`);
    }

    console.log('\n🎯 DIAGNOSIS COMPLETE');
    console.log('====================');
    console.log('If tables exist but RLS is working, the issue might be:');
    console.log('1. Email confirmation is enabled in Supabase Auth settings');
    console.log('2. auth.uid() returns null during signup process');
    console.log('3. RLS policies are too restrictive');
    console.log('\nNext steps:');
    console.log('1. Go to Supabase Dashboard → Authentication → Settings');
    console.log('2. Disable "Confirm email" if you want immediate signup');
    console.log('3. Or ensure SMTP is configured for email confirmations');

  } catch (error) {
    console.log(`❌ Database test failed: ${error.message}`);
  }
}

// Create a simple auth.uid() test function
async function createAuthTestFunction() {
  console.log('\n🔧 Creating auth.uid() test function...');
  
  const sql = `
    CREATE OR REPLACE FUNCTION auth_uid_test()
    RETURNS TEXT AS $$
    BEGIN
      RETURN COALESCE(auth.uid()::text, 'NULL');
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql });
    if (error) {
      console.log(`   ⚠️  Could not create test function: ${error.message}`);
    } else {
      console.log(`   ✅ Test function created`);
    }
  } catch (err) {
    console.log(`   ⚠️  Could not create test function: ${err.message}`);
  }
}

testDatabase();








