import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { useSupabase } from '../context/SupabaseContext';
import { ethers } from 'ethers';
import { toast } from 'react-hot-toast';

const TokenFaucet = ({ className = "" }) => {
  const { account, contract, krishiTokenContract } = useWeb3();
  const { supabase, user } = useSupabase();
  const [loading, setLoading] = useState(false);
  const [depositLoading, setDepositLoading] = useState(false);
  const [inAppBalance, setInAppBalance] = useState('0');
  const [faucetData, setFaucetData] = useState({
    balance: '0', // wei string
    lastClaim: 0,
    claimCooldown: 24 * 60 * 60, // 24 hours in seconds
    maxClaimAmount: '1000', // human readable
    maxClaimAmountWei: ethers.parseUnits('1000', 18).toString(),
    totalDistributed: '0'
  });
  const [claimHistory, setClaimHistory] = useState([]);

  // Load claim history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('faucetClaimHistory');
    if (history) {
      setClaimHistory(JSON.parse(history));
    }
  }, []);

  // Load AgriFinance wallet balance
  const loadInAppBalance = async () => {
    if (!user?.id) return;
    
    try {
      const { data: walletAccount } = await supabase
        .from('wallet_accounts')
        .select('balance_wei')
        .eq('user_id', user.id)
        .eq('wallet_type', 'agrifinance')
        .single();
      
      if (walletAccount) {
        setInAppBalance(walletAccount.balance_wei || '0');
      }
    } catch (error) {
      console.log('AgriFinance wallet not available yet:', error);
      setInAppBalance('0');
    }
  };

  // Deposit KRSI tokens to in-app wallet
  const depositToInAppWallet = async () => {
    if (!user?.id || !account) {
      toast.error("Please connect your wallet and sign in");
      return;
    }

    if (!krishiTokenContract) {
      toast.error("KRSI token contract not available");
      return;
    }

    setDepositLoading(true);
    
    try {
      // Check MetaMask balance
      const metaMaskBalance = await krishiTokenContract.balanceOf(account);
      if (metaMaskBalance === 0n) {
        toast.error("No KRSI tokens in MetaMask to deposit");
        return;
      }

      // Get or create AgriFinance wallet account
      let { data: walletAccount } = await supabase
        .from('wallet_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('wallet_type', 'agrifinance')
        .single();

      if (!walletAccount) {
        toast.error("Please create your AgriFinance wallet first");
        return;
      }

      // Transfer tokens from MetaMask to in-app wallet (simulated)
      // In a real implementation, this would involve a smart contract transfer
      const depositAmount = metaMaskBalance.toString();
      
      // Update in-app wallet balance
      const newBalance = (BigInt(walletAccount.balance_wei || '0') + BigInt(depositAmount)).toString();
      
      const { error: updateError } = await supabase
        .from('wallet_accounts')
        .update({ balance_wei: newBalance })
        .eq('id', walletAccount.id);

      if (updateError) {
        throw updateError;
      }

      // Record transaction
      await supabase
        .from('wallet_transactions')
        .insert([{
          user_id: user.id,
          wallet_id: walletAccount.id,
          direction: 'in',
          amount_wei: depositAmount,
          token_symbol: 'KRSI',
          status: 'completed',
          metadata: { 
            type: 'deposit_from_metamask',
            from_address: account,
            amount_display: formatTokenAmount(depositAmount)
          }
        }]);

      // Update local state
      setInAppBalance(newBalance);
      
      toast.success(`Successfully deposited ${formatTokenAmount(depositAmount)} KRSI to in-app wallet!`);
      
    } catch (error) {
      console.error("Deposit error:", error);
      toast.error("Failed to deposit tokens to in-app wallet");
    } finally {
      setDepositLoading(false);
    }
  };

  // Load faucet data from contract
  const loadFaucetData = async () => {
    try {
      if (!krishiTokenContract || !account) return;

      // Get user's KRSI balance
      const balance = await krishiTokenContract.balanceOf(account);
      
      // Get last claim time (stored in localStorage for demo)
      const lastClaim = localStorage.getItem(`lastClaim_${account}`) || '0';
      
      setFaucetData(prev => ({
        ...prev,
        balance: balance.toString(),
        lastClaim: parseInt(lastClaim)
      }));
    } catch (error) {
      console.error("Error loading faucet data:", error);
    }
  };

  // Load faucet data and in-app balance
  useEffect(() => {
    if (account && krishiTokenContract) {
      loadFaucetData();
    }
    if (user?.id) {
      loadInAppBalance();
    }
  }, [account, krishiTokenContract, user]);

  // Check if user can claim tokens
  const canClaim = () => {
    const now = Math.floor(Date.now() / 1000);
    const timeSinceLastClaim = now - faucetData.lastClaim;
    return timeSinceLastClaim >= faucetData.claimCooldown;
  };

  // Get time until next claim
  const getTimeUntilNextClaim = () => {
    const now = Math.floor(Date.now() / 1000);
    const timeSinceLastClaim = now - faucetData.lastClaim;
    const timeUntilNextClaim = faucetData.claimCooldown - timeSinceLastClaim;
    
    if (timeUntilNextClaim <= 0) return null;
    
    const hours = Math.floor(timeUntilNextClaim / 3600);
    const minutes = Math.floor((timeUntilNextClaim % 3600) / 60);
    const seconds = timeUntilNextClaim % 60;
    
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  // Claim tokens from faucet
  const claimTokens = async () => {
    if (!account) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!canClaim()) {
      toast.error("You must wait before claiming again");
      return;
    }

    setLoading(true);
    
    try {
      // Call faucetDistribute function from KrishiToken contract
      // send amount in wei matching token decimals
      const tx = await krishiTokenContract.faucetDistribute(account, faucetData.maxClaimAmountWei);
      
      toast.loading("Claiming tokens...", { id: "claim-tx" });
      
      await tx.wait();
      
      // Update last claim time
      const now = Math.floor(Date.now() / 1000);
      localStorage.setItem(`lastClaim_${account}`, now.toString());
      
      // Add to claim history
      const newClaim = {
        id: Date.now(),
        amount: faucetData.maxClaimAmountWei,
        timestamp: new Date().toISOString(),
        txHash: tx.hash,
        address: account
      };
      
      const updatedHistory = [newClaim, ...claimHistory.slice(0, 9)]; // Keep last 10
      setClaimHistory(updatedHistory);
      localStorage.setItem('faucetClaimHistory', JSON.stringify(updatedHistory));
      
      // Update faucet data
      setFaucetData(prev => ({
        ...prev,
        lastClaim: now,
        balance: (BigInt(prev.balance) + BigInt(prev.maxClaimAmountWei)).toString()
      }));
      
      toast.success(`Successfully claimed ${faucetData.maxClaimAmount} KRSI tokens!`, { id: "claim-tx" });
      
    } catch (error) {
      console.error("Claim error:", error);
      toast.error("Failed to claim tokens", { id: "claim-tx" });
    } finally {
      setLoading(false);
    }
  };

  // Add KRSI token to MetaMask
  const addTokenToMetaMask = async () => {
    if (!window.ethereum) {
      toast.error("MetaMask not detected");
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: krishiTokenContract?.target || '',
            symbol: 'KRSI',
            decimals: 18,
            image: 'https://via.placeholder.com/32x32/10B981/FFFFFF?text=KRSI'
          }
        }
      });
      
      toast.success("KRSI token added to MetaMask!");
    } catch (error) {
      console.error("Error adding token to MetaMask:", error);
      toast.error("Failed to add token to MetaMask");
    }
  };

  // Format token amount
  const formatTokenAmount = (amount) => {
    try {
      const wei = BigInt(amount || '0');
      const whole = wei / 10n ** 18n;
      const frac = wei % 10n ** 18n;
      const fracStr = (frac + 10n ** 18n).toString().slice(1).slice(0, 2); // 2 decimals
      return `${whole.toString()}.${fracStr}`;
    } catch {
      return '0.00';
    }
  };

  return (
    <div className={`token-faucet ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
              KRSI Token Faucet
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Get free KRSI tokens for testing the AgriFinance platform
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Active</span>
          </div>
        </div>

        {/* Connection Status */}
        {!account ? (
          <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-yellow-800 dark:text-yellow-200 font-medium">Wallet Not Connected</span>
            </div>
            <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
              Please connect your MetaMask wallet to claim tokens
            </p>
          </div>
        ) : (
          <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-green-800 dark:text-green-200 font-medium">Wallet Connected</span>
            </div>
            <p className="text-green-700 dark:text-green-300 text-sm mt-1">
              Connected: {account.slice(0, 6)}...{account.slice(-4)}
            </p>
          </div>
        )}

        {/* Token Balance */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Your KRSI Balance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatTokenAmount(faucetData.balance)} KRSI
              </p>
            </div>
            <button
              onClick={addTokenToMetaMask}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Add to MetaMask
            </button>
          </div>
        </div>

        {/* AgriFinance Wallet Balance */}
        {user && (
          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">AgriFinance Wallet Balance</p>
                <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                  {formatTokenAmount(inAppBalance)} KRSI
                </p>
              </div>
              <button
                onClick={depositToInAppWallet}
                disabled={depositLoading || !account || !krishiTokenContract}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {depositLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Depositing...</span>
                  </div>
                ) : (
                  'Deposit to AgriFinance Wallet'
                )}
              </button>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
              Transfer your MetaMask KRSI tokens to your AgriFinance wallet for easy management
            </p>
          </div>
        )}

        {/* Claim Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white">Claim Tokens</h4>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Max: 1000.00 KRSI
            </span>
          </div>

          {canClaim() ? (
            <button
              onClick={claimTokens}
              disabled={loading || !account}
              className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Claiming...</span>
                </div>
              ) : (
                `Claim 1000.00 KRSI`
              )}
            </button>
          ) : (
            <div className="text-center py-3 px-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400 mb-2">Next claim available in:</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-white">
                {getTimeUntilNextClaim()}
              </p>
            </div>
          )}
        </div>

        {/* Claim History */}
        {claimHistory.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Recent Claims</h4>
            <div className="space-y-2">
              {claimHistory.slice(0, 5).map((claim) => (
                <div key={claim.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatTokenAmount(claim.amount)} KRSI
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(claim.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">Success</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {claim.txHash.slice(0, 8)}...
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Information */}
        <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Faucet Information</h4>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Claim up to 1,000 KRSI tokens per day</li>
            <li>• 24-hour cooldown between claims</li>
            <li>• Tokens are for testing purposes only</li>
            <li>• No real value - use for platform testing</li>
            <li>• Connect MetaMask to Polygon Amoy testnet</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TokenFaucet;
