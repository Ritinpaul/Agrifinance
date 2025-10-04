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

  // Auto-format phone number input with +91 prefix - FIXED TO PREVENT DUPLICATES
  static autoFormatPhoneInput(value) {
    // If already has +91 prefix, don't add it again
    if (value.includes('+91')) {
      // Extract digits after +91
      const afterPrefix = value.replace(/^\+91\s*/, '');
      const cleanDigits = afterPrefix.replace(/\D/g, '');
      
      // Limit to 10 digits
      const limitedDigits = cleanDigits.slice(0, 10);
      return '+91 ' + limitedDigits;
    }
    
    // Remove all non-digit characters
    let digits = value.replace(/\D/g, '');
    
    // If empty, return empty
    if (!digits) return '';
    
    // If starts with 91 and has 12 digits, format as +91
    if (digits.startsWith('91') && digits.length === 12) {
      return '+91 ' + digits.slice(2);
    }
    
    // If has 10 digits, add +91 prefix
    if (digits.length === 10) {
      return '+91 ' + digits;
    }
    
    // If starts with 91 and has more than 12 digits, keep only first 12
    if (digits.startsWith('91') && digits.length > 12) {
      return '+91 ' + digits.slice(2, 12);
    }
    
    // For partial input, limit to 10 digits and add +91 prefix
    const limitedDigits = digits.slice(0, 10);
    return '+91 ' + limitedDigits;
  }

  // Handle phone input change with auto-formatting
  static handlePhoneInputChange(event, setFormData) {
    const { name, value } = event.target;
    const formattedValue = this.autoFormatPhoneInput(value);
    
    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
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
      // For now, return error since mobile wallet functionality is not fully implemented
      console.log('Mobile wallet creation not yet implemented');
      return { success: false, error: 'Mobile wallet functionality not yet implemented' };
      
      /* Original implementation - commented out until database schema is updated
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
      */
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
      // For now, return error since mobile wallet functionality is not fully implemented
      console.log('Mobile transfer not yet implemented');
      return { success: false, error: 'Mobile wallet functionality not yet implemented' };
      
      /* Original implementation - commented out until database schema is updated
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
      */
    } catch (error) {
      console.error('Error processing mobile transfer:', error);
      return { success: false, error: error.message };
    }
  }

  // Get user's mobile wallets
  static async getUserMobileWallets(userId) {
    try {
      // For now, return empty array since mobile wallet functionality is not fully implemented
      // This prevents the loading from hanging
      console.log('Mobile wallet functionality not yet implemented');
      return { success: true, wallets: [] };
      
      /* Original implementation - commented out until database schema is updated
      const { data, error } = await supabase
        .from('wallet_accounts')
        .select('*')
        .eq('user_id', userId)
        .eq('wallet_type', 'mobile')
        .eq('is_active', true)
        .order('is_primary', { ascending: false });

      if (error) throw error;
      return { success: true, wallets: data };
      */
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
