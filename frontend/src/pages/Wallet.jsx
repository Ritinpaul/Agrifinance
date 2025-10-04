import React, { useEffect, useMemo, useState } from 'react';
import { useSupabase } from '../context/SupabaseContext';
import { useWeb3 } from '../context/Web3Context';
import { DecimalUtils, AmountValidation } from '../utils/decimalUtils';
import MobileWalletUtils from '../utils/mobileWalletUtils';

const Wallet = () => {
  const { supabase, user } = useSupabase();
  const { account, krishiTokenContract, isConnected } = useWeb3();

  const [walletAccount, setWalletAccount] = useState(null);
  const [inAppBalanceWei, setInAppBalanceWei] = useState('0');
  const [metaMaskBalanceWei, setMetaMaskBalanceWei] = useState('0');
  const [mobileWallets, setMobileWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addressInput, setAddressInput] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [amountError, setAmountError] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // overview, mobile, blockchain

  const loadData = async () => {
    if (!user?.id) return;
    setLoading(true);
    // Ensure wallet account exists
    const { data: existing } = await supabase
      .from('wallet_accounts')
      .select('*')
      .eq('user_id', user.id)
      .single();

    let acc = existing;
    if (!acc) {
      const { data: created } = await supabase
        .from('wallet_accounts')
        .insert([
          {
            user_id: user.id,
            address: null,
            chain_id: 'amoy',
            token_symbol: 'KRSI',
            balance_wei: '0',
            custodial: true
          }
        ])
        .select()
        .single();
      acc = created;
    }
    setWalletAccount(acc);
    setInAppBalanceWei(String(acc?.balance_wei ?? '0'));

    // Load mobile wallets (with error handling)
    try {
      const mobileResult = await MobileWalletUtils.getUserMobileWallets(user.id);
      if (mobileResult.success) {
        setMobileWallets(mobileResult.wallets);
      } else {
        console.log('Mobile wallets not available yet:', mobileResult.error);
        setMobileWallets([]);
      }
    } catch (error) {
      console.log('Mobile wallet functions not available yet:', error);
      setMobileWallets([]);
    }

    // Load MetaMask balance if connected
    if (isConnected && krishiTokenContract && account) {
      try {
        const bal = await krishiTokenContract.balanceOf(account);
        setMetaMaskBalanceWei(bal.toString());
      } catch {
        setMetaMaskBalanceWei('0');
      }
    } else {
      setMetaMaskBalanceWei('0');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user, isConnected, krishiTokenContract, account]);

  // Computed display values using decimal utils
  const inAppBalanceDisplay = useMemo(() => 
    DecimalUtils.formatDisplay(inAppBalanceWei, 4, true), 
    [inAppBalanceWei]
  );
  
  const metaMaskBalanceDisplay = useMemo(() => 
    DecimalUtils.formatDisplay(metaMaskBalanceWei, 4, true), 
    [metaMaskBalanceWei]
  );

  const handleAmountChange = (value) => {
    const formatted = AmountValidation.formatInput(value);
    setAmountInput(formatted);
    
    const validation = AmountValidation.validateInput(formatted);
    setAmountError(validation.error);
  };

  const requestWithdrawal = async () => {
    if (!walletAccount || !user?.id) return;
    if (!addressInput || !amountInput) return;
    
    // Validate amount
    const validation = AmountValidation.validateInput(amountInput);
    if (!validation.valid) {
      setAmountError(validation.error);
      return;
    }

    // Convert to wei for storage
    const amountWei = DecimalUtils.toWei(amountInput);
    
    // Check if user has sufficient balance
    if (DecimalUtils.compare(inAppBalanceWei, amountWei, true) < 0) {
      setAmountError('Insufficient balance');
      return;
    }

    const { error } = await supabase
      .from('wallet_transactions')
      .insert([
        {
          user_id: user.id,
          wallet_id: walletAccount.id,
          direction: 'out',
          amount_wei: amountWei,
          token_symbol: 'KRSI',
          status: 'requested',
          to_address: addressInput,
          metadata: { type: 'withdraw_request', amount_display: amountInput }
        }
      ]);
    if (!error) {
      alert('Withdrawal requested. Admin will process it.');
      setAddressInput('');
      setAmountInput('');
      setAmountError('');
    } else {
      alert('Failed to request withdrawal');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            AgriFinance Wallet
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your money easily - just like UPI!
          </p>
        </div>

        {/* Wallet Type Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📊 Overview
              </button>
              <button
                onClick={() => setActiveTab('mobile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'mobile'
                    ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📱 Mobile Wallet
              </button>
              <button
                onClick={() => setActiveTab('blockchain')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'blockchain'
                    ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🔗 Blockchain Wallet
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Mobile Wallets Summary */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      📱 Mobile Wallets
                    </h3>
                    {loading ? (
                      <div className="text-gray-600 dark:text-gray-400">Loading…</div>
                    ) : mobileWallets.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-gray-600 dark:text-gray-400 mb-4">No mobile wallets found</p>
                        <button
                          onClick={() => setActiveTab('mobile')}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Create Mobile Wallet
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {mobileWallets.map((wallet) => (
                          <div key={wallet.id} className="flex items-center justify-between">
                            <div>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {MobileWalletUtils.formatMobileDisplay(wallet.mobile_wallet_id)}
                              </span>
                              {wallet.is_primary && (
                                <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                  Primary
                                </span>
                              )}
                            </div>
                            <span className="text-lg font-bold text-green-600">
                              {MobileWalletUtils.formatAmount(wallet.balance_wei)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Blockchain Wallet Summary */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      🔗 Blockchain Wallet
                    </h3>
                    {isConnected ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Connected:</span>
                          <span className="font-mono text-sm text-gray-900 dark:text-white">
                            {account?.slice(0, 6)}...{account?.slice(-4)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">KRSI Balance:</span>
                          <span className="text-lg font-bold text-blue-600">
                            {metaMaskBalanceDisplay} KRSI
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-600 dark:text-gray-400 mb-4">MetaMask not connected</p>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          Connect MetaMask
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => setActiveTab('mobile')}
                      className="p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      📱 Manage Mobile Wallets
                    </button>
                    <button
                      onClick={() => setActiveTab('blockchain')}
                      className="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      🔗 Blockchain Operations
                    </button>
                    <button className="p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                      📊 Transaction History
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Wallet Tab */}
            {activeTab === 'mobile' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Mobile Wallet Management
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Send money easily using mobile numbers - just like UPI!
                  </p>
                </div>
                
                {/* Mobile Wallets List */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white">
                      Your Mobile Wallets
                    </h4>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      + Add Wallet
                    </button>
                  </div>

                  {mobileWallets.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-gray-400 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        No mobile wallets found. Create your first wallet to get started!
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {mobileWallets.map((wallet) => (
                        <div key={wallet.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {MobileWalletUtils.formatMobileDisplay(wallet.mobile_wallet_id)}
                                </span>
                                {wallet.is_primary && (
                                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                    Primary
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {wallet.display_name}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-green-600">
                                {MobileWalletUtils.formatAmount(wallet.balance_wei)}
                              </p>
                              <p className="text-xs text-gray-500">KRSI Balance</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Blockchain Wallet Tab */}
            {activeTab === 'blockchain' && (
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Blockchain Wallet Operations
                  </h3>
                  
                  {isConnected ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Connected Address:</span>
                        <span className="font-mono text-sm text-gray-900 dark:text-white">
                          {account?.slice(0, 6)}...{account?.slice(-4)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">KRSI Balance:</span>
                        <span className="text-xl font-bold text-blue-600">
                          {metaMaskBalanceDisplay} KRSI
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Connect your MetaMask wallet to view blockchain balance
                      </p>
                      <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Connect MetaMask
                      </button>
                    </div>
                  )}
                </div>

                {/* Withdraw to MetaMask */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Withdraw to MetaMask
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Destination address"
                      value={addressInput}
                      onChange={(e) => setAddressInput(e.target.value)}
                    />
                    <div className="space-y-1">
                      <input
                        type="text"
                        className={`form-input ${amountError ? 'border-red-500' : ''}`}
                        placeholder="Amount (KRSI)"
                        value={amountInput}
                        onChange={(e) => handleAmountChange(e.target.value)}
                      />
                      {amountError && (
                        <div className="text-red-500 text-sm">{amountError}</div>
                      )}
                    </div>
                    <button className="agri-button" onClick={requestWithdrawal} disabled={!amountInput || !addressInput}>
                      Request Withdrawal
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">An admin/custodian must approve and send on-chain.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;


