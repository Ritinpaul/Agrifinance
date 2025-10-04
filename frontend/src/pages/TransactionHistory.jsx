import React, { useEffect, useState } from 'react';
import { useSupabase } from '../context/SupabaseContext';
import { useWeb3 } from '../context/Web3Context';
import { useBlockchainSync } from '../utils/blockchainSync';

const TransactionHistory = () => {
  const { supabase, user } = useSupabase();
  const { provider } = useWeb3();
  const blockchainSync = useBlockchainSync(supabase, provider, {});
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadTransactions();
    }
  }, [user]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const txs = await blockchainSync.getUserTransactions(user.id, 100);
      const formatted = txs.map(tx => blockchainSync.formatTransaction(tx));
      setTransactions(formatted);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncTransactions = async () => {
    setSyncing(true);
    try {
      await blockchainSync.syncPendingTransactions();
      await loadTransactions();
    } catch (error) {
      console.error('Error syncing transactions:', error);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Transaction History</h2>
            <p className="text-gray-600 dark:text-gray-400">View all your blockchain transactions</p>
          </div>
          <button 
            onClick={syncTransactions}
            disabled={syncing}
            className="agri-button"
          >
            {syncing ? 'Syncing...' : 'Sync with Blockchain'}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {loading ? (
          <div className="p-6 text-center text-gray-600 dark:text-gray-400">
            Loading transactions...
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-6 text-center text-gray-600 dark:text-gray-400">
            No transactions found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Transaction
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {tx.typeLabel}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {tx.formattedAmount} {tx.token_symbol}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${tx.statusColor}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {tx.tx_hash ? (
                        <a
                          href={tx.blockExplorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          {tx.tx_hash.slice(0, 10)}...{tx.tx_hash.slice(-8)} ↗
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;
