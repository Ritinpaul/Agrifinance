// admin-frontend/src/lib/supabase.js
// This file is kept for backward compatibility but is no longer used
// All data now comes from the NeonDB backend API at localhost:3001

import adminApi from './api';

// Export stub for any remaining references
export const supabase = null;

// Table names (kept for reference)
export const TABLES = {
  USERS: 'users',
  NFTS: 'nfts',
  WALLET_ACCOUNTS: 'wallet_accounts',
  DAO_PROPOSALS: 'dao_proposals',
  FARMER_BATCHES: 'farmer_batches',
  ADMIN_APPROVALS: 'admin_approvals'
};

// Redirect to adminApi for all operations
export default adminApi;
