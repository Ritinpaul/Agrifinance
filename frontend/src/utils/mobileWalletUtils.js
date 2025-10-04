// Mobile Wallet Utility Functions
// Handles UPI-style mobile number wallet operations

import { supabase } from '../lib/supabase';

export class MobileWalletUtils {
  // Format mobile number for wallet ID
  static formatMobileWalletId(phoneNumber) {
    // Remove all non-digit characters except +
    let cleaned = phoneNumber.replace(/[^\d+]/g, '');
    
    // Add + if not present and starts with country code
    if (!cleaned.startsWith('+') && cleaned.length >= 10) {
      if (cleaned.startsWith('91') && cleaned.length === 12) {
        cleaned = '+' + cleaned;
      } else if (cleaned.length === 10) {
        cleaned = '+91' + cleaned;
      }
    }
    
    return cleaned;
  }

  // Validate mobile number format
  static validateMobileNumber(phoneNumber) {
    const formatted = this.formatMobileWalletId(phoneNumber);
    const mobileRegex = /^\+91[6-9]\d{9}$/;
    return {
      valid: mobileRegex.test(formatted),
      formatted: formatted,
      error: mobileRegex.test(formatted) ? null : 'Invalid mobile number format'
    };
  }

  // Create mobile wallet for user
  static async createMobileWallet(userId, phoneNumber, displayName = null) {
    try {
      const validation = this.validateMobileNumber(phoneNumber);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const { data, error } = await supabase.rpc('create_mobile_wallet', {
        p_user_id: userId,
        p_phone_number: validation.formatted,
        p_display_name: displayName || validation.formatted
      });

      if (error) throw error;
      return { success: true, walletId: data };
    } catch (error) {
      console.error('Error creating mobile wallet:', error);
      return { success: false, error: error.message };
    }
  }

  // Find wallet by mobile number
  static async findWalletByMobile(mobileNumber) {
    try {
      const validation = this.validateMobileNumber(mobileNumber);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const { data, error } = await supabase.rpc('find_wallet_by_mobile', {
        mobile_number: validation.formatted
      });

      if (error) throw error;
      return { success: true, wallet: data[0] || null };
    } catch (error) {
      console.error('Error finding wallet:', error);
      return { success: false, error: error.message };
    }
  }

  // Process mobile-to-mobile transfer
  static async transferMobileToMobile(fromMobile, toMobile, amount, description = null) {
    try {
      const fromValidation = this.validateMobileNumber(fromMobile);
      const toValidation = this.validateMobileNumber(toMobile);
      
      if (!fromValidation.valid) {
        throw new Error('Invalid from mobile number: ' + fromValidation.error);
      }
      if (!toValidation.valid) {
        throw new Error('Invalid to mobile number: ' + toValidation.error);
      }

      const { data, error } = await supabase.rpc('process_mobile_transfer', {
        p_from_mobile: fromValidation.formatted,
        p_to_mobile: toValidation.formatted,
        p_amount_wei: amount,
        p_description: description
      });

      if (error) throw error;
      
      if (data.startsWith('ERROR:')) {
        throw new Error(data);
      }
      
      return { 
        success: true, 
        transactionRef: data.replace('SUCCESS: ', ''),
        message: 'Transfer completed successfully'
      };
    } catch (error) {
      console.error('Error processing mobile transfer:', error);
      return { success: false, error: error.message };
    }
  }

  // Get user's mobile wallets
  static async getUserMobileWallets(userId) {
    try {
      const { data, error } = await supabase
        .from('wallet_accounts')
        .select('*')
        .eq('user_id', userId)
        .eq('wallet_type', 'mobile')
        .eq('is_active', true)
        .order('is_primary', { ascending: false });

      if (error) throw error;
      return { success: true, wallets: data };
    } catch (error) {
      console.error('Error getting user mobile wallets:', error);
      return { success: false, error: error.message };
    }
  }

  // Get mobile wallet transaction history
  static async getMobileWalletTransactions(walletId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select(`
          *,
          wallet_accounts!wallet_transactions_wallet_id_fkey(display_name, mobile_wallet_id)
        `)
        .eq('wallet_id', walletId)
        .eq('transaction_method', 'mobile')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { success: true, transactions: data };
    } catch (error) {
      console.error('Error getting mobile wallet transactions:', error);
      return { success: false, error: error.message };
    }
  }

  // Format amount for display (with currency symbol)
  static formatAmount(amountWei, showCurrency = true) {
    const amount = parseFloat(amountWei) / Math.pow(10, 18);
    const formatted = amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    });
    return showCurrency ? `₹${formatted}` : formatted;
  }

  // Format mobile number for display
  static formatMobileDisplay(mobileNumber) {
    const formatted = this.formatMobileWalletId(mobileNumber);
    if (formatted.startsWith('+91')) {
      const number = formatted.substring(3);
      return `+91 ${number.slice(0, 5)} ${number.slice(5)}`;
    }
    return formatted;
  }

  // Generate transaction reference for display
  static formatTransactionRef(transactionRef) {
    if (!transactionRef) return 'N/A';
    return transactionRef.replace('TXN-', '').substring(0, 12) + '...';
  }
}

export default MobileWalletUtils;
