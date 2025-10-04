import { createClient } from '@supabase/supabase-js'

// Supabase configuration - FIXED VALUES
const supabaseUrl = 'https://szvslhwyddmcpepfirsh.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6dnNsaHd5ZGRtY3BlcGZpcnNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MzA1NzQsImV4cCI6MjA2NzQwNjU3NH0.48R7nqZ-z4BAy3KAhpiEJWT9mhpB6h9WZnTSh3Er-ug'

// Check if we have valid configuration
if (!supabaseUrl || !supabaseAnonKey || supabaseAnonKey.includes('YOUR_ACTUAL_ANON_KEY_HERE')) {
  console.error('❌ Supabase configuration missing!');
  console.error('Please update the supabaseAnonKey in frontend/src/lib/supabase.js');
  console.error('Get your anon key from: https://supabase.com/dashboard/project/szvslhwyddmcpepfirsh/settings/api');
} else {
  console.log('✅ Supabase configuration loaded successfully!');
}

console.log('Supabase config:', { 
  url: supabaseUrl, 
  hasKey: !!supabaseAnonKey,
  keyLength: supabaseAnonKey?.length
});

// Create Supabase client with retry configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'supabase.auth.agrifinance',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'agrifinance-frontend'
    }
  },
  db: {
    schema: 'public'
  }
})

// Test Supabase connection
export const testSupabaseConnection = async () => {
  try {
    console.log('🔍 Testing Supabase connection...');
    const { data, error } = await supabase.auth.getSession();
    console.log('Supabase connection test result:', { data, error });
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
      return false;
    } else {
      console.log('✅ Supabase connection successful!');
      return true;
    }
  } catch (err) {
    console.error('❌ Supabase connection error:', err);
    return false;
  }
}

// Database table names (simplified schema)
export const TABLES = {
  USERS: 'users',
  LOANS: 'loans',
  BATCHES: 'batches',
  NFT_LANDS: 'nft_lands',
  SUPPLY_CHAIN: 'supply_chain',
  CREDIT_SCORES: 'credit_scores',
  TRANSACTIONS: 'transactions',
  SYSTEM_SETTINGS: 'system_settings',
  WALLET_ACCOUNTS: 'wallet_accounts',
  WALLET_TRANSACTIONS: 'wallet_transactions',
  ADMIN_APPROVALS: 'admin_approvals',
  BLOCKCHAIN_TRANSACTIONS: 'blockchain_transactions',
  STAKING_POSITIONS: 'staking_positions'
}

// Helper functions
export const supabaseHelpers = {
  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // Get user session
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },

  // Sign up with email
  async signUp(email, password, userData = {}) {
    console.log('supabaseHelpers.signUp called with:', { email, password: '***', userData });
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
        emailRedirectTo: `${window.location.origin}/signin`
      }
    })
    console.log('supabase.auth.signUp response:', { data, error });
    return { data, error }
  },

  // Sign in with email
  async signIn(email, password) {
    console.log('Supabase signIn called with:', { email, password: '***' });
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    console.log('Supabase signIn response:', { data, error });
    return { data, error }
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Reset password
  async resetPassword(email) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email)
    return { data, error }
  },

  // Update password
  async updatePassword(newPassword) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    })
    return { data, error }
  },

  // Sign in with phone OTP - send OTP
  async sendSmsOtp(phoneNumber) {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: phoneNumber
    })
    return { data, error }
  },

  // Verify phone OTP
  async verifySmsOtp(phoneNumber, token) {
    const { data, error } = await supabase.auth.verifyOtp({
      phone: phoneNumber,
      token,
      type: 'sms'
    })
    return { data, error }
  },

  // Send Email OTP / Magic Link
  async sendEmailMagicLink(email) {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      }
    })
    return { data, error }
  },

  // Dev-only sign in helper: accepts a fixed code and creates a session via email/passwordless if available
  async devOverrideSignIn(email) {
    // For development demo: trigger email OTP so Supabase can create a user if missing
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      }
    })
    return { data, error }
  }
}
