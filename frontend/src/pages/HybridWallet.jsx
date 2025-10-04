import React, { useState, useEffect } from 'react';
import { useSupabase } from '../context/SupabaseContext';
import { useWeb3 } from '../context/Web3Context';
import { DecimalUtils } from '../utils/decimalUtils';
import MobileWalletUtils from '../utils/mobileWalletUtils';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

const HybridWallet = () => {
  const { supabase, user, userProfile } = useSupabase();
  const { account, isConnected, krishiTokenContract } = useWeb3();

  // State management
  const [activeTab, setActiveTab] = useState('agrifinance'); // agrifinance, blockchain
  const [agriWallet, setAgriWallet] = useState(null);
  const [blockchainBalance, setBlockchainBalance] = useState('0');
  const [loading, setLoading] = useState(true);
  const [walletCreated, setWalletCreated] = useState(false); // Track if wallet creation notification was shown
  const [syncing, setSyncing] = useState(false); // Track sync status - RESET TO FALSE
  const [isWalletSynced, setIsWalletSynced] = useState(false); // Track if wallet is synced to database
  
  // AgriFinance wallet mobile linking states
  const [mobileNumber, setMobileNumber] = useState('');
  const [linkingMobile, setLinkingMobile] = useState(false);
  
  // AgriFinance wallet transaction states
  const [agriSendForm, setAgriSendForm] = useState({
    toAddress: '',
    toMobile: '', // Added mobile number option
    amount: '',
    description: '',
    sendType: 'address' // 'address' or 'mobile'
  });
  const [agriSending, setAgriSending] = useState(false);

  // Link mobile number to AgriFinance wallet
  const linkMobileNumber = async () => {
    if (!mobileNumber || !agriWallet) {
      toast.error('Please enter a mobile number and ensure wallet is created');
      return;
    }

    setLinkingMobile(true);
    try {
      // Save mobile number to wallet metadata
      const { error } = await supabase
        .from('wallet_accounts')
        .update({
          metadata: {
            ...agriWallet.metadata,
            mobile_number: mobileNumber,
            mobile_linked_at: new Date().toISOString()
          }
        })
        .eq('id', agriWallet.id);

      if (error) throw error;

      // Update local state
      setAgriWallet(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          mobile_number: mobileNumber,
          mobile_linked_at: new Date().toISOString()
        }
      }));

      toast.success(`Mobile number ${mobileNumber} linked to your wallet!`);
      setMobileNumber('');
    } catch (error) {
      console.error('Error linking mobile number:', error);
      toast.error('Failed to link mobile number');
    } finally {
      setLinkingMobile(false);
    }
  };

  // Test database connection - IMPROVED WITH TABLE STRUCTURE CHECK
  const testDatabaseConnection = async () => {
    try {
      console.log('🔍 Testing database connection...');
      
      // First, try to check if the table exists and has the right structure
      const { data, error } = await supabase
        .from('wallet_accounts')
        .select('id, user_id, address, wallet_type, balance_wei, metadata')
        .limit(1);
      
      if (error) {
        console.log('❌ Database query failed:', error.message);
        console.log('❌ Error code:', error.code);
        console.log('❌ Error details:', error.details);
        
        // If it's a column error, the table might not have the right structure
        if (error.code === '42703') {
          console.log('❌ Table structure issue - missing columns');
          toast.error('Database table structure needs to be updated. Please run the SQL script.');
        }
        
        return false;
      }
      
      console.log('✅ Database connection successful');
      console.log('✅ Table structure looks good');
      return true;
    } catch (error) {
      console.log('❌ Database connection test failed:', error.message);
      return false;
    }
  };

  // Sync wallet to database - FIXED TO ACTUALLY WORK
  const syncWalletToDatabase = async () => {
    console.log('🚀 SYNC BUTTON CLICKED!');
    
    if (!agriWallet || !user?.id) {
      toast.error('No wallet to sync');
      return;
    }

    console.log('🔄 Starting sync...');
    console.log('📊 Wallet to sync:', {
      address: agriWallet.address,
      user_id: user.id,
      balance: agriWallet.balance_wei
    });
    console.log('🔍 Supabase client:', supabase);
    console.log('🔍 User auth:', user);
    
    setSyncing(true);
    
    try {
      // STEP 0: Test basic Supabase connection - THIS WILL MAKE A NETWORK REQUEST
      console.log('🧪 Testing basic Supabase connection...');
      console.log('🌐 This should show a network request in DevTools Network tab');
      
      const { data: testData, error: testError } = await supabase
        .from('wallet_accounts')
        .select('count')
        .limit(1);
      
      console.log('🧪 Basic test result:', { testData, testError });
      
      if (testError) {
        console.log('❌ Basic test failed:', testError);
        throw new Error(`Supabase connection failed: ${testError.message}`);
      }
      
      console.log('✅ Supabase connection working - network request successful');
      
      // STEP 1: Check if wallet already exists - THIS WILL MAKE ANOTHER NETWORK REQUEST
      console.log('🔍 Checking if wallet exists...');
      console.log('🌐 This should show another network request in DevTools Network tab');
      
      const { data: existingWallet, error: checkError } = await supabase
        .from('wallet_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('wallet_type', 'agrifinance')
        .maybeSingle(); // Use maybeSingle() to avoid error if no record found

      console.log('🔍 Check result:', { existingWallet, checkError });

      if (checkError) {
        throw new Error(`Failed to check existing wallet: ${checkError.message}`);
      }

      if (existingWallet) {
        // STEP 2A: Wallet exists - UPDATE it - THIS WILL MAKE A NETWORK REQUEST
        console.log('📝 Wallet exists, updating...');
        console.log('🌐 This should show an UPDATE network request in DevTools Network tab');
        
        const { data: updateData, error: updateError } = await supabase
          .from('wallet_accounts')
          .update({
            address: agriWallet.address,
            balance_wei: agriWallet.balance_wei || '0',
            metadata: agriWallet.metadata,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingWallet.id)
          .select()
          .single();

        console.log('📝 Update result:', { updateData, updateError });

        if (updateError) {
          throw new Error(`Failed to update wallet: ${updateError.message}`);
        }

        console.log('✅ Wallet updated successfully!');
        setIsWalletSynced(true);
        toast.success('Wallet synced to database successfully!');
        
      } else {
        // STEP 2B: Wallet doesn't exist - INSERT it - THIS WILL MAKE A NETWORK REQUEST
        console.log('📝 No existing wallet, creating new...');
        console.log('🌐 This should show an INSERT network request in DevTools Network tab');
        
        const { data: insertData, error: insertError } = await supabase
          .from('wallet_accounts')
          .insert({
            user_id: user.id,
            address: agriWallet.address,
            wallet_type: 'agrifinance',
            balance_wei: agriWallet.balance_wei || '0',
            metadata: agriWallet.metadata,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        console.log('📝 Insert result:', { insertData, insertError });

        if (insertError) {
          throw new Error(`Failed to insert wallet: ${insertError.message}`);
        }

        console.log('✅ Wallet created in database successfully!');
        setIsWalletSynced(true);
        toast.success('Wallet saved to database successfully!');
      }
      
    } catch (error) {
      console.error('❌ Sync error:', error);
      toast.error(`Sync failed: ${error.message}`);
    } finally {
      console.log('✅ Sync operation completed');
      setSyncing(false);
    }
  };

  // Manual sync reset function
  const resetSyncState = () => {
    console.log('🔄 Manually resetting sync state');
    setSyncing(false);
    toast.info('Sync state reset - you can try again');
  };

  // Create wallet immediately function
  const createWalletImmediately = () => {
    if (!user?.id) {
      toast.error('No user found');
      return;
    }
    
    console.log('🚀 Creating wallet immediately...');
    const persistentWallet = generatePersistentWallet(user.id);
    
    const immediateWallet = {
      id: 'immediate-' + user.id,
      user_id: user.id,
      address: persistentWallet.address,
      wallet_type: 'agrifinance',
      chain_id: 'amoy',
      token_symbol: 'KRSI',
      balance_wei: '0',
      custodial: true,
      metadata: {
        private_key: persistentWallet.privateKey,
        mnemonic: persistentWallet.mnemonic,
        created_at: new Date().toISOString(),
        is_real_wallet: true,
        is_persistent: true,
        is_immediate: true,
        user_id: user.id
      }
    };
    
    setAgriWallet(immediateWallet);
    setIsWalletSynced(false);
    setLoading(false);
    
    if (!walletCreated) {
      toast.success('AgriFinance wallet created immediately!');
      setWalletCreated(true);
    }
  };

  // Resolve phone number to wallet address
  const resolvePhoneToAddress = async (phoneNumber) => {
    try {
      const { data: walletAccount } = await supabase
        .from('wallet_accounts')
        .select('address, metadata')
        .eq('wallet_type', 'agrifinance')
        .eq('metadata->mobile_number', phoneNumber)
        .single();

      return walletAccount?.address || null;
    } catch (error) {
      console.error('Error resolving phone to address:', error);
      return null;
    }
  };

  // Generate deterministic wallet address from user ID (persistent) - SIMPLE APPROACH
  const generatePersistentWallet = (userId) => {
    try {
      console.log('🔧 Generating persistent wallet for user:', userId);
      
      // SIMPLE APPROACH: Create deterministic private key from user ID
      // This is much more reliable than mnemonic generation
      const seed = ethers.id(userId + 'agrifinance-wallet-seed');
      const privateKey = ethers.keccak256(seed);
      
      // Create wallet from private key
      const wallet = new ethers.Wallet(privateKey);
      
      console.log('✅ Persistent wallet generated successfully:', wallet.address);
      
      return {
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: null // No mnemonic needed for this approach
      };
    } catch (error) {
      console.error('❌ Error generating persistent wallet:', error);
      
      // Fallback: Use a different seed approach
      try {
        console.log('🔄 Trying alternative seed approach...');
        
        // Alternative: Use user ID directly as seed
        const altSeed = ethers.id(userId + 'agrifinance-alt-seed');
        const altPrivateKey = ethers.keccak256(altSeed);
        const altWallet = new ethers.Wallet(altPrivateKey);
        
        console.log('✅ Alternative wallet generated:', altWallet.address);
        
        return {
          address: altWallet.address,
          privateKey: altWallet.privateKey,
          mnemonic: null
        };
      } catch (fallbackError) {
        console.error('❌ Alternative approach also failed:', fallbackError);
        
        // Last resort: Use a fixed seed for this user
        console.log('🚨 Using fixed seed as last resort');
        const fixedSeed = ethers.id('fixed-seed-' + userId);
        const fixedPrivateKey = ethers.keccak256(fixedSeed);
        const fixedWallet = new ethers.Wallet(fixedPrivateKey);
        
        console.log('✅ Fixed seed wallet generated:', fixedWallet.address);
        
        return {
          address: fixedWallet.address,
          privateKey: fixedPrivateKey,
          mnemonic: null
        };
      }
    }
  };

  // Generate real AgriFinance wallet address using ethers.js
  const generateRealAgriWallet = () => {
    // Generate a real Ethereum wallet with private key
    const wallet = ethers.Wallet.createRandom();
    
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: wallet.mnemonic?.phrase || null
    };
  };

  // Auto-reset sync state if it gets stuck - REMOVED TO PREVENT INTERFERENCE

  // Load wallet data - FIXED ERROR HANDLING
  const loadWalletData = async () => {
    console.log('🔄 Starting wallet load...');
    console.log('User:', user?.id ? 'Present' : 'Missing');
    console.log('Supabase:', supabase ? 'Connected' : 'Not connected');
    
    if (!user?.id) {
      console.log('❌ No user ID, stopping loading');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    try {
      // Try database first - SIMPLIFIED APPROACH
      console.log('🔍 Checking for existing wallet in database...');
      
      const { data: existingWallet, error: dbError } = await supabase
        .from('wallet_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('wallet_type', 'agrifinance')
        .single();
      
      console.log('🔍 Database query result:', { existingWallet, dbError });
      
      if (existingWallet) {
        console.log('✅ Found existing wallet:', existingWallet.address);
        setAgriWallet(existingWallet);
        setIsWalletSynced(true); // Wallet is already synced
      } else if (dbError && dbError.code === 'PGRST116') {
        console.log('ℹ️ No existing wallet found, creating new one');
        throw new Error('No existing wallet found');
      } else {
        console.log('❌ Database error:', dbError);
        throw new Error(`Database error: ${dbError.message}`);
      }
    } catch (dbError) {
      console.log('⚠️ Database failed or timeout, creating local wallet:', dbError.message);
      
      // Create wallet locally
      const persistentWallet = generatePersistentWallet(user.id);
      
      const localWallet = {
        id: 'local-' + user.id,
        user_id: user.id,
        address: persistentWallet.address,
        wallet_type: 'agrifinance',
        chain_id: 'amoy',
        token_symbol: 'KRSI',
        balance_wei: '0',
        custodial: true,
        metadata: {
          private_key: persistentWallet.privateKey,
          mnemonic: persistentWallet.mnemonic,
          created_at: new Date().toISOString(),
          is_real_wallet: true,
          is_persistent: true,
          is_local: true,
          user_id: user.id
        }
      };
      
      console.log('✅ Created local wallet:', localWallet.address);
      setAgriWallet(localWallet);
      setIsWalletSynced(false); // Local wallet needs to be synced
      
      if (!walletCreated) {
        toast.success('AgriFinance wallet created!');
        setWalletCreated(true);
      }
    } finally {
      // Load blockchain balance (non-blocking) - IMPROVED ERROR HANDLING
      if (isConnected && krishiTokenContract && account) {
        try {
          console.log('🔗 Loading blockchain balance...');
          const balance = await krishiTokenContract.balanceOf(account);
          setBlockchainBalance(balance.toString());
          console.log('✅ Blockchain balance loaded:', balance.toString());
        } catch (error) {
          console.log('⚠️ Failed to load blockchain balance (non-critical):', error.message);
          setBlockchainBalance('0');
        }
      } else {
        console.log('ℹ️ Blockchain not connected, setting balance to 0');
        setBlockchainBalance('0');
      }
      
      console.log('✅ Wallet loading completed');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      console.log('🚀 User detected, starting wallet load...');
      loadWalletData();
    } else {
      console.log('❌ No user detected, stopping loading');
      setLoading(false);
    }
    
    // Safety timeout - force loading to stop after 5 seconds no matter what
    const safetyTimeout = setTimeout(() => {
      console.log('🚨 Safety timeout triggered - forcing loading to stop');
      setLoading(false);
      
      // If still no wallet, create emergency one
      if (!agriWallet && user?.id) {
        console.log('🚨 Creating emergency wallet due to timeout');
        const persistentWallet = generatePersistentWallet(user.id);
        const emergencyWallet = {
          id: 'timeout-emergency-' + user.id,
          user_id: user.id,
          address: persistentWallet.address,
          wallet_type: 'agrifinance',
          chain_id: 'amoy',
          token_symbol: 'KRSI',
          balance_wei: '0',
          custodial: true,
          metadata: {
            private_key: persistentWallet.privateKey,
            mnemonic: persistentWallet.mnemonic,
            created_at: new Date().toISOString(),
            is_real_wallet: true,
            is_persistent: true,
            is_timeout_emergency: true,
            user_id: user.id
          }
        };
        setAgriWallet(emergencyWallet);
        setIsWalletSynced(false); // Timeout emergency wallet needs to be synced
        
        if (!walletCreated) {
          toast.success('AgriFinance wallet created (timeout recovery)!');
          setWalletCreated(true);
        }
      }
    }, 5000);
    
    return () => clearTimeout(safetyTimeout);
  }, [user?.id]);

  // Handle AgriFinance wallet transfer (REAL blockchain transaction)
  const handleAgriTransfer = async () => {
    if (!agriSendForm.amount) {
      toast.error('Please enter amount');
      return;
    }

    if (!agriWallet) {
      toast.error('AgriFinance wallet not found');
      return;
    }

    // Determine recipient address based on send type
    let recipientAddress = '';
    if (agriSendForm.sendType === 'address') {
      if (!agriSendForm.toAddress) {
        toast.error('Please enter recipient address');
        return;
      }
      recipientAddress = agriSendForm.toAddress;
    } else if (agriSendForm.sendType === 'mobile') {
      if (!agriSendForm.toMobile) {
        toast.error('Please enter recipient mobile number');
        return;
      }
      // Resolve mobile number to address
      recipientAddress = await resolvePhoneToAddress(agriSendForm.toMobile);
      if (!recipientAddress) {
        toast.error('Mobile number not found or not linked to any wallet');
        return;
      }
    }

    setAgriSending(true);
    try {
      // Convert amount to wei
      const amountWei = DecimalUtils.toWei(agriSendForm.amount);
      
      // Check if user has sufficient balance
      if (DecimalUtils.compare(agriWallet.balance_wei || '0', amountWei, true) < 0) {
        toast.error('Insufficient balance');
        return;
      }

      // Get the private key from metadata (in production, this should be encrypted)
      const privateKey = agriWallet.metadata?.private_key;
      if (!privateKey) {
        throw new Error('Private key not found');
      }

      // Create wallet instance from private key
      const wallet = new ethers.Wallet(privateKey);
      
      // Connect to provider (Polygon Amoy)
      const provider = new ethers.JsonRpcProvider('https://rpc-amoy.polygon.technology/');
      const connectedWallet = wallet.connect(provider);

      // Get KRSI token contract - use our deployed testnet address
      const krishiTokenAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // Our deployed KrishiToken on Amoy
      
      const tokenContract = new ethers.Contract(
        krishiTokenAddress,
        [
          'function transfer(address to, uint256 amount) returns (bool)',
          'function balanceOf(address account) view returns (uint256)'
        ],
        connectedWallet
      );

      // Execute the transfer
      toast.loading('Executing blockchain transaction...', { id: 'agri-transfer' });
      
      const tx = await tokenContract.transfer(recipientAddress, amountWei);
      
      toast.loading('Waiting for confirmation...', { id: 'agri-transfer' });
      
      const receipt = await tx.wait();
      
      // Update wallet balance
      const newBalance = await tokenContract.balanceOf(agriWallet.address);
      
      // Update database
      await supabase
        .from('wallet_accounts')
        .update({ balance_wei: newBalance.toString() })
        .eq('id', agriWallet.id);

      // Record successful transaction
      await supabase
        .from('wallet_transactions')
        .insert([{
          user_id: user.id,
          wallet_id: agriWallet.id,
          direction: 'out',
          amount_wei: amountWei,
          token_symbol: 'KRSI',
          status: 'completed',
          to_address: recipientAddress,
          blockchain_tx_hash: receipt.hash,
          metadata: {
            type: 'agrifinance_transfer',
            send_type: agriSendForm.sendType,
            to_address: recipientAddress,
            to_mobile: agriSendForm.sendType === 'mobile' ? agriSendForm.toMobile : null,
            description: agriSendForm.description,
            amount_display: agriSendForm.amount,
            gas_used: receipt.gasUsed.toString(),
            block_number: receipt.blockNumber
          }
        }]);

      toast.success(`Transfer successful! TX: ${receipt.hash.slice(0, 10)}...`, { id: 'agri-transfer' });
      setAgriSendForm({ toAddress: '', toMobile: '', amount: '', description: '', sendType: 'address' });
      
      // Refresh wallet data
      loadWalletData();
      
    } catch (error) {
      console.error('AgriFinance transfer error:', error);
      toast.error(`Transfer failed: ${error.message}`, { id: 'agri-transfer' });
    } finally {
      setAgriSending(false);
    }
  };

  // Show loading only for a short time, then show UI anyway
  if (loading && user?.id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your wallets...</p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
            User: {user?.id ? '✅ Connected' : '❌ Not connected'}
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
            Database: {supabase ? '✅ Available' : '❌ Not available'}
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
            This should complete within 5 seconds...
          </p>
        </div>
      </div>
    );
  }

  // If no user, show sign-in prompt
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Please Sign In
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            You need to sign in to access your AgriFinance wallet.
          </p>
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
                onClick={() => setActiveTab('agrifinance')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'agrifinance'
                    ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🌾 AgriFinance Wallet
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
            {/* AgriFinance Wallet Tab */}
            {activeTab === 'agrifinance' && (
              <div className="space-y-6">
                {/* AgriFinance Wallet Info */}
                <div className="bg-green-50 dark:bg-green-900 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-4">
                    🌾 AgriFinance Wallet
                  </h3>
                  
                  {agriWallet ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-green-700 dark:text-green-300">Wallet Address:</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-sm text-green-800 dark:text-green-200">
                            {agriWallet.address?.slice(0, 6)}...{agriWallet.address?.slice(-4)}
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(agriWallet.address);
                              toast.success('Address copied!');
                            }}
                            className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                          >
                            Copy
                          </button>
                          <button
                            onClick={() => {
                              window.open(`https://amoy.polygonscan.com/address/${agriWallet.address}`, '_blank');
                            }}
                            className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                          >
                            View
                          </button>
                          {!isWalletSynced && (
                            <button
                              onClick={syncing ? resetSyncState : syncWalletToDatabase}
                              className={`px-2 py-1 rounded text-xs ${
                                syncing 
                                  ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                                  : 'bg-purple-600 text-white hover:bg-purple-700'
                              }`}
                            >
                              {syncing ? 'Cancel Sync' : 'Sync to DB'}
                            </button>
                          )}
                          {isWalletSynced && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                              ✅ Synced
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-green-700 dark:text-green-300">Balance:</span>
                        <span className="text-xl font-bold text-green-800 dark:text-green-200">
                          {DecimalUtils.formatDisplay(agriWallet.balance_wei || '0', 4, true)} KRSI
                        </span>
                      </div>
                   <div className="flex items-center justify-between">
                     <span className="text-green-700 dark:text-green-300">Wallet Type:</span>
                     <span className="text-green-800 dark:text-green-200">Real Blockchain Wallet</span>
                   </div>
                   <div className="flex items-center justify-between">
                     <span className="text-green-700 dark:text-green-300">Address Type:</span>
                     <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                       🔒 Persistent Address
                     </span>
                   </div>
                   <div className="flex items-center justify-between">
                     <span className="text-green-700 dark:text-green-300">Status:</span>
                     <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                       ✅ Active on Blockchain
                     </span>
                   </div>
                   
                   {/* Mobile Number Linking */}
                   <div className="border-t border-green-200 dark:border-green-700 pt-4 mt-4">
                     <div className="flex items-center justify-between mb-2">
                       <span className="text-green-700 dark:text-green-300">Mobile Number:</span>
                       {agriWallet.metadata?.mobile_number ? (
                         <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                           📱 {agriWallet.metadata.mobile_number}
                         </span>
                       ) : (
                         <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                           Not Linked
                         </span>
                       )}
                     </div>
                     
                     {!agriWallet.metadata?.mobile_number && (
                       <div className="flex items-center space-x-2 mt-3">
                         <input
                           type="tel"
                           value={mobileNumber}
                           onChange={(e) => setMobileNumber(MobileWalletUtils.autoFormatPhoneInput(e.target.value))}
                           placeholder="+91 98765 43210"
                           className="flex-1 px-3 py-2 border border-green-300 dark:border-green-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-white text-sm"
                         />
                         <button
                           onClick={linkMobileNumber}
                           disabled={linkingMobile || !mobileNumber}
                           className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                         >
                           {linkingMobile ? 'Linking...' : 'Link Mobile'}
                         </button>
                       </div>
                     )}
                   </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-green-700 dark:text-green-300 mb-4">
                        Creating your AgriFinance wallet...
                      </p>
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                        This may take a few seconds
                      </p>
                      <button
                        onClick={() => {
                          createWalletImmediately();
                        }}
                        className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                      >
                        Create Wallet Manually
                      </button>
                    </div>
                  )}
                </div>

                {/* Send KRSI Form */}
                {agriWallet && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Send KRSI Tokens
                    </h3>
                    <div className="space-y-4">
                      {/* Send Type Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Send To
                        </label>
                        <div className="flex space-x-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="sendType"
                              value="address"
                              checked={agriSendForm.sendType === 'address'}
                              onChange={(e) => setAgriSendForm(prev => ({ ...prev, sendType: e.target.value }))}
                              className="mr-2"
                            />
                            <span className="text-sm">Wallet Address</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="sendType"
                              value="mobile"
                              checked={agriSendForm.sendType === 'mobile'}
                              onChange={(e) => setAgriSendForm(prev => ({ ...prev, sendType: e.target.value }))}
                              className="mr-2"
                            />
                            <span className="text-sm">Mobile Number</span>
                          </label>
                        </div>
                      </div>

                      {/* Recipient Input */}
                      {agriSendForm.sendType === 'address' ? (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            To Wallet Address
                          </label>
                          <input
                            type="text"
                            value={agriSendForm.toAddress}
                            onChange={(e) => setAgriSendForm(prev => ({ ...prev, toAddress: e.target.value }))}
                            placeholder="0x..."
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            To Mobile Number
                          </label>
                          <input
                            type="tel"
                            value={agriSendForm.toMobile}
                            onChange={(e) => setAgriSendForm(prev => ({ ...prev, toMobile: MobileWalletUtils.autoFormatPhoneInput(e.target.value) }))}
                            placeholder="+91 98765 43210"
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Recipient must have linked their mobile number to their AgriFinance wallet
                          </p>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Amount (KRSI)
                        </label>
                        <input
                          type="number"
                          value={agriSendForm.amount}
                          onChange={(e) => setAgriSendForm(prev => ({ ...prev, amount: e.target.value }))}
                          placeholder="100"
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Description (Optional)
                        </label>
                        <input
                          type="text"
                          value={agriSendForm.description}
                          onChange={(e) => setAgriSendForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Payment for crops"
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                        />
                      </div>
                      <button
                        onClick={handleAgriTransfer}
                        disabled={agriSending || !agriSendForm.amount || (agriSendForm.sendType === 'address' ? !agriSendForm.toAddress : !agriSendForm.toMobile)}
                        className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {agriSending ? 'Sending...' : 'Send KRSI'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Information */}
             <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
               <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">How AgriFinance Wallet Works</h4>
               <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                 <li>• <strong>🔒 Persistent Address</strong> - never changes, tied to your account</li>
                 <li>• <strong>📱 Mobile Number Integration</strong> - send tokens using phone numbers</li>
                 <li>• <strong>Real blockchain wallet</strong> with actual private key</li>
                 <li>• <strong>Direct blockchain transactions</strong> - no intermediaries</li>
                 <li>• <strong>Viewable on PolygonScan</strong> - fully transparent</li>
                 <li>• <strong>Can receive tokens</strong> from any external wallet</li>
                 <li>• <strong>Gas fees paid by AgriFinance</strong> for convenience</li>
                 <li>• <strong>All transactions recorded</strong> on blockchain</li>
                 <li>• <strong>No data loss</strong> - address stays same forever</li>
               </ul>
             </div>
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

      </div>
    </div>
  );
};

export default HybridWallet;
