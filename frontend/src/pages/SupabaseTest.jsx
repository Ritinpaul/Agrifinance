import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const SupabaseTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('Testing...');
  const [tableStatus, setTableStatus] = useState({});
  const [authStatus, setAuthStatus] = useState('Testing...');

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      // Test auth
      const { data: authData, error: authError } = await supabase.auth.getSession();
      setAuthStatus(authError ? `Auth Error: ${authError.message}` : 'Auth OK');

      // Test database tables
      const tables = ['users', 'farmers', 'lenders', 'buyers', 'loans', 'batches', 'nft_lands', 'supply_chain', 'credit_scores', 'transactions', 'admin_users', 'system_settings'];
      
      const results = {};
      for (const table of tables) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('count')
            .limit(1);
          
          results[table] = error ? `Error: ${error.message}` : 'OK';
        } catch (err) {
          results[table] = `Exception: ${err.message}`;
        }
      }
      
      setTableStatus(results);
      setConnectionStatus('Connection test completed');
      
    } catch (error) {
      setConnectionStatus(`Connection failed: ${error.message}`);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Supabase Connection Test</h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Connection Status:</h2>
        <p className="text-sm">{connectionStatus}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Auth Status:</h2>
        <p className="text-sm">{authStatus}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Table Status:</h2>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(tableStatus).map(([table, status]) => (
            <div key={table} className="p-2 border rounded">
              <strong>{table}:</strong> <span className={status === 'OK' ? 'text-green-600' : 'text-red-600'}>{status}</span>
            </div>
          ))}
        </div>
      </div>

      <button 
        onClick={testConnection}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Test Again
      </button>
    </div>
  );
};

export default SupabaseTest;
