import React, { useEffect, useMemo, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useSupabase } from '../context/SupabaseContext';
import { useWeb3 } from '../context/Web3Context';
import { useBlockchainSync } from '../utils/blockchainSync';
import { useAdminApproval } from '../utils/adminApproval';
import { ethers } from 'ethers';

const NFTMarketplace = () => {
  const [activeTab, setActiveTab] = useState('browse');
  const { isDark } = useTheme();
  const { supabase, user } = useSupabase();
  const { account, buyNFT, isConnected, provider } = useWeb3();
  const blockchainSync = useBlockchainSync(supabase, provider, {});
  const adminApproval = useAdminApproval(supabase, { buyNFT });
  const [allNfts, setAllNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState({});
  const [userApprovals, setUserApprovals] = useState([]);

  useEffect(() => {
    fetchNfts();
    if (user?.id) {
      loadUserApprovals();
    }
  }, [supabase, user]);

  const myNFTs = useMemo(() => {
    if (!user?.id) return [];
    return allNfts.filter((n) => n.owner_address === account || n.farmer_id === user.id);
  }, [allNfts, user, account]);

  const availableNFTs = useMemo(() => {
    return allNfts.filter((n) => n.is_for_sale && n.owner_address !== account);
  }, [allNfts, account]);

  const tabs = [
    { id: 'browse', label: 'Browse NFTs', icon: '🛒' },
    { id: 'my-nfts', label: 'My NFTs', icon: '🧾' },
    { id: 'requests', label: 'My Requests', icon: '📋' },
    { id: 'mint', label: 'Mint NFT', icon: '➕' }
  ];

  const loadUserApprovals = async () => {
    if (!user?.id) return;
    try {
      const approvals = await adminApproval.getUserApprovals(user.id);
      setUserApprovals(approvals);
    } catch (error) {
      console.error('Error loading user approvals:', error);
    }
  };

  const purchaseNFT = async (nft) => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    if (!user?.id) {
      alert('Please sign in first');
      return;
    }

    setPurchasing(prev => ({ ...prev, [nft.id]: true }));

    try {
      // Request admin approval instead of direct purchase
      const approval = await adminApproval.requestNFTPurchase(
        { ...nft, userId: user.id },
        account,
        nft.price
      );

      alert(`NFT purchase request submitted for admin approval!\nRequest ID: ${approval.id}\n\nAn admin will review and process your request.`);
      
      // Refresh approvals list
      await loadUserApprovals();
      
    } catch (error) {
      console.error('Purchase request failed:', error);
      alert(`Purchase request failed: ${error.message}`);
    } finally {
      setPurchasing(prev => ({ ...prev, [nft.id]: false }));
    }
  };

  const fetchNfts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('nft_lands')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && Array.isArray(data)) {
      const mapped = data.map((row) => {
        const meta = row.metadata || {};
        return {
          id: row.id,
          tokenId: row.token_id ?? row.id,
          location: row.location || meta.location || '-',
          area: Number(row.land_size ?? meta.area ?? 0),
          soilType: meta.soilType || meta.soil_type || '-',
          cropHistory: meta.cropHistory || meta.crop_history || '-',
          isVerified: Boolean(meta.isVerified ?? meta.is_verified ?? false),
          creditScore: Number(meta.creditScore ?? meta.credit_score ?? 0),
          price: Number(row.price ?? meta.price ?? 0),
          farmerName: meta.farmerName || meta.farmer_name || '',
          farmer_id: row.farmer_id,
          owner_address: row.owner_address,
          is_for_sale: row.is_for_sale,
          blockchain_tx_hash: row.blockchain_tx_hash
        };
      });
      setAllNfts(mapped);
    } else {
      setAllNfts([]);
    }
    setLoading(false);
  };

  const transferNFT = (tokenId) => {
    const newOwner = prompt('Enter new owner address:');
    if (newOwner) {
      alert(`NFT ${tokenId} transferred to ${newOwner}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          🧾 NFT Marketplace
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Buy, sell, and trade land ownership NFTs
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="stats-card">
          <div className="stats-number">{loading ? '…' : availableNFTs.length}</div>
          <div className="stats-label">Available NFTs</div>
        </div>
        <div className="stats-card">
          <div className="stats-number">{loading ? '…' : myNFTs.length}</div>
          <div className="stats-label">My NFTs</div>
        </div>
        <div className="stats-card">
          <div className="stats-number">{loading ? '…' : `$${availableNFTs.reduce((sum, nft) => sum + (Number(nft.price) || 0), 0).toLocaleString()}`}</div>
          <div className="stats-label">Total Value</div>
        </div>
        <div className="stats-card">
          <div className="stats-number">100%</div>
          <div className="stats-label">Verified Lands</div>
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
                Available Land NFTs
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading && (
                  <div className="text-gray-600 dark:text-gray-400">Loading NFTs…</div>
                )}
                {!loading && availableNFTs.length === 0 && (
                  <div className="text-gray-600 dark:text-gray-400">No NFTs found.</div>
                )}
                {!loading && availableNFTs.map((nft) => (
                  <div key={nft.tokenId} className="agri-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                          Land NFT #{nft.tokenId}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          {nft.farmerName || 'Farmer'} • {nft.location}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          ${Number(nft.price || 0).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {nft.area} acres
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Soil Type</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{nft.soilType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Credit Score</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{nft.creditScore}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
                        <span className={`text-sm font-medium ${
                          nft.isVerified ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
                        }`}>
                          {nft.isVerified ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Crop History</div>
                      <div className="text-sm text-gray-700 dark:text-gray-300">{nft.cropHistory}</div>
                    </div>

                    <button
                      onClick={() => purchaseNFT(nft)}
                      className="w-full agri-button"
                      disabled={purchasing[nft.id] || !isConnected}
                    >
                      {purchasing[nft.id] ? 'Requesting...' : 'Request Purchase'}
                    </button>
                    
                    {nft.blockchain_tx_hash && (
                      <div className="mt-2">
                        <a 
                          href={blockchainSync.getBlockExplorerUrl(nft.blockchain_tx_hash)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          View Transaction ↗
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'my-nfts' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                My Land NFTs
              </h3>
              
              <div className="space-y-4">
                {myNFTs.map((nft) => (
                  <div key={nft.tokenId} className="agri-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                          Land NFT #{nft.tokenId}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          {nft.location} • {nft.area} acres
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        {nft.isVerified && (
                          <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-xs font-medium">
                            VERIFIED
                          </div>
                        )}
                        <div className="text-right">
                          <div className="text-sm text-gray-500 dark:text-gray-400">Credit Score</div>
                          <div className="text-lg font-bold text-green-600 dark:text-green-400">
                            {nft.creditScore}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Soil Type</div>
                        <div className="font-medium text-gray-900 dark:text-white">{nft.soilType}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Crop History</div>
                        <div className="font-medium text-gray-900 dark:text-white">{nft.cropHistory}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Status</div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {nft.isVerified ? 'Verified' : 'Pending Verification'}
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => transferNFT(nft.tokenId)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                      >
                        Transfer
                      </button>
                      <button className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                My Approval Requests
              </h3>
              
              {userApprovals.length === 0 ? (
                <div className="text-gray-600 dark:text-gray-400">No requests found.</div>
              ) : (
                <div className="space-y-4">
                  {userApprovals.map((request) => (
                    <div key={request.id} className="agri-card p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                            {request.transaction_type.replace('_', ' ').toUpperCase()}
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400">
                            Request ID: {request.id}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            request.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            request.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            request.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                            'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          }`}>
                            {request.status.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Requested</div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {new Date(request.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        {request.approved_at && (
                          <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Processed</div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {new Date(request.approved_at).toLocaleDateString()}
                            </div>
                          </div>
                        )}
                      </div>

                      {request.admin_notes && (
                        <div className="mb-4">
                          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Admin Notes</div>
                          <div className="text-sm text-gray-700 dark:text-gray-300">{request.admin_notes}</div>
                        </div>
                      )}

                      {request.blockchain_tx_hash && (
                        <div className="mt-4">
                          <a 
                            href={blockchainSync.getBlockExplorerUrl(request.blockchain_tx_hash)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            View Transaction ↗
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'mint' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                Mint New Land NFT
              </h3>
              
              <div className="agri-card p-6">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  Create Land NFT
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Mint an NFT representing your land ownership to improve your creditworthiness and enable trading.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="form-label">Location</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Enter land location"
                      />
                    </div>

                    <div>
                      <label className="form-label">Area (acres)</label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="Enter land area"
                        min="0"
                        step="0.1"
                      />
                    </div>

                    <div>
                      <label className="form-label">Soil Type</label>
                      <select className="form-input">
                        <option value="">Select soil type</option>
                        <option value="Alluvial">Alluvial</option>
                        <option value="Black Soil">Black Soil</option>
                        <option value="Red Soil">Red Soil</option>
                        <option value="Sandy Loam">Sandy Loam</option>
                        <option value="Clay">Clay</option>
                        <option value="Loamy">Loamy</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="form-label">Crop History</label>
                      <textarea
                        className="form-input"
                        rows="3"
                        placeholder="Enter previous crops grown"
                      />
                    </div>

                    <div>
                      <label className="form-label">Document Hash</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="IPFS hash of land documents"
                      />
                    </div>

                    <div>
                      <label className="form-label">Minting Fee</label>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Cost: 10 MATIC tokens
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button className="agri-button">
                    Mint Land NFT
                  </button>
                </div>
              </div>

              <div className="agri-card p-6">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  NFT Benefits
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <span className="text-green-600 dark:text-green-400 text-sm">✓</span>
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">Improves creditworthiness</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <span className="text-green-600 dark:text-green-400 text-sm">✓</span>
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">Verifiable land ownership</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <span className="text-green-600 dark:text-green-400 text-sm">✓</span>
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">Tracks land performance</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <span className="text-green-600 dark:text-green-400 text-sm">✓</span>
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">Enables trading</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <span className="text-green-600 dark:text-green-400 text-sm">✓</span>
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">Better risk assessment</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <span className="text-green-600 dark:text-green-400 text-sm">✓</span>
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">Blockchain security</span>
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

export default NFTMarketplace;
