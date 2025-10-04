import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const SupplyChain = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [qrCode, setQrCode] = useState('');
  const { isDark } = useTheme();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'track', label: 'Track Product', icon: '🔍' },
    { id: 'verify', label: 'Verify Batch', icon: '✅' }
  ];

  const sampleTraceability = {
    batchId: 'BATCH-001',
    productType: 'Wheat',
    farmer: 'Rajesh Kumar',
    location: 'Punjab, India',
    harvestDate: '2024-01-10',
    certification: 'Organic',
    quantity: 1000,
    pricePerUnit: 25,
    status: 'verified',
    timeline: [
      { step: 'Planting', date: '2023-10-15', status: 'completed' },
      { step: 'Growing', date: '2023-11-20', status: 'completed' },
      { step: 'Harvesting', date: '2024-01-10', status: 'completed' },
      { step: 'Processing', date: '2024-01-12', status: 'completed' },
      { step: 'Packaging', date: '2024-01-14', status: 'completed' },
      { step: 'Transportation', date: '2024-01-16', status: 'in-progress' },
      { step: 'Delivery', date: '2024-01-18', status: 'pending' }
    ]
  };

  const handleQrScan = () => {
    if (qrCode) {
      alert(`QR Code scanned: ${qrCode}`);
    } else {
      alert('Please enter a QR code hash');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          📦 Supply Chain Tracking
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your produce from farm to market with complete transparency
        </p>
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
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                Supply Chain Overview
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="agri-card p-6 text-center">
                  <div className="text-4xl mb-4">🌱</div>
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                    Farm to Fork
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Complete traceability from seed to consumer
                  </p>
                </div>
                
                <div className="agri-card p-6 text-center">
                  <div className="text-4xl mb-4">🔒</div>
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                    Blockchain Security
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Immutable records ensure data integrity
                  </p>
                </div>
                
                <div className="agri-card p-6 text-center">
                  <div className="text-4xl mb-4">📱</div>
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                    QR Code Access
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Instant access to product information
                  </p>
                </div>
              </div>

              <div className="agri-card p-6">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  How It Works
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">🌾</span>
                    </div>
                    <h5 className="font-semibold text-gray-800 dark:text-white mb-2">1. Harvest</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Farmer harvests and creates batch</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">📋</span>
                    </div>
                    <h5 className="font-semibold text-gray-800 dark:text-white mb-2">2. Verify</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Batch gets verified and certified</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">🚚</span>
                    </div>
                    <h5 className="font-semibold text-gray-800 dark:text-white mb-2">3. Transport</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Tracked through supply chain</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">🛒</span>
                    </div>
                    <h5 className="font-semibold text-gray-800 dark:text-white mb-2">4. Purchase</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Buyer purchases verified product</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'track' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                Track Product
              </h3>
              
              <div className="agri-card p-6">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  Enter QR Code or Batch ID
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="form-label">QR Code Hash or Batch ID</label>
                    <input
                      type="text"
                      value={qrCode}
                      onChange={(e) => setQrCode(e.target.value)}
                      className="form-input"
                      placeholder="Enter QR code hash or batch ID"
                    />
                  </div>
                  <button
                    onClick={handleQrScan}
                    className="agri-button"
                  >
                    Track Product
                  </button>
                </div>
              </div>

              <div className="agri-card p-6">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  Sample Traceability Report
                </h4>
                
                <div className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Batch ID</div>
                      <div className="font-medium text-gray-900 dark:text-white">{sampleTraceability.batchId}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Product Type</div>
                      <div className="font-medium text-gray-900 dark:text-white">{sampleTraceability.productType}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Farmer</div>
                      <div className="font-medium text-gray-900 dark:text-white">{sampleTraceability.farmer}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Location</div>
                      <div className="font-medium text-gray-900 dark:text-white">{sampleTraceability.location}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Harvest Date</div>
                      <div className="font-medium text-gray-900 dark:text-white">{sampleTraceability.harvestDate}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Certification</div>
                      <div className="font-medium text-gray-900 dark:text-white">{sampleTraceability.certification}</div>
                    </div>
                  </div>
                </div>

                <h5 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  Supply Chain Timeline
                </h5>
                <div className="space-y-3">
                  {sampleTraceability.timeline.map((step, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                        step.status === 'completed' ? 'bg-green-500' :
                        step.status === 'in-progress' ? 'bg-blue-500' :
                        'bg-gray-300 dark:bg-gray-600'
                      }`}>
                        {step.status === 'completed' ? '✓' :
                         step.status === 'in-progress' ? '⏳' : '○'}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-800 dark:text-white">{step.step}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{step.date}</div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        step.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                        step.status === 'in-progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                        'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-300'
                      }`}>
                        {step.status.toUpperCase()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'verify' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                Verify Batch
              </h3>
              
              <div className="agri-card p-6">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  Batch Verification
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Verify the authenticity and quality of agricultural batches using blockchain technology.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="form-label">Batch ID</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter batch ID to verify"
                    />
                  </div>
                  <button className="agri-button">
                    Verify Batch
                  </button>
                </div>
              </div>

              <div className="agri-card p-6">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  Verification Benefits
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <span className="text-green-600 dark:text-green-400 text-sm">✓</span>
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">Authenticity verification</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <span className="text-green-600 dark:text-green-400 text-sm">✓</span>
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">Quality assurance</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <span className="text-green-600 dark:text-green-400 text-sm">✓</span>
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">Supply chain transparency</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <span className="text-green-600 dark:text-green-400 text-sm">✓</span>
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">Certification validation</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <span className="text-green-600 dark:text-green-400 text-sm">✓</span>
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">Farmer reputation check</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <span className="text-green-600 dark:text-green-400 text-sm">✓</span>
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">Blockchain immutability</span>
                    </div>
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

export default SupplyChain;
