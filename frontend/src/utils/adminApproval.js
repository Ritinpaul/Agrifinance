import { ethers } from 'ethers';

/**
 * Admin Approval Service
 * Handles regulatory compliance by requiring admin approval for sensitive transactions
 */

export class AdminApprovalService {
  constructor(supabase, web3Context) {
    this.supabase = supabase;
    this.web3 = web3Context;
  }

  /**
   * Request NFT purchase approval
   */
  async requestNFTPurchase(nftData, buyerAddress, price) {
    try {
      const { data, error } = await this.supabase
        .from('admin_approvals')
        .insert([{
          user_id: nftData.userId,
          transaction_type: 'nft_purchase',
          status: 'pending',
          request_data: {
            nftId: nftData.id,
            tokenId: nftData.tokenId,
            sellerAddress: nftData.owner_address,
            buyerAddress: buyerAddress,
            price: price,
            nftData: nftData
          }
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error requesting NFT purchase approval:', error);
      throw error;
    }
  }

  /**
   * Request NFT minting approval
   */
  async requestNFTMint(mintData, farmerAddress) {
    try {
      const { data, error } = await this.supabase
        .from('admin_approvals')
        .insert([{
          user_id: mintData.userId,
          transaction_type: 'nft_mint',
          status: 'pending',
          request_data: {
            location: mintData.location,
            landSize: mintData.landSize,
            metadata: mintData.metadata,
            farmerAddress: farmerAddress,
            mintData: mintData
          }
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error requesting NFT mint approval:', error);
      throw error;
    }
  }

  /**
   * Request withdrawal approval
   */
  async requestWithdrawal(withdrawalData, userAddress) {
    try {
      const { data, error } = await this.supabase
        .from('admin_approvals')
        .insert([{
          user_id: withdrawalData.userId,
          transaction_type: 'withdrawal',
          status: 'pending',
          request_data: {
            amount: withdrawalData.amount,
            tokenSymbol: withdrawalData.tokenSymbol,
            fromAddress: userAddress,
            toAddress: withdrawalData.toAddress,
            withdrawalData: withdrawalData
          }
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error requesting withdrawal approval:', error);
      throw error;
    }
  }

  /**
   * Get pending approvals for admin dashboard
   */
  async getPendingApprovals() {
    try {
      const { data, error } = await this.supabase
        .from('admin_approvals')
        .select(`
          *,
          users:user_id (
            email,
            first_name,
            last_name
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      return [];
    }
  }

  /**
   * Approve a transaction (admin only)
   */
  async approveTransaction(approvalId, adminUserId, notes = '') {
    try {
      // Update approval status
      const { data: approval, error: updateError } = await this.supabase
        .from('admin_approvals')
        .update({
          status: 'approved',
          approved_by: adminUserId,
          approved_at: new Date().toISOString(),
          admin_notes: notes
        })
        .eq('id', approvalId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Execute the transaction based on type
      let txHash = null;
      switch (approval.transaction_type) {
        case 'nft_purchase':
          txHash = await this.executeNFTPurchase(approval.request_data);
          break;
        case 'nft_mint':
          txHash = await this.executeNFTMint(approval.request_data);
          break;
        case 'withdrawal':
          txHash = await this.executeWithdrawal(approval.request_data);
          break;
        default:
          throw new Error(`Unknown transaction type: ${approval.transaction_type}`);
      }

      // Update approval with transaction hash
      await this.supabase
        .from('admin_approvals')
        .update({
          blockchain_tx_hash: txHash,
          status: 'executed'
        })
        .eq('id', approvalId);

      return { approval, txHash };
    } catch (error) {
      console.error('Error approving transaction:', error);
      throw error;
    }
  }

  /**
   * Reject a transaction (admin only)
   */
  async rejectTransaction(approvalId, adminUserId, reason = '') {
    try {
      const { data, error } = await this.supabase
        .from('admin_approvals')
        .update({
          status: 'rejected',
          approved_by: adminUserId,
          approved_at: new Date().toISOString(),
          admin_notes: reason
        })
        .eq('id', approvalId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error rejecting transaction:', error);
      throw error;
    }
  }

  /**
   * Execute NFT purchase on blockchain
   */
  async executeNFTPurchase(requestData) {
    try {
      const { nftData, buyerAddress, price } = requestData;
      const priceWei = ethers.parseEther(price.toString());
      
      const tx = await this.web3.buyNFT(nftData.tokenId, priceWei);
      
      // Update NFT ownership in database
      await this.supabase
        .from('nft_lands')
        .update({
          owner_address: buyerAddress,
          is_for_sale: false,
          blockchain_tx_hash: tx.hash,
          updated_at: new Date().toISOString()
        })
        .eq('id', nftData.id);

      return tx.hash;
    } catch (error) {
      console.error('Error executing NFT purchase:', error);
      throw error;
    }
  }

  /**
   * Execute NFT minting on blockchain
   */
  async executeNFTMint(requestData) {
    try {
      const { mintData, farmerAddress } = requestData;
      
      // This would call the NFTLand contract's mint function
      // For now, we'll simulate it and update the database
      const txHash = `0x${Math.random().toString(16).substr(2, 40)}`; // Simulated hash
      
      // Update NFT in database
      await this.supabase
        .from('nft_lands')
        .update({
          blockchain_tx_hash: txHash,
          owner_address: farmerAddress,
          updated_at: new Date().toISOString()
        })
        .eq('id', mintData.id);

      return txHash;
    } catch (error) {
      console.error('Error executing NFT mint:', error);
      throw error;
    }
  }

  /**
   * Execute withdrawal on blockchain
   */
  async executeWithdrawal(requestData) {
    try {
      const { amount, tokenSymbol, fromAddress, toAddress } = requestData;
      
      // This would execute the actual token transfer
      // For now, we'll simulate it
      const txHash = `0x${Math.random().toString(16).substr(2, 40)}`; // Simulated hash
      
      // Update wallet transaction status
      await this.supabase
        .from('wallet_transactions')
        .update({
          status: 'confirmed',
          blockchain_tx_hash: txHash,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', requestData.withdrawalData.userId)
        .eq('status', 'requested');

      return txHash;
    } catch (error) {
      console.error('Error executing withdrawal:', error);
      throw error;
    }
  }

  /**
   * Get user's approval requests
   */
  async getUserApprovals(userId) {
    try {
      const { data, error } = await this.supabase
        .from('admin_approvals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user approvals:', error);
      return [];
    }
  }
}

/**
 * Hook for using admin approval service
 */
export const useAdminApproval = (supabase, web3Context) => {
  return new AdminApprovalService(supabase, web3Context);
};
