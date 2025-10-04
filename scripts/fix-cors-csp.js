#!/usr/bin/env node

console.log('🔧 AgriFinance CORS & CSP Fix');
console.log('==============================\n');

console.log('✅ Fixed Content Security Policy in HTML files');
console.log('✅ Added Google Fonts to CSP whitelist');
console.log('✅ Updated both frontend and admin-frontend\n');

console.log('🎯 NEXT STEPS - Fix Supabase CORS Settings:');
console.log('1. Go to: https://supabase.com/dashboard/project/szvslhwyddmcpepfirsh');
console.log('2. Navigate to: Settings → API');
console.log('3. Find: "CORS" or "Allowed Origins" section');
console.log('4. Add these URLs:');
console.log('   - http://localhost:5173');
console.log('   - http://localhost:5175');
console.log('   - http://127.0.0.1:5173');
console.log('   - http://127.0.0.1:5175');
console.log('5. Save the settings');
console.log('6. Wait 1-2 minutes for changes to propagate');
console.log('7. Test signup again\n');

console.log('🔍 If CORS settings are not visible:');
console.log('- Go to Authentication → Settings');
console.log('- Check "Site URL" is set to: http://localhost:5173');
console.log('- Check "Redirect URLs" includes: http://localhost:5173/**');
console.log('- Disable "Enable email confirmations" for development\n');

console.log('📋 Additional Supabase Settings to Check:');
console.log('- Authentication → Settings → Site URL: http://localhost:5173');
console.log('- Authentication → Settings → Redirect URLs: http://localhost:5173/**');
console.log('- Authentication → Settings → Email Confirmations: DISABLED');
console.log('- Authentication → Settings → Phone Confirmations: DISABLED\n');

console.log('🔄 After making changes:');
console.log('1. Restart your frontend servers');
console.log('2. Clear browser cache (Ctrl+Shift+R)');
console.log('3. Test signup again');
console.log('4. Check browser console for any remaining errors\n');

console.log('📞 If issues persist:');
console.log('- Check Supabase logs in dashboard');
console.log('- Verify database tables exist (run the SQL script)');
console.log('- Test with a different browser or incognito mode');
