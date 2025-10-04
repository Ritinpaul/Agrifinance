import React, { useEffect, useMemo, useState } from 'react';
import { useSupabase } from '../context/SupabaseContext';
import { useWeb3 } from '../context/Web3Context';
import { DecimalUtils, AmountValidation } from '../utils/decimalUtils';

const Wallet = () => {
  const { supabase, user } = useSupabase();
  const { account, krishiTokenContract, isConnected } = useWeb3();

  const [walletAccount, setWalletAccount] = useState(null);
  const [inAppBalanceWei, setInAppBalanceWei] = useState('0');
  const [metaMaskBalanceWei, setMetaMaskBalanceWei] = useState('0');
  const [loading, setLoading] = useState(true);
  const [addressInput, setAddressInput] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [amountError, setAmountError] = useState('');

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
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Wallet</h2>
        <p className="text-gray-600 dark:text-gray-400">Manage your in-app and MetaMask balances.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">In-App Wallet</h3>
          {loading ? (
            <div className="text-gray-600 dark:text-gray-400">Loading…</div>
          ) : (
            <>
              <div className="text-sm text-gray-500 dark:text-gray-400">Address</div>
              <div className="mb-2 text-gray-800 dark:text-gray-200">{walletAccount?.address || 'Assigned by backend'}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Balance</div>
              <div className="text-xl font-bold text-green-600">{inAppBalanceDisplay} KRSI</div>
            </>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">MetaMask</h3>
          <div className="text-sm text-gray-500 dark:text-gray-400">Connected Address</div>
          <div className="mb-2 text-gray-800 dark:text-gray-200">{account || 'Not connected'}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">KRSI Balance</div>
          <div className="text-xl font-bold text-blue-600">{metaMaskBalanceDisplay} KRSI</div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Withdraw to MetaMask</h3>
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
  );
};

export default Wallet;


