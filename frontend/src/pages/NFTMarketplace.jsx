// frontend/src/pages/NFTMarketplace.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useWeb3 } from '../context/Web3Context';
import { useBlockchainSync } from '../utils/blockchainSync';
import { useAdminApproval } from '../utils/adminApproval';
import { ethers } from 'ethers';
import apiClient from '../lib/api';

const NFTMarketplace = () => {
  const [activeTab, setActiveTab] = useState('browse');
  const { isDark } = useTheme();
  const { user } = useAuth();
  const { account, buyNFT, isConnected, provider } = useWeb3();
  const blockchainSync = useBlockchainSync(provider, {});
  const adminApproval = useAdminApproval({ buyNFT });
  const [allNfts, setAllNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState({});
  const [userApprovals, setUserApprovals] = useState([]);

  useEffect(() => {
    loadNFTs();
    if (user?.id) {
      loadUserApprovals();
    }
  }, [user]);

  const loadNFTs = async () => {
    setLoading(true);
    try {
      console.log('🔄 Loading NFTs from database...');
      const result = await apiClient.get('/nfts');
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      console.log('✅ Loaded NFTs:', result.data?.count || 0);
      setAllNfts(result.data?.nfts || []);
    } catch (error) {
      console.error('Error loading NFTs:', error);
      setAllNfts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUserApprovals = async () => {
    try {
      // Simulate loading user approvals
      setUserApprovals([]);
    } catch (error) {
      console.error('Error loading user approvals:', error);
    }
  };

  const handlePurchase = async (nftId) => {
    if (!user?.id) {
      alert('Please sign in to purchase NFTs');
      return;
    }

    setPurchasing(prev => ({ ...prev, [nftId]: true }));
    try {
      // Simulate purchase
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Purchasing NFT:', nftId);
    } catch (error) {
      console.error('Error purchasing NFT:', error);
    } finally {
      setPurchasing(prev => ({ ...prev, [nftId]: false }));
    }
  };

  const filteredNFTs = useMemo(() => {
    return allNfts.filter(nft => nft.is_listed);
  }, [allNfts]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Please sign in to access the NFT marketplace
            </h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            NFT Marketplace
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Buy and sell agricultural land NFTs
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('browse')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors duration-200 ${
              activeTab === 'browse'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Browse NFTs
          </button>
          <button
            onClick={() => setActiveTab('my-purchases')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors duration-200 ${
              activeTab === 'my-purchases'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            My Purchases
          </button>
          <button
            onClick={() => setActiveTab('approvals')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors duration-200 ${
              activeTab === 'approvals'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Pending Approvals
          </button>
        </div>

        {/* Browse NFTs Tab */}
        {activeTab === 'browse' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Available Land NFTs
            </h2>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Loading NFTs...</p>
              </div>
            ) : filteredNFTs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">
                  No NFTs available for purchase
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNFTs.map((nft) => (
                  <div key={nft.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                    <div className="aspect-w-16 aspect-h-9">
                      <img 
                        src={nft.image_url} 
                        alt={nft.name}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop';
                        }}
                      />
                    </div>
                    <div className="p-6">
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {nft.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                          {nft.description?.substring(0, 100)}...
                        </p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {ethers.formatUnits(nft.price_wei, 6)} KRSI
                        </p>
                      </div>
                      
                      <button
                        onClick={() => handlePurchase(nft.id)}
                        disabled={purchasing[nft.id] || !isConnected}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                      >
                        {purchasing[nft.id] ? 'Purchasing...' : 'Buy NFT'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Purchases Tab */}
        {activeTab === 'my-purchases' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Your Purchased NFTs
            </h2>
            
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                No purchased NFTs found
              </p>
            </div>
          </div>
        )}

        {/* Approvals Tab */}
        {activeTab === 'approvals' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Pending Approvals
            </h2>
            
            {userApprovals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">
                  No pending approvals
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {userApprovals.map((approval) => (
                  <div key={approval.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {approval.approval_type}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Status: {approval.status}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        approval.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : approval.status === 'approved'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {approval.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NFTMarketplace;