import { useState, useEffect } from 'react';
import { CubeIcon, CheckIcon, XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import adminApi from '../lib/api';
import { ethers } from 'ethers';

const NFTManagement = () => {
  const [nfts, setNfts] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [filter, setFilter] = useState('all');
  const [newNFT, setNewNFT] = useState({ name: '', description: '', image_url: '', price_krsi: '' });
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load NFTs
      console.log('Loading NFTs...');
      const nftResp = await adminApi.getNFTs();
      console.log('NFT Response:', nftResp);
      const items = nftResp?.nfts || nftResp?.items || [];
      console.log('NFT Items:', items);
      setNfts(items.map(n => ({
        id: n.id,
        tokenId: n.token_id,
        name: n.name || n.metadata?.name || 'Unnamed NFT',
        description: n.description || n.metadata?.description || '',
        imageUrl: n.image_url || n.metadata?.image_url || '',
        owner: n.owner_id || n.owner_address || '',
        location: n.location || n.metadata?.location || '',
        area: n.area || n.metadata?.area || 0,
        soilType: n.soil_type || n.metadata?.soilType || '',
        isApproved: Boolean(n.is_approved),
        isVerified: Boolean(n.is_verified || n.isVerified),
        priceWei: n.price_wei,
        isListed: n.is_listed,
        createdAt: n.created_at ? new Date(n.created_at) : null
      })));

      // Load pending approvals
      console.log('Loading approvals...');
      const approvalResp = await adminApi.getPendingApprovals();
      console.log('Approval Response:', approvalResp);
      const approvalsList = approvalResp?.approvals || [];
      console.log('Approvals List:', approvalsList);
      setApprovals(approvalsList);
    } catch (e) {
      console.error('Failed to load data:', e);
      setError(e.message || 'Failed to load data');
      setNfts([]);
      setApprovals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApproveRequest = async (approvalId) => {
    try {
      await adminApi.approveRequest(approvalId, 'Approved by admin');
      await loadData(); // Reload to show updated status
    } catch (e) {
      console.error('Approve failed:', e);
      alert(e.message || 'Failed to approve request');
    }
  };

  const handleRejectRequest = async (approvalId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    
    try {
      await adminApi.rejectRequest(approvalId, reason);
      await loadData(); // Reload to show updated status
    } catch (e) {
      console.error('Reject failed:', e);
      alert(e.message || 'Failed to reject request');
    }
  };

  const handleSetPrice10KRSI = async (nft) => {
    try {
      const tenKRSIWei = ethers.parseUnits('10', 6).toString();
      await adminApi.setNFTPrice({ nft_id: nft.id, token_id: nft.tokenId, price_wei: tenKRSIWei });
      await loadData();
    } catch (e) {
      console.error('Set price failed:', e);
      alert(e.message || 'Failed to set price');
    }
  };

  const handleCreateNFT = async (e) => {
    e.preventDefault();
    if (!newNFT.name) return;
    setCreating(true);
    try {
      await adminApi.createNFT(newNFT);
      setNewNFT({ name: '', description: '', image_url: '', price_krsi: '' });
      await loadData();
    } catch (e) {
      console.error('Create NFT failed:', e);
      alert(e.message || 'Create NFT failed');
    } finally {
      setCreating(false);
    }
  };

  const filteredNFTs = nfts.filter(nft => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !nft.isApproved;
    if (filter === 'approved') return nft.isApproved;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">NFT Management</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage land NFT verifications and approvals
          </p>
        </div>
        <button 
          onClick={loadData}
          disabled={loading}
          className="admin-button admin-button-secondary flex items-center space-x-2"
        >
          <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="admin-card bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <p className="text-red-800 dark:text-red-200">Error: {error}</p>
        </div>
      )}

      {/* Pending Approvals Section */}
      <div className="admin-card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Pending Approval Requests ({approvals.length})
        </h2>
        {loading ? (
          <div className="text-center py-8">
            <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400 mx-auto" />
            <p className="text-gray-500 dark:text-gray-400 mt-2">Loading approvals...</p>
          </div>
        ) : approvals.length === 0 ? (
          <div className="text-center py-8">
            <CubeIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400">No pending approval requests</p>
          </div>
        ) : (
          <div className="space-y-3">
            {approvals.map((approval) => {
              // Extract data from request_data JSONB field and joined NFT data
              const requestData = approval.request_data || {};
              const nftName = approval.nft_name || requestData.name || 'Unnamed NFT';
              const nftDescription = approval.nft_description || requestData.description || '';
              const nftImageUrl = approval.nft_image_url || requestData.image_url || '';
              const nftOwner = approval.nft_owner || approval.user_email || '';
              const nftPrice = approval.nft_price_wei || (requestData.price_krsi ? `${requestData.price_krsi} KRSI` : '');
              const nftTokenId = approval.nft_token_id || '';
              const nftId = requestData.nft_id || approval.id;
              
              return (
                <div key={approval.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* NFT Header */}
                      <div className="flex items-center gap-3 mb-2">
                        {nftImageUrl ? (
                          <img src={nftImageUrl} alt={nftName} className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <CubeIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {nftName}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {nftTokenId ? `Token ID: ${nftTokenId}` : `ID: ${nftId.substring(0, 8)}...`}
                          </p>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 whitespace-nowrap">
                          {approval.approval_type?.replace('_', ' ').toUpperCase() || 'PENDING'}
                        </span>
                      </div>
                      
                      {/* NFT Details */}
                      {nftDescription && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                          {nftDescription}
                        </p>
                      )}
                      
                      {/* Additional Info */}
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                        {nftOwner && (
                          <span className="flex items-center gap-1">
                            <span className="font-medium">Owner:</span>
                            <span className="truncate max-w-[150px]">{nftOwner}</span>
                          </span>
                        )}
                        {nftPrice && (
                          <span className="flex items-center gap-1">
                            <span className="font-medium">Price:</span>
                            <span>{typeof nftPrice === 'number' ? `${(Number(nftPrice) / 1e6).toFixed(2)} KRSI` : nftPrice}</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <span className="font-medium">Requested:</span>
                          <span>{new Date(approval.created_at).toLocaleDateString()} {new Date(approval.created_at).toLocaleTimeString()}</span>
                        </span>
                      </div>
                      
                      {/* User info from request_data or joined data */}
                      {(approval.user_first_name || approval.user_last_name || approval.user_email) && (
                        <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                          <p className="text-xs font-medium text-blue-900 dark:text-blue-300 mb-1">Requested by:</p>
                          <p className="text-sm text-blue-800 dark:text-blue-400">
                            {[approval.user_first_name, approval.user_last_name].filter(Boolean).join(' ') || approval.user_email}
                            {approval.user_first_name && approval.user_email && <span className="text-xs ml-1">({approval.user_email})</span>}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 shrink-0">
                      <button
                        onClick={() => handleApproveRequest(approval.id)}
                        className="admin-button admin-button-primary flex items-center justify-center gap-1 px-4 py-2 whitespace-nowrap"
                      >
                        <CheckIcon className="h-4 w-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleRejectRequest(approval.id)}
                        className="admin-button admin-button-danger flex items-center justify-center gap-1 px-4 py-2 whitespace-nowrap"
                      >
                        <XMarkIcon className="h-4 w-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create NFT */}
      <form onSubmit={handleCreateNFT} className="admin-card grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="admin-label">Name</label>
          <input className="admin-input" value={newNFT.name} onChange={(e) => setNewNFT({ ...newNFT, name: e.target.value })} required />
        </div>
        <div>
          <label className="admin-label">Image URL</label>
          <input className="admin-input" value={newNFT.image_url} onChange={(e) => setNewNFT({ ...newNFT, image_url: e.target.value })} />
        </div>
        <div>
          <label className="admin-label">Price (KRSI)</label>
          <input className="admin-input" type="number" step="0.000001" value={newNFT.price_krsi} onChange={(e) => setNewNFT({ ...newNFT, price_krsi: e.target.value })} />
        </div>
        <div>
          <button type="submit" disabled={creating} className="admin-button admin-button-primary w-full">{creating ? 'Creating...' : 'Create NFT'}</button>
        </div>
        <div className="md:col-span-4">
          <label className="admin-label">Description</label>
          <textarea className="admin-input" value={newNFT.description} onChange={(e) => setNewNFT({ ...newNFT, description: e.target.value})} />
        </div>
      </form>

      <div className="flex space-x-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="admin-button admin-button-secondary"
        >
          <option value="all">All NFTs ({nfts.length})</option>
          <option value="pending">Pending Approval ({nfts.filter(n => !n.isApproved).length})</option>
          <option value="approved">Approved ({nfts.filter(n => n.isApproved).length})</option>
        </select>
      </div>

      <div className="admin-card">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="admin-table th">NFT Details</th>
                <th className="admin-table th">Name</th>
                <th className="admin-table th">Owner</th>
                <th className="admin-table th">Price</th>
                <th className="admin-table th">Status</th>
                <th className="admin-table th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredNFTs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="admin-table td text-center text-gray-500">
                    {loading ? 'Loading...' : 'No NFTs found'}
                  </td>
                </tr>
              ) : (
                filteredNFTs.map((nft) => (
                  <tr key={nft.id}>
                    <td className="admin-table td">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {nft.imageUrl ? (
                            <img src={nft.imageUrl} alt={nft.name} className="h-10 w-10 rounded-full object-cover" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-600 flex items-center justify-center">
                              <CubeIcon className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Token ID: {nft.tokenId || 'Pending'}
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            ID: {nft.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="admin-table td">
                      <div className="text-sm text-gray-900 dark:text-gray-100">{nft.name}</div>
                      {nft.description && (
                        <div className="text-xs text-gray-500 dark:text-gray-500 truncate max-w-xs">
                          {nft.description}
                        </div>
                      )}
                    </td>
                    <td className="admin-table td">
                      <div className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-xs">
                        {nft.owner || 'Not assigned'}
                      </div>
                    </td>
                    <td className="admin-table td">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {nft.priceWei ? `${ethers.formatUnits(nft.priceWei, 6)} KRSI` : 'Not set'}
                      </div>
                    </td>
                    <td className="admin-table td">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        nft.isApproved 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {nft.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="admin-table td">
                      <div className="flex space-x-2">
                        {!nft.priceWei && nft.isApproved && (
                          <button
                            onClick={() => handleSetPrice10KRSI(nft)}
                            className="admin-button admin-button-secondary text-xs px-2 py-1"
                          >
                            Set 10 KRSI
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NFTManagement;
