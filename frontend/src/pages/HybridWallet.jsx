import React, { useState, useEffect } from 'react';
import { useSupabase } from '../context/SupabaseContext';
import { useWeb3 } from '../context/Web3Context';
import { DecimalUtils } from '../utils/decimalUtils';
import MobileWalletUtils from '../utils/mobileWalletUtils';
import toast from 'react-hot-toast';

const HybridWallet = () => {
  const { supabase, user, userProfile } = useSupabase();
  const { account, isConnected, krishiTokenContract } = useWeb3();

  // State management
  const [activeTab, setActiveTab] = useState('mobile'); // mobile, bank, blockchain
  const [mobileWallets, setMobileWallets] = useState([]);
  const [blockchainBalance, setBlockchainBalance] = useState('0');
  const [loading, setLoading] = useState(true);
  
  // Mobile wallet transaction states
  const [sendForm, setSendForm] = useState({
    toMobile: '',
    amount: '',
    description: ''
  });
  const [sending, setSending] = useState(false);
  
  // Wallet creation states
  const [showCreateWallet, setShowCreateWallet] = useState(false);
  const [newWalletForm, setNewWalletForm] = useState({
    phoneNumber: '',
    displayName: ''
  });

  // Load wallet data
  const loadWalletData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Load mobile wallets
      const mobileResult = await MobileWalletUtils.getUserMobileWallets(user.id);
      if (mobileResult.success) {
        setMobileWallets(mobileResult.wallets);
      }

      // Load blockchain balance if connected
      if (isConnected && krishiTokenContract && account) {
        try {
          const balance = await krishiTokenContract.balanceOf(account);
          setBlockchainBalance(balance.toString());
        } catch (error) {
          console.error('Error loading blockchain balance:', error);
        }
      }
    } catch (error) {
      console.error('Error loading wallet data:', error);
      toast.error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWalletData();
  }, [user, isConnected, krishiTokenContract, account]);

  // Handle mobile wallet creation
  const handleCreateMobileWallet = async () => {
    if (!newWalletForm.phoneNumber) {
      toast.error('Please enter a phone number');
      return;
    }

    try {
      const result = await MobileWalletUtils.createMobileWallet(
        user.id,
        newWalletForm.phoneNumber,
        newWalletForm.displayName || null
      );

      if (result.success) {
        toast.success('Mobile wallet created successfully!');
        setShowCreateWallet(false);
        setNewWalletForm({ phoneNumber: '', displayName: '' });
        loadWalletData(); // Refresh wallet list
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to create mobile wallet');
      console.error('Create wallet error:', error);
    }
  };

  // Handle mobile-to-mobile transfer
  const handleMobileTransfer = async () => {
    if (!sendForm.toMobile || !sendForm.amount) {
      toast.error('Please fill in all fields');
      return;
    }

    const primaryWallet = mobileWallets.find(w => w.is_primary);
    if (!primaryWallet) {
      toast.error('No primary wallet found');
      return;
    }

    setSending(true);
    try {
      // Convert amount to wei
      const amountWei = DecimalUtils.toWei(sendForm.amount);
      
      const result = await MobileWalletUtils.transferMobileToMobile(
        primaryWallet.mobile_wallet_id,
        sendForm.toMobile,
        amountWei,
        sendForm.description || null
      );

      if (result.success) {
        toast.success(`₹${sendForm.amount} sent successfully!`);
        setSendForm({ toMobile: '', amount: '', description: '' });
        loadWalletData(); // Refresh balances
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Transfer failed');
      console.error('Transfer error:', error);
    } finally {
      setSending(false);
    }
  };

  // Format mobile number input
  const handleMobileInputChange = (value) => {
    const validation = MobileWalletUtils.validateMobileNumber(value);
    setSendForm(prev => ({ ...prev, toMobile: validation.formatted }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your wallets...</p>
        </div>
      </div>
    );
  }

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
                onClick={() => setActiveTab('bank')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'bank'
                    ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🏦 Bank Account
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
            {/* Mobile Wallet Tab */}
            {activeTab === 'mobile' && (
              <div className="space-y-6">
                {/* Mobile Wallets List */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Your Mobile Wallets
                    </h3>
                    <button
                      onClick={() => setShowCreateWallet(true)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      + Add Wallet
                    </button>
                  </div>

                  {mobileWallets.length === 0 ? (
                    <div className="text-center py-8">
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

                {/* Send Money Form */}
                {mobileWallets.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Send Money
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          To Mobile Number
                        </label>
                        <input
                          type="tel"
                          value={sendForm.toMobile}
                          onChange={(e) => handleMobileInputChange(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Amount (₹)
                        </label>
                        <input
                          type="number"
                          value={sendForm.amount}
                          onChange={(e) => setSendForm(prev => ({ ...prev, amount: e.target.value }))}
                          placeholder="1000"
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Description (Optional)
                        </label>
                        <input
                          type="text"
                          value={sendForm.description}
                          onChange={(e) => setSendForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Payment for crops"
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                        />
                      </div>
                      <button
                        onClick={handleMobileTransfer}
                        disabled={sending || !sendForm.toMobile || !sendForm.amount}
                        className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {sending ? 'Sending...' : 'Send Money'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Bank Account Tab */}
            {activeTab === 'bank' && (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Bank Account Integration
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Connect your bank account for easy transfers
                </p>
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Coming Soon
                </button>
              </div>
            )}

            {/* Blockchain Wallet Tab */}
            {activeTab === 'blockchain' && (
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Blockchain Wallet
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
                          {DecimalUtils.formatDisplay(blockchainBalance, 4, true)} KRSI
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
              </div>
            )}
          </div>
        </div>

        {/* Create Wallet Modal */}
        {showCreateWallet && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Create Mobile Wallet
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={newWalletForm.phoneNumber}
                    onChange={(e) => setNewWalletForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Display Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={newWalletForm.displayName}
                    onChange={(e) => setNewWalletForm(prev => ({ ...prev, displayName: e.target.value }))}
                    placeholder="My AgriWallet"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowCreateWallet(false)}
                    className="flex-1 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateMobileWallet}
                    className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Create Wallet
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HybridWallet;
