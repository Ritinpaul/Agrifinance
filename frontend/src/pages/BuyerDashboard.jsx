import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { useTheme } from '../context/ThemeContext';

const BuyerDashboard = () => {
  const { account, isConnected } = useWeb3();
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('browse');
  const [availableBatches, setAvailableBatches] = useState([]);
  const [myPurchases, setMyPurchases] = useState([]);

  useEffect(() => {
    if (isConnected && account) {
      fetchAvailableBatches();
      fetchMyPurchases();
    }
  }, [isConnected, account]);

  const fetchAvailableBatches = async () => {
    // Mock available batches
    const mockBatches = [
      {
        id: 1,
        farmer: '0x1234...5678',
        productType: 'Wheat',
        quantity: 1000,
        pricePerUnit: 25,
        totalValue: 25000,
        location: 'Punjab, India',
        harvestDate: '2024-01-10',
        certification: 'Organic',
        qrCodeHash: 'abc123def456',
        farmerName: 'Rajesh Kumar',
        farmerReputation: 85
      },
      {
        id: 2,
        farmer: '0x9876...5432',
        productType: 'Rice',
        quantity: 800,
        pricePerUnit: 30,
        totalValue: 24000,
        location: 'Haryana, India',
        harvestDate: '2024-01-05',
        certification: 'Fair Trade',
        qrCodeHash: 'xyz789uvw012',
        farmerName: 'Priya Sharma',
        farmerReputation: 92
      },
      {
        id: 3,
        farmer: '0xabcd...efgh',
        productType: 'Corn',
        quantity: 1200,
        pricePerUnit: 20,
        totalValue: 24000,
        location: 'Maharashtra, India',
        harvestDate: '2024-01-15',
        certification: 'Organic',
        qrCodeHash: 'mno345pqr678',
        farmerName: 'Amit Patel',
        farmerReputation: 78
      }
    ];
    setAvailableBatches(mockBatches);
  };

  const fetchMyPurchases = async () => {
    // Mock my purchases
    const mockPurchases = [
      {
        id: 1,
        productType: 'Wheat',
        quantity: 500,
        pricePerUnit: 24,
        totalValue: 12000,
        farmer: '0x1111...2222',
        purchaseDate: '2024-01-12',
        status: 'delivered',
        qrCodeHash: 'delivered123'
      },
      {
        id: 2,
        productType: 'Rice',
        quantity: 300,
        pricePerUnit: 28,
        totalValue: 8400,
        farmer: '0x3333...4444',
        purchaseDate: '2024-01-08',
        status: 'in-transit',
        qrCodeHash: 'transit456'
      }
    ];
    setMyPurchases(mockPurchases);
  };

  const purchaseBatch = (batchId) => {
    // Mock purchase
    alert(`Batch ${batchId} purchased successfully!`);
    fetchAvailableBatches();
    fetchMyPurchases();
  };

  const verifyBatch = (qrCodeHash) => {
    // Mock verification
    alert(`Batch verified! QR Code: ${qrCodeHash}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'in-transit': return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'processing': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const tabs = [
    { id: 'browse', label: 'Browse Batches', icon: '🛒' },
    { id: 'purchases', label: 'My Purchases', icon: '📦' },
    { id: 'traceability', label: 'Traceability', icon: '🔍' }
  ];

  if (!isConnected) {
    return (
      <div className="text-center py-16">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-3">
            Wallet Not Connected
          </h2>
          <p className="text-yellow-700 dark:text-yellow-300 mb-4 text-sm">
            Please connect your MetaMask wallet to access the buyer dashboard.
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
              🛒 Buyer Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Welcome back, Buyer!
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Wallet: {account?.slice(0, 6)}...{account?.slice(-4)}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xl font-semibold text-green-600 dark:text-green-400">
              {myPurchases.length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500">Total Purchases</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="stats-card">
          <div className="stats-number">{availableBatches.length}</div>
          <div className="stats-label">Available Batches</div>
        </div>
        <div className="stats-card">
          <div className="stats-number">{myPurchases.length}</div>
          <div className="stats-label">My Purchases</div>
        </div>
        <div className="stats-card">
          <div className="stats-number">
            ${myPurchases.reduce((sum, purchase) => sum + purchase.totalValue, 0).toLocaleString()}
          </div>
          <div className="stats-label">Total Spent</div>
        </div>
        <div className="stats-card">
          <div className="stats-number">100%</div>
          <div className="stats-label">Verified Products</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-8">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600 dark:text-green-400'
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
          {activeTab === 'browse' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                Available Batches
              </h3>
              
              <div className="space-y-4">
                {availableBatches.map((batch) => (
                  <div key={batch.id} className="agri-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                          {batch.productType} Batch #{batch.id}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          {batch.farmerName} • {batch.location}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          ${batch.totalValue.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {batch.quantity} kg
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Price per Unit</div>
                        <div className="font-medium text-gray-900 dark:text-white">${batch.pricePerUnit}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Harvest Date</div>
                        <div className="font-medium text-gray-900 dark:text-white">{batch.harvestDate}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Certification</div>
                        <div className="font-medium text-gray-900 dark:text-white">{batch.certification}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Farmer Reputation</div>
                        <div className="font-medium text-gray-900 dark:text-white">{batch.farmerReputation}/100</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        QR Code: {batch.qrCodeHash}
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => verifyBatch(batch.qrCodeHash)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                        >
                          Verify
                        </button>
                        <button
                          onClick={() => purchaseBatch(batch.id)}
                          className="agri-button"
                        >
                          Purchase
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'purchases' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                My Purchases
              </h3>
              
              <div className="space-y-4">
                {myPurchases.map((purchase) => (
                  <div key={purchase.id} className="agri-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                          {purchase.productType} Purchase #{purchase.id}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          Farmer: {purchase.farmer}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(purchase.status)}`}>
                        {purchase.status.toUpperCase()}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Quantity</div>
                        <div className="font-medium text-gray-900 dark:text-white">{purchase.quantity} kg</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Price per Unit</div>
                        <div className="font-medium text-gray-900 dark:text-white">${purchase.pricePerUnit}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Total Value</div>
                        <div className="font-medium text-gray-900 dark:text-white">${purchase.totalValue.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Purchase Date</div>
                        <div className="font-medium text-gray-900 dark:text-white">{purchase.purchaseDate}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        QR Code: {purchase.qrCodeHash}
                      </div>
                      <button
                        onClick={() => verifyBatch(purchase.qrCodeHash)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                      >
                        Track Package
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'traceability' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                Product Traceability
              </h3>
              
              <div className="agri-card p-6">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  Scan QR Code for Traceability
                </h4>
                <div className="qr-code-container mb-4">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📱</div>
                    <p className="text-gray-600 dark:text-gray-400">Scan QR code to view complete product traceability</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="form-label">Or Enter QR Code Hash</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter QR code hash"
                    />
                  </div>
                  <button className="agri-button">
                    View Traceability
                  </button>
                </div>
              </div>

              <div className="agri-card p-6">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  Sample Traceability Report
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-800 dark:text-white">Farm Location</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Punjab, India</div>
                    </div>
                    <div className="text-green-600 dark:text-green-400">✓ Verified</div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-800 dark:text-white">Harvest Date</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">January 10, 2024</div>
                    </div>
                    <div className="text-green-600 dark:text-green-400">✓ Verified</div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-800 dark:text-white">Certification</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Organic</div>
                    </div>
                    <div className="text-green-600 dark:text-green-400">✓ Verified</div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-800 dark:text-white">Storage Conditions</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Temperature controlled</div>
                    </div>
                    <div className="text-green-600 dark:text-green-400">✓ Verified</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
