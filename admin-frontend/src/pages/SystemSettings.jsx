import { useState, useEffect } from 'react';
import { 
  CogIcon, 
  CurrencyDollarIcon, 
  ShieldCheckIcon, 
  ChartBarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    platformFee: 5,
    verificationFee: 20,
    mintingFee: 10,
    minCreditScore: 600,
    maxLoanAmount: 10000,
    minLoanAmount: 100,
    farmerProfitPercentage: 75,
    platformProfitPercentage: 5
  });

  const [systemStatus, setSystemStatus] = useState({
    platform: 'online',
    contracts: 'active',
    ai: 'running',
    database: 'connected'
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:3001/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSettings({
          platformFee: data.platformFee,
          verificationFee: data.verificationFee,
          mintingFee: data.mintingFee,
          minCreditScore: data.minCreditScore,
          maxLoanAmount: data.maxLoanAmount,
          minLoanAmount: data.minLoanAmount,
          farmerProfitPercentage: data.farmerProfitPercentage,
          platformProfitPercentage: data.platformProfitPercentage
        });
        setSystemStatus(data.systemStatus);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:3001/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setMessage('Settings saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        const data = await response.json();
        setMessage(data.error || 'Failed to save settings');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Save settings error:', error);
      setMessage('Network error. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const refreshStatus = async () => {
    setRefreshing(true);
    try {
      // Mock refresh - replace with real API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSystemStatus({
        platform: 'online',
        contracts: 'active',
        ai: 'running',
        database: 'connected'
      });
    } catch (error) {
      console.error('Failed to refresh status:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
      case 'active':
      case 'running':
      case 'connected':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'offline':
      case 'inactive':
      case 'stopped':
      case 'disconnected':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
      case 'active':
      case 'running':
      case 'connected':
        return 'admin-status-online';
      case 'offline':
      case 'inactive':
      case 'stopped':
      case 'disconnected':
        return 'admin-status-offline';
      default:
        return 'admin-status-warning';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">System Settings</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Configure platform parameters, fees, and monitor system health
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={refreshStatus}
            disabled={refreshing}
            className="admin-button admin-button-secondary flex items-center space-x-2"
          >
            <ArrowPathIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Status'}</span>
          </button>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Fee Settings */}
        <div className="admin-card group hover:shadow-2xl transition-all duration-300">
          <div className="admin-card-header">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-4">
                <CurrencyDollarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Fee Settings</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Configure platform fees and charges</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="admin-label">Platform Fee (%)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.platformFee}
                  onChange={(e) => handleInputChange('platformFee', e.target.value)}
                  className="admin-input"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">%</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="admin-label">Verification Fee (MATIC)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={settings.verificationFee}
                  onChange={(e) => handleInputChange('verificationFee', e.target.value)}
                  className="admin-input"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">MATIC</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="admin-label">NFT Minting Fee (MATIC)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={settings.mintingFee}
                  onChange={(e) => handleInputChange('mintingFee', e.target.value)}
                  className="admin-input"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">MATIC</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loan Settings */}
        <div className="admin-card group hover:shadow-2xl transition-all duration-300">
          <div className="admin-card-header">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-4">
                <ChartBarIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Loan Settings</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Configure loan parameters and limits</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="admin-label">Minimum Credit Score</label>
              <input
                type="number"
                min="300"
                max="850"
                value={settings.minCreditScore}
                onChange={(e) => handleInputChange('minCreditScore', e.target.value)}
                className="admin-input"
              />
            </div>
            
            <div className="space-y-2">
              <label className="admin-label">Maximum Loan Amount (INR)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={settings.maxLoanAmount}
                  onChange={(e) => handleInputChange('maxLoanAmount', e.target.value)}
                  className="admin-input"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">₹</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="admin-label">Minimum Loan Amount (INR)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={settings.minLoanAmount}
                  onChange={(e) => handleInputChange('minLoanAmount', e.target.value)}
                  className="admin-input"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">₹</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profit Distribution */}
        <div className="admin-card group hover:shadow-2xl transition-all duration-300">
          <div className="admin-card-header">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-4">
                <CogIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Profit Distribution</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Configure profit sharing percentages</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="admin-label">Farmer Profit Percentage (%)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.farmerProfitPercentage}
                  onChange={(e) => handleInputChange('farmerProfitPercentage', e.target.value)}
                  className="admin-input"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">%</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="admin-label">Platform Profit Percentage (%)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.platformProfitPercentage}
                  onChange={(e) => handleInputChange('platformProfitPercentage', e.target.value)}
                  className="admin-input"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="admin-card group hover:shadow-2xl transition-all duration-300">
          <div className="admin-card-header">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg mr-4">
                <ShieldCheckIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">System Status</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Monitor platform health and services</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(systemStatus.platform)}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Platform Status</span>
              </div>
              <span className={`text-sm font-semibold ${getStatusColor(systemStatus.platform)}`}>
                {systemStatus.platform.charAt(0).toUpperCase() + systemStatus.platform.slice(1)}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(systemStatus.contracts)}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Smart Contracts</span>
              </div>
              <span className={`text-sm font-semibold ${getStatusColor(systemStatus.contracts)}`}>
                {systemStatus.contracts.charAt(0).toUpperCase() + systemStatus.contracts.slice(1)}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(systemStatus.ai)}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">AI Service</span>
              </div>
              <span className={`text-sm font-semibold ${getStatusColor(systemStatus.ai)}`}>
                {systemStatus.ai.charAt(0).toUpperCase() + systemStatus.ai.slice(1)}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(systemStatus.database)}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Database</span>
              </div>
              <span className={`text-sm font-semibold ${getStatusColor(systemStatus.database)}`}>
                {systemStatus.database.charAt(0).toUpperCase() + systemStatus.database.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleSave}
          disabled={loading}
          className="admin-button admin-button-primary px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <ArrowPathIcon className="h-5 w-5 animate-spin" />
              <span>Saving...</span>
            </div>
          ) : (
            'Save Settings'
          )}
        </button>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-sm border ${
          message.includes('success') 
            ? 'bg-green-500/90 text-white border-green-400' 
            : 'bg-red-500/90 text-white border-red-400'
        }`}>
          <div className="flex items-center space-x-3">
            {message.includes('success') ? (
              <CheckCircleIcon className="h-6 w-6" />
            ) : (
              <XCircleIcon className="h-6 w-6" />
            )}
            <span className="font-medium">{message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemSettings;