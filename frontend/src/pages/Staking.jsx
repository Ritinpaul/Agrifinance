import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useSupabase } from '../context/SupabaseContext';
import { useWeb3 } from '../context/Web3Context';
import { useBlockchainSync } from '../utils/blockchainSync';
import { DecimalUtils, AmountValidation } from '../utils/decimalUtils';

const Staking = () => {
  const { supabase, user } = useSupabase();
  const { account, krishiTokenContract, stakeTokens, unstakeTokens, claimStakingRewards, isConnected, provider } = useWeb3();
  const blockchainSync = useBlockchainSync(supabase, provider, {});

  const [positions, setPositions] = useState([]);
  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState('');
  const [lockDays, setLockDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadPositions = async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('staking_positions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setPositions(!error && Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    loadPositions();
  }, [user]);

  const handleAmountChange = (value) => {
    const formatted = AmountValidation.formatInput(value);
    setAmount(formatted);
    
    const validation = AmountValidation.validateInput(formatted);
    setAmountError(validation.error);
  };

  const onStake = async () => {
    if (!amount || !isConnected) return alert('Connect wallet and enter amount');
    
    // Validate amount
    const validation = AmountValidation.validateInput(amount);
    if (!validation.valid) {
      setAmountError(validation.error);
      return;
    }
    
    setIsSubmitting(true);
    try {
      const amountWei = DecimalUtils.toWei(amount);
      const lockSeconds = BigInt(lockDays) * 24n * 60n * 60n;
      const tx = await stakeTokens(amountWei, lockSeconds);

      // Record blockchain transaction
      await blockchainSync.recordTransaction({
        userId: user.id,
        txHash: tx.hash,
        transactionType: 'staking',
        fromAddress: account,
        toAddress: account, // staking to self
        amount: amount,
        tokenSymbol: 'KRSI',
        gasUsed: tx.gasUsed?.toString(),
        status: 'pending',
        relatedTable: 'staking_positions',
        metadata: { lockDays, amountWei: amountWei.toString() }
      });

      const now = new Date();
      const endsAt = new Date(now.getTime() + Number(lockDays) * 24 * 60 * 60 * 1000);
      const { data: position, error } = await supabase.from('staking_positions').insert([
        {
          user_id: user.id,
          amount_wei: amountWei,
          reward_rate: 5,
          lock_period_days: lockDays,
          started_at: now.toISOString(),
          ends_at: endsAt.toISOString(),
          status: 'active',
          metadata: { account, txHash: tx.hash }
        }
      ]).select().single();
      
      if (error) console.error(error);
      await loadPositions();
      setAmount('');
      setAmountError('');
      alert(`Staked ${amount} KRSI successfully! Transaction: ${tx.hash}`);
    } catch (e) {
      console.error(e);
      alert('Stake failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onUnstake = async (pos, index) => {
    setIsSubmitting(true);
    try {
      const tx = await unstakeTokens(index);

      // Record blockchain transaction
      await blockchainSync.recordTransaction({
        userId: user.id,
        txHash: tx.hash,
        transactionType: 'unstaking',
        fromAddress: account,
        toAddress: account,
        amount: pos.amount_display || DecimalUtils.fromWei(pos.amount_wei),
        tokenSymbol: 'KRSI',
        gasUsed: tx.gasUsed?.toString(),
        status: 'pending',
        relatedTable: 'staking_positions',
        relatedId: pos.id,
        metadata: { positionId: pos.id, stakeIndex: index }
      });

      const { error } = await supabase
        .from('staking_positions')
        .update({ status: 'completed' })
        .eq('id', pos.id);
      if (error) console.error(error);
      await loadPositions();
      alert(`Unstaked ${pos.amount_display || DecimalUtils.fromWei(pos.amount_wei)} KRSI successfully! Transaction: ${tx.hash}`);
    } catch (e) {
      console.error(e);
      alert('Unstake failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onClaim = async () => {
    setIsSubmitting(true);
    try {
      const tx = await claimStakingRewards();

      // Record blockchain transaction
      await blockchainSync.recordTransaction({
        userId: user.id,
        txHash: tx.hash,
        transactionType: 'token_transfer', // rewards are minted/transferred
        fromAddress: account,
        toAddress: account,
        amount: 0, // amount calculated by contract
        tokenSymbol: 'KRSI',
        gasUsed: tx.gasUsed?.toString(),
        status: 'pending',
        metadata: { type: 'staking_rewards' }
      });

      await loadPositions();
      alert(`Rewards claimed successfully! Transaction: ${tx.hash}`);
    } catch (e) {
      console.error(e);
      alert('Claim failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Staking</h2>
        <p className="text-gray-600 dark:text-gray-400">Stake KRSI and earn rewards.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Create Stake</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <input
              type="text"
              className={`form-input ${amountError ? 'border-red-500' : ''}`}
              placeholder="Amount (KRSI)"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
            />
            {amountError && (
              <div className="text-red-500 text-sm">{amountError}</div>
            )}
          </div>
          <input
            type="number"
            className="form-input"
            placeholder="Lock (days)"
            min="30"
            step="1"
            value={lockDays}
            onChange={(e) => setLockDays(parseInt(e.target.value || '30', 10))}
          />
          <button className="agri-button" onClick={onStake} disabled={isSubmitting || !amount}>
            {isSubmitting ? 'Submitting…' : 'Stake'}
          </button>
          <button className="agri-button" onClick={onClaim} disabled={isSubmitting}>
            Claim Rewards
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Your Positions</h3>
        {loading ? (
          <div className="text-gray-600 dark:text-gray-400">Loading…</div>
        ) : positions.length === 0 ? (
          <div className="text-gray-600 dark:text-gray-400">No positions yet.</div>
        ) : (
          <div className="space-y-3">
            {positions.map((p, idx) => (
              <div key={p.id} className="agri-card p-4 flex items-center justify-between">
                <div>
                  <div className="text-gray-800 dark:text-gray-200 font-medium">
                    {DecimalUtils.formatDisplay(p.amount_wei, 4, true)} KRSI
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Lock: {p.lock_period_days} days • Status: {p.status}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="agri-button" onClick={() => onUnstake(p, idx)} disabled={isSubmitting || p.status !== 'active'}>
                    Unstake
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Staking;


