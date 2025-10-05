import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWeb3 } from '../context/Web3Context';
import { useAdminApproval } from '../utils/adminApproval';

const AdminDashboard = () => {
  const { user } = useAuth();
  const web3 = useWeb3();
  const adminApproval = useAdminApproval(web3);
  
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});
  const [notes, setNotes] = useState({});

  useEffect(() => {
    if (user?.role === 'admin') {
      loadPendingApprovals();
    }
  }, [user]);

  const loadPendingApprovals = async () => {
    setLoading(true);
    try {
      const approvals = await adminApproval.getPendingApprovals();
      setPendingApprovals(approvals);
    } catch (error) {
      console.error('Error loading pending approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (approvalId) => {
    setProcessing(prev => ({ ...prev, [approvalId]: 'approving' }));
    try {
      await adminApproval.approveTransaction(approvalId, user.id, notes[approvalId] || '');
      alert('Transaction approved and executed successfully!');
      await loadPendingApprovals();
      setNotes(prev => ({ ...prev, [approvalId]: '' }));
    } catch (error) {
      console.error('Error approving transaction:', error);
      alert(`Approval failed: ${error.message}`);
    } finally {
      setProcessing(prev => ({ ...prev, [approvalId]: null }));
    }
  };

  const handleReject = async (approvalId) => {
    setProcessing(prev => ({ ...prev, [approvalId]: 'rejecting' }));
    try {
      await adminApproval.rejectTransaction(approvalId, user.id, notes[approvalId] || 'Rejected by admin');
      alert('Transaction rejected successfully!');
      await loadPendingApprovals();
      setNotes(prev => ({ ...prev, [approvalId]: '' }));
    } catch (error) {
      console.error('Error rejecting transaction:', error);
      alert(`Rejection failed: ${error.message}`);
    } finally {
      setProcessing(prev => ({ ...prev, [approvalId]: null }));
    }
  };

  const formatRequestData = (requestData, type) => {
    switch (type) {
      case 'nft_purchase':
        return {
          'NFT ID': requestData.nftId,
          'Token ID': requestData.tokenId,
          'Seller': requestData.sellerAddress,
          'Buyer': requestData.buyerAddress,
          'Price': `${requestData.price} ETH`,
          'Location': requestData.nftData?.location,
          'Area': `${requestData.nftData?.area} acres`
        };
      case 'nft_mint':
        return {
          'Location': requestData.location,
          'Land Size': `${requestData.landSize} acres`,
          'Farmer': requestData.farmerAddress,
          'Soil Type': requestData.metadata?.soilType,
          'Crop History': requestData.metadata?.cropHistory
        };
      case 'withdrawal':
        return {
          'Amount': `${requestData.amount} ${requestData.tokenSymbol}`,
          'From': requestData.fromAddress,
          'To': requestData.toAddress
        };
      default:
        return requestData;
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">Access Denied</h2>
          <p className="text-red-700 dark:text-red-300">You need admin privileges to access this dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          🔧 Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Review and approve pending transactions for regulatory compliance
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Pending Approvals ({pendingApprovals.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-600 dark:text-gray-400">
            Loading pending approvals...
          </div>
        ) : pendingApprovals.length === 0 ? (
          <div className="p-6 text-center text-gray-600 dark:text-gray-400">
            No pending approvals
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {pendingApprovals.map((approval) => (
              <div key={approval.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                      {approval.transaction_type.replace('_', ' ').toUpperCase()}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Request ID: {approval.id} • User: {approval.users?.email}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Requested: {new Date(approval.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full text-xs font-medium">
                    PENDING
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {Object.entries(formatRequestData(approval.request_data, approval.transaction_type)).map(([key, value]) => (
                    <div key={key}>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{key}</div>
                      <div className="font-medium text-gray-900 dark:text-white">{value}</div>
                    </div>
                  ))}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Admin Notes
                  </label>
                  <textarea
                    className="w-full form-input"
                    rows="2"
                    placeholder="Add notes for this approval..."
                    value={notes[approval.id] || ''}
                    onChange={(e) => setNotes(prev => ({ ...prev, [approval.id]: e.target.value }))}
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => handleApprove(approval.id)}
                    disabled={processing[approval.id]}
                    className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    {processing[approval.id] === 'approving' ? 'Approving...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleReject(approval.id)}
                    disabled={processing[approval.id]}
                    className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    {processing[approval.id] === 'rejecting' ? 'Rejecting...' : 'Reject'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
