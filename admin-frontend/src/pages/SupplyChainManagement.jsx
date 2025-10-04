import { useState, useEffect } from 'react';
import { TruckIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

const SupplyChainManagement = () => {
  const [batches, setBatches] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Mock data - replace with real API call
    const mockBatches = [
      {
        id: 1,
        batchId: 'B001',
        farmer: '0x1234...5678',
        productType: 'Wheat',
        quantity: 1000,
        pricePerUnit: 25,
        location: 'Punjab, India',
        certification: 'Organic',
        status: 'pending',
        createdAt: new Date('2024-01-15')
      },
      {
        id: 2,
        batchId: 'B002',
        farmer: '0x2345...6789',
        productType: 'Rice',
        quantity: 800,
        pricePerUnit: 30,
        location: 'Haryana, India',
        certification: 'Fair Trade',
        status: 'verified',
        createdAt: new Date('2024-01-10')
      }
    ];
    
    setBatches(mockBatches);
  }, []);

  const handleVerifyBatch = async (batchId) => {
    setBatches(batches.map(batch => 
      batch.id === batchId ? { ...batch, status: 'verified' } : batch
    ));
  };

  const handleRejectBatch = async (batchId) => {
    setBatches(batches.map(batch => 
      batch.id === batchId ? { ...batch, status: 'rejected' } : batch
    ));
  };

  const filteredBatches = batches.filter(batch => {
    if (filter === 'all') return true;
    return batch.status === filter;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'sold':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Supply Chain Management</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Verify and manage agricultural product batches
        </p>
      </div>

      <div className="flex space-x-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="admin-button admin-button-secondary"
        >
          <option value="all">All Batches</option>
          <option value="pending">Pending Verification</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
          <option value="sold">Sold</option>
        </select>
      </div>

      <div className="admin-card">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="admin-table th">
                  Batch Details
                </th>
                <th className="admin-table th">
                  Product
                </th>
                <th className="admin-table th">
                  Quantity
                </th>
                <th className="admin-table th">
                  Price/Unit
                </th>
                <th className="admin-table th">
                  Location
                </th>
                <th className="admin-table th">
                  Certification
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
              {filteredBatches.map((batch) => (
                <tr key={batch.id}>
                  <td className="admin-table td">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-600 flex items-center justify-center">
                          <TruckIcon className="h-6 w-6 text-orange-600 dark:text-orange-300" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {batch.batchId}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {batch.farmer}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="admin-table td">
                    {batch.productType}
                  </td>
                  <td className="admin-table td">
                    {batch.quantity} kg
                  </td>
                  <td className="admin-table td">
                    {formatCurrency(batch.pricePerUnit)}
                  </td>
                  <td className="admin-table td">
                    {batch.location}
                  </td>
                  <td className="admin-table td">
                    {batch.certification}
                  </td>
                  <td className="admin-table td">
                    <span className={`admin-badge ${getStatusColor(batch.status)}`}>
                      {batch.status}
                    </span>
                  </td>
                  <td className="admin-table td">
                    {batch.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleVerifyBatch(batch.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <CheckIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleRejectBatch(batch.id)}
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

export default SupplyChainManagement;
