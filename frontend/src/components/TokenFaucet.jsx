// frontend/src/components/TokenFaucet.jsx
import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { useAuth } from '../context/AuthContext';
import { ethers } from 'ethers';
import { toast } from 'react-hot-toast';
import apiClient from '../lib/api';

const TokenFaucet = ({ className = "" }) => {
  const { account, contract, krishiTokenContract } = useWeb3();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [depositLoading, setDepositLoading] = useState(false);
  const [inAppBalance, setInAppBalance] = useState('0');
  const [faucetData, setFaucetData] = useState({
    balance: '0',
    lastClaim: 0,
    claimCooldown: 24 * 60 * 60,
    maxClaimAmount: '10',
    maxClaimAmountWei: ethers.parseUnits('10', 6).toString(),
    totalDistributed: '0'
  });

  useEffect(() => {
    if (user?.id) {
      loadInAppBalance();
    }
  }, [user]);

  const loadInAppBalance = async () => {
    try {
      // Load actual wallet balance from database
      const result = await apiClient.getWallet();
      if (result.data && result.data.wallet) {
        const balanceWei = result.data.wallet.balance_wei || '0';
        const balanceEther = ethers.formatUnits(balanceWei, 6);
        setInAppBalance(balanceEther);
      } else {
        setInAppBalance('0');
      }
    } catch (error) {
      console.error('Error loading in-app balance:', error);
      setInAppBalance('0');
    }
  };

  const claimTokens = async () => {
    if (!user?.id) {
      toast.error('Please sign in first');
      return;
    }

    setLoading(true);
    try {
      // Get current wallet balance
      const walletResult = await apiClient.getWallet();
      if (!walletResult.data || !walletResult.data.wallet) {
        throw new Error('No in-app wallet found. Please create a wallet first.');
      }

      const currentBalanceWei = walletResult.data.wallet.balance_wei || '0';
      const claimAmountWei = ethers.parseUnits('10', 6).toString(); // Claim 10 KRSI with 6 decimals
      const newBalanceWei = (BigInt(currentBalanceWei) + BigInt(claimAmountWei)).toString();

      // Update wallet balance in database
      const updateResult = await apiClient.syncWallet({
        address: walletResult.data.wallet.address,
        balance_wei: newBalanceWei,
        metadata: walletResult.data.wallet.metadata
      });

      if (updateResult.error) {
        throw new Error(updateResult.error);
      }

      toast.success('10 KRSI tokens claimed successfully!');
      loadInAppBalance(); // Refresh the balance display
    } catch (error) {
      console.error('Error claiming tokens:', error);
      toast.error('Failed to claim tokens');
    } finally {
      setLoading(false);
    }
  };

  const depositToInAppWallet = async () => {
    if (!user?.id) {
      toast.error('Please sign in first');
      return;
    }

    setDepositLoading(true);
    try {
      // Get current wallet balance
      const walletResult = await apiClient.getWallet();
      if (!walletResult.data || !walletResult.data.wallet) {
        throw new Error('No in-app wallet found. Please create a wallet first.');
      }

      const currentBalanceWei = walletResult.data.wallet.balance_wei || '0';
      const depositAmountWei = ethers.parseUnits('5', 6).toString(); // Deposit 5 KRSI with 6 decimals
      const newBalanceWei = (BigInt(currentBalanceWei) + BigInt(depositAmountWei)).toString();

      // Update wallet balance in database
      const updateResult = await apiClient.syncWallet({
        address: walletResult.data.wallet.address,
        balance_wei: newBalanceWei,
        metadata: walletResult.data.wallet.metadata
      });

      if (updateResult.error) {
        throw new Error(updateResult.error);
      }

      toast.success('5 KRSI deposited to in-app wallet!');
      loadInAppBalance(); // Refresh the balance display
    } catch (error) {
      console.error('Error depositing tokens:', error);
      toast.error('Failed to deposit tokens');
    } finally {
      setDepositLoading(false);
    }
  };

  const canClaim = () => {
    const now = Math.floor(Date.now() / 1000);
    return now - faucetData.lastClaim >= faucetData.claimCooldown;
  };

  const timeUntilNextClaim = () => {
    const now = Math.floor(Date.now() / 1000);
    const timeLeft = faucetData.claimCooldown - (now - faucetData.lastClaim);
    if (timeLeft <= 0) return '0';
    
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Token Faucet
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Get free KRSI tokens for testing
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            Faucet Balance
          </h3>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {ethers.formatUnits(faucetData.balance, 6)} KRSI
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            Your In-App Balance
          </h3>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {inAppBalance} KRSI
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={claimTokens}
            disabled={loading || !canClaim() || !user?.id}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
          >
            {loading ? 'Claiming...' : `Claim ${faucetData.maxClaimAmount} KRSI`}
          </button>

          <button
            onClick={depositToInAppWallet}
            disabled={depositLoading || !user?.id}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
          >
            {depositLoading ? 'Depositing...' : 'Deposit to In-App Wallet'}
          </button>
        </div>

        {!canClaim() && (
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            Next claim available in: {timeUntilNextClaim()}
          </div>
        )}

        {!user?.id && (
          <div className="text-center text-sm text-yellow-600 dark:text-yellow-400">
            Please sign in to use the token faucet
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenFaucet;