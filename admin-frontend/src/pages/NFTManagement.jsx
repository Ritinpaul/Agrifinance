import { useState, useEffect } from 'react';
import { CubeIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

const NFTManagement = () => {
  const [nfts, setNfts] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Mock data - replace with real API call
    const mockNFTs = [
      {
        id: 1,
        tokenId: 1,
        owner: '0x1234...5678',
        location: 'Punjab, India',
        area: 5000,
        soilType: 'Alluvial',
        isVerified: false,
        createdAt: new Date('2024-01-15')
      },
      {
        id: 2,
        tokenId: 2,
        owner: '0x2345...6789',
        location: 'Haryana, India',
        area: 7500,
        soilType: 'Black Soil',
        isVerified: true,
        createdAt: new Date('2024-01-10')
      }
    ];
    
    setNfts(mockNFTs);
  }, []);

  const handleVerifyNFT = async (nftId) => {
    setNfts(nfts.map(nft => 
      nft.id === nftId ? { ...nft, isVerified: true } : nft
    ));
  };

  const handleRejectNFT = async (nftId) => {
    setNfts(nfts.filter(nft => nft.id !== nftId));
  };

  const filteredNFTs = nfts.filter(nft => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !nft.isVerified;
    if (filter === 'verified') return nft.isVerified;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">NFT Management</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage land NFT verifications and approvals
        </p>
      </div>

      <div className="flex space-x-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="admin-button admin-button-secondary"
        >
          <option value="all">All NFTs</option>
          <option value="pending">Pending Verification</option>
          <option value="verified">Verified NFTs</option>
        </select>
      </div>

      <div className="admin-card">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="admin-table th">
                  NFT Details
                </th>
                <th className="admin-table th">
                  Location
                </th>
                <th className="admin-table th">
                  Area (sq m)
                </th>
                <th className="admin-table th">
                  Soil Type
                </th>
                <th className="admin-table th">
                  Status
                </th>
                <th className="admin-table th">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredNFTs.map((nft) => (
                <tr key={nft.id}>
                  <td className="admin-table td">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-600 flex items-center justify-center">
                          <CubeIcon className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Token ID: {nft.tokenId}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {nft.owner}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="admin-table td">
                    {nft.location}
                  </td>
                  <td className="admin-table td">
                    {nft.area.toLocaleString()}
                  </td>
                  <td className="admin-table td">
                    {nft.soilType}
                  </td>
                  <td className="admin-table td">
                    <span className={`admin-badge ${
                      nft.isVerified 
                        ? 'admin-badge-success' 
                        : 'admin-badge-warning'
                    }`}>
                      {nft.isVerified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="admin-table td">
                    {!nft.isVerified && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleVerifyNFT(nft.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <CheckIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleRejectNFT(nft.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NFTManagement;
