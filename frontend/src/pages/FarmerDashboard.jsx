import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import LoanApplication from '../components/LoanApplication';
import BatchManagement from '../components/BatchManagement';
import NFTManagement from '../components/NFTManagement';
import CreditScore from '../components/CreditScore';

const FarmerDashboard = () => {
  const { account, isConnected } = useWeb3();
  const [activeTab, setActiveTab] = useState('overview');
  const [farmerData, setFarmerData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isConnected && account) {
      fetchFarmerData();
    }
  }, [isConnected, account]);

  const fetchFarmerData = async () => {
    setLoading(true);
    try {
      // Mock data for development
      const mockData = {
        name: 'Rajesh Kumar',
        location: 'Punjab, India',
        creditScore: 720,
        reputation: 85,
        totalLoans: 3,
        totalBatches: 12,
        totalArea: 25.5,
        nftLands: 2,
        recentActivity: [
          { type: 'loan', amount: 5000, status: 'active', date: '2024-01-15' },
          { type: 'batch', product: 'Wheat', quantity: 1000, status: 'verified', date: '2024-01-10' },
          { type: 'nft', action: 'minted', tokenId: 123, date: '2024-01-05' }
        ]
      };
      setFarmerData(mockData);
    } catch (error) {
      console.error('Error fetching farmer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'loans', label: 'Loans', icon: '💰' },
    { id: 'batches', label: 'Batches', icon: '📦' },
    { id: 'nft', label: 'Land NFTs', icon: '🧾' },
    { id: 'credit', label: 'Credit Score', icon: '🤖' }
  ];

  if (!isConnected) {
    return (
      <div className="text-center py-20">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-yellow-800 mb-4">
            Wallet Not Connected
          </h2>
          <p className="text-yellow-700 mb-6">
            Please connect your MetaMask wallet to access the farmer dashboard.
          </p>
          <button className="agri-button">
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="agri-card p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
              👨‍🌾 Farmer Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Welcome back, {farmerData?.name || 'Farmer'}!
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Wallet: {account?.slice(0, 6)}...{account?.slice(-4)}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xl font-semibold text-green-600 dark:text-green-400">
              {farmerData?.creditScore || 0}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500">Credit Score</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="stats-card">
          <div className="stats-number">{farmerData?.totalLoans || 0}</div>
          <div className="stats-label">Active Loans</div>
        </div>
        <div className="stats-card">
          <div className="stats-number">{farmerData?.totalBatches || 0}</div>
          <div className="stats-label">Total Batches</div>
        </div>
        <div className="stats-card">
          <div className="stats-number">{farmerData?.totalArea || 0} acres</div>
          <div className="stats-label">Total Land Area</div>
        </div>
        <div className="stats-card">
          <div className="stats-number">{farmerData?.nftLands || 0}</div>
          <div className="stats-label">Land NFTs</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="agri-card mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-6 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-green-500 dark:border-green-400 text-green-600 dark:text-green-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div>
              <h3 className="card-title mb-4">
                Recent Activity
              </h3>
              <div className="space-y-3">
                {farmerData?.recentActivity?.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        {activity.type === 'loan' && '💰'}
                        {activity.type === 'batch' && '📦'}
                        {activity.type === 'nft' && '🧾'}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                          {activity.type === 'loan' && `Loan of $${activity.amount}`}
                          {activity.type === 'batch' && `${activity.product} Batch (${activity.quantity} kg)`}
                          {activity.type === 'nft' && `Land NFT #${activity.tokenId} ${activity.action}`}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">{activity.date}</div>
                      </div>
                    </div>
                    <div className={`status-badge ${
                      activity.status === 'active' ? 'status-active' :
                      activity.status === 'verified' ? 'status-verified' :
                      'status-pending'
                    }`}>
                      {activity.status || 'completed'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'loans' && <LoanApplication />}
          {activeTab === 'batches' && <BatchManagement />}
          {activeTab === 'nft' && <NFTManagement />}
          {activeTab === 'credit' && <CreditScore />}
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
