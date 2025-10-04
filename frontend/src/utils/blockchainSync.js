import { ethers } from 'ethers';

/**
 * Blockchain synchronization utilities
 * Ensures database stays in sync with on-chain state
 */

export class BlockchainSync {
  constructor(supabase, provider, contractAddresses) {
    this.supabase = supabase;
    this.provider = provider;
    this.contractAddresses = contractAddresses;
  }

  /**
   * Get block explorer URL for a transaction hash
   */
  getBlockExplorerUrl(txHash, chainId = '80002') {
    const explorers = {
      '80002': 'https://amoy.polygonscan.com/tx/', // Amoy testnet
      '137': 'https://polygonscan.com/tx/', // Polygon mainnet
      '1': 'https://etherscan.io/tx/', // Ethereum mainnet
    };
    return `${explorers[chainId] || explorers['80002']}${txHash}`;
  }

  /**
   * Record a blockchain transaction in the database
   */
  async recordTransaction({
    userId,
    txHash,
    transactionType,
    fromAddress,
    toAddress,
    amount,
    tokenSymbol = 'KRSI',
    gasUsed,
    gasPrice,
    status = 'pending',
    relatedTable = null,
    relatedId = null,
    metadata = {}
  }) {
    try {
      const { data, error } = await this.supabase
        .from('blockchain_transactions')
        .insert([{
          user_id: userId,
          tx_hash: txHash,
          transaction_type: transactionType,
          from_address: fromAddress,
          to_address: toAddress,
          amount: amount,
          token_symbol: tokenSymbol,
          gas_used: gasUsed,
          gas_price: gasPrice,
          status: status,
          related_table: relatedTable,
          related_id: relatedId,
          metadata: metadata
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error recording blockchain transaction:', error);
      throw error;
    }
  }

  /**
   * Update transaction status after confirmation
   */
  async updateTransactionStatus(txHash, status, blockNumber = null, gasUsed = null) {
    try {
      const updateData = { status, updated_at: new Date().toISOString() };
      if (blockNumber) updateData.block_number = blockNumber;
      if (gasUsed) updateData.gas_used = gasUsed;

      const { data, error } = await this.supabase
        .from('blockchain_transactions')
        .update(updateData)
        .eq('tx_hash', txHash)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating transaction status:', error);
      throw error;
    }
  }

  /**
   * Get user's transaction history
   */
  async getUserTransactions(userId, limit = 50) {
    try {
      const { data, error } = await this.supabase
        .from('blockchain_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user transactions:', error);
      return [];
    }
  }

  /**
   * Verify transaction on blockchain
   */
  async verifyTransaction(txHash) {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      if (!receipt) {
        return { status: 'pending', confirmed: false };
      }

      return {
        status: receipt.status === 1 ? 'confirmed' : 'failed',
        confirmed: true,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        blockExplorerUrl: this.getBlockExplorerUrl(txHash)
      };
    } catch (error) {
      console.error('Error verifying transaction:', error);
      return { status: 'pending', confirmed: false };
    }
  }

  /**
   * Sync pending transactions with blockchain
   */
  async syncPendingTransactions() {
    try {
      const { data: pendingTxs, error } = await this.supabase
        .from('blockchain_transactions')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .limit(20);

      if (error) throw error;

      for (const tx of pendingTxs || []) {
        const verification = await this.verifyTransaction(tx.tx_hash);
        if (verification.confirmed) {
          await this.updateTransactionStatus(
            tx.tx_hash,
            verification.status,
            verification.blockNumber,
            verification.gasUsed
          );
        }
      }
    } catch (error) {
      console.error('Error syncing pending transactions:', error);
    }
  }

  /**
   * Format transaction for display
   */
  formatTransaction(tx) {
    return {
      ...tx,
      blockExplorerUrl: this.getBlockExplorerUrl(tx.tx_hash),
      formattedAmount: tx.amount ? Number(tx.amount).toLocaleString() : '0',
      formattedGasUsed: tx.gas_used ? Number(tx.gas_used).toLocaleString() : '0',
      statusColor: this.getStatusColor(tx.status),
      typeLabel: this.getTransactionTypeLabel(tx.transaction_type)
    };
  }

  getStatusColor(status) {
    const colors = {
      'pending': 'text-yellow-600',
      'confirmed': 'text-green-600',
      'failed': 'text-red-600'
    };
    return colors[status] || 'text-gray-600';
  }

  getTransactionTypeLabel(type) {
    const labels = {
      'nft_purchase': 'NFT Purchase',
      'nft_transfer': 'NFT Transfer',
      'staking': 'Staking',
      'unstaking': 'Unstaking',
      'token_transfer': 'Token Transfer',
      'withdrawal': 'Withdrawal',
      'deposit': 'Deposit'
    };
    return labels[type] || type;
  }
}

/**
 * Hook for using blockchain sync utilities
 */
export const useBlockchainSync = (supabase, provider, contractAddresses) => {
  return new BlockchainSync(supabase, provider, contractAddresses);
};
