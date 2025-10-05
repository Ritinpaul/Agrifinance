// frontend/src/pages/Staking.jsx
import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useAuth } from '../context/AuthContext';
import { useWeb3 } from '../context/Web3Context';
import { useBlockchainSync } from '../utils/blockchainSync';
import { DecimalUtils, AmountValidation } from '../utils/decimalUtils';
import apiClient from '../lib/api';
import toast from 'react-hot-toast';

const Staking = () => {
  const { user } = useAuth();
  const { account, krishiTokenContract, stakeTokens, unstakeTokens, claimStakingRewards, isConnected, provider } = useWeb3();
  const blockchainSync = useBlockchainSync(provider, {});

  const [positions, setPositions] = useState([]);
  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState('');
  const [lockDays, setLockDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stakingData, setStakingData] = useState(null);
  const [walletBalance, setWalletBalance] = useState('0');

  const loadPositions = async () => {
    setLoading(true);
    try {
      // Load staking data from blockchain via backend
      const result = await apiClient.getStakingData();
      
      if (result.data && result.data.success) {
        setStakingData(result.data);
        setPositions(result.data.stakes || []);
      } else {
        console.error('Failed to load staking data:', result.error);
        setPositions([]);
      }

      // Load wallet balance
      const walletResult = await apiClient.getWallet();
      if (walletResult.data && walletResult.data.wallet) {
        setWalletBalance(walletResult.data.wallet.balance_wei);
      }
    } catch (error) {
      console.error('Error loading positions:', error);
      setPositions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadPositions();
    }
  }, [user]);

  const handleStake = async () => {
    if (!amount || amountError) return;
    
    setIsSubmitting(true);
    try {
      // Convert amount to wei
      const amountWei = ethers.parseUnits(amount, 6).toString(); // Use 6 decimals
      const lockPeriodSeconds = lockDays * 24 * 60 * 60; // Convert days to seconds
      
      // Execute hybrid staking (blockchain + database)
      const result = await apiClient.stakeTokens({
        amount_wei: amountWei,
        lock_period_seconds: lockPeriodSeconds
      });

      if (result.data) {
        toast.success('Tokens staked successfully!');
        console.log('Staking transaction:', result.data);
        
        // Reload positions
        await loadPositions();
        
        // Clear form
        setAmount('');
        setAmountError('');
      } else {
        toast.error(result.error || 'Staking failed');
      }
    } catch (error) {
      console.error('Error staking:', error);
      toast.error('Staking failed: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnstake = async (stakeIndex) => {
    setIsSubmitting(true);
    try {
      // Execute unstaking on blockchain
      const tx = await unstakeTokens(stakeIndex);
      
      if (tx) {
        toast.success('Tokens unstaked successfully!');
        console.log('Unstaking transaction:', tx);
        
        // Reload positions
        await loadPositions();
      }
    } catch (error) {
      console.error('Error unstaking:', error);
      toast.error('Unstaking failed: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClaimRewards = async () => {
    setIsSubmitting(true);
    try {
      // Execute reward claiming on blockchain
      const tx = await claimStakingRewards();
      
      if (tx) {
        toast.success('Rewards claimed successfully!');
        console.log('Claim rewards transaction:', tx);
        
        // Reload positions
        await loadPositions();
      }
    } catch (error) {
      console.error('Error claiming rewards:', error);
      toast.error('Claiming rewards failed: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSyncWithBlockchain = async () => {
    try {
      const result = await apiClient.syncWithBlockchain();
      
      if (result.data) {
        toast.success('Wallet synced with blockchain!');
        await loadPositions();
      } else {
        toast.error(result.error || 'Sync failed');
      }
    } catch (error) {
      console.error('Error syncing:', error);
      toast.error('Sync failed: ' + error.message);
    }
  };

  const validateAmount = (value) => {
    const validation = AmountValidation.validateAmount(value);
    
    // Additional validation: check against wallet balance
    if (validation.isValid && value) {
      const amountWei = ethers.parseUnits(value, 6).toString();
      const currentBalance = BigInt(walletBalance);
      const stakeAmount = BigInt(amountWei);
      
      if (stakeAmount > currentBalance) {
        setAmountError(`Insufficient balance. You have ${ethers.formatUnits(walletBalance, 6)} KRSI`);
        return false;
      }
      
      // Check minimum staking amount (1 KRSI with 6 decimals)
      const minimumStake = BigInt('1000000'); // 1 KRSI with 6 decimals
      if (stakeAmount < minimumStake) {
        setAmountError('Minimum staking amount is 1 KRSI');
        return false;
      }
    }
    
    setAmountError(validation.error);
    return validation.isValid;
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setAmount(value);
    validateAmount(value);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Please sign in to access staking
            </h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Staking Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Stake your KRSI tokens and earn rewards
          </p>
          
          {/* Sync Button */}
          <button
            onClick={handleSyncWithBlockchain}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
          >
            🔄 Sync with Blockchain
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Stake Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Stake Tokens
            </h2>
            
            <div className="space-y-4">
              {/* Balance Display */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Available Balance:
                  </span>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    {ethers.formatUnits(walletBalance, 6)} KRSI
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount (KRSI)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="Enter amount to stake"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                />
                {amountError && (
                  <p className="text-red-500 text-sm mt-1">{amountError}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Lock Period (Days)
                </label>
                <select
                  value={lockDays}
                  onChange={(e) => setLockDays(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value={30}>30 days (5% APY)</option>
                  <option value={90}>90 days (8% APY)</option>
                  <option value={180}>180 days (12% APY)</option>
                  <option value={365}>365 days (15% APY)</option>
                </select>
              </div>

              <button
                onClick={handleStake}
                disabled={!amount || amountError || isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
              >
                {isSubmitting ? 'Staking...' : 'Stake Tokens'}
              </button>

              <div className="text-center">
                <button
                  onClick={handleClaimRewards}
                  disabled={isSubmitting || !stakingData?.totalRewards || stakingData.totalRewards === '0'}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                >
                  {isSubmitting ? 'Claiming...' : `Claim Rewards (${stakingData?.totalRewards ? ethers.formatUnits(stakingData.totalRewards, 6) : '0'} KRSI)`}
                </button>
              </div>
            </div>
          </div>

          {/* Positions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Your Positions
            </h2>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Loading positions...</p>
              </div>
            ) : positions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">
                  No staking positions found
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {positions.map((position, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {ethers.formatUnits(position.amount, 6)} KRSI
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Lock Period: {Math.floor(Number(position.lockPeriod) / (24 * 60 * 60))} days
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Started: {new Date(Number(position.startTime) * 1000).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        position.isActive 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {position.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div className="flex space-x-2 mt-3">
                      <button
                        onClick={() => handleUnstake(index)}
                        disabled={isSubmitting || !position.isActive}
                        className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white text-sm py-1 px-3 rounded transition-colors duration-200"
                      >
                        Unstake
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Staking;