import React, { useState, useEffect } from 'react';
import apiClient from '../lib/api';
import toast from 'react-hot-toast';

const BatchManagement = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    productType: '',
    quantity: '',
    pricePerUnit: '',
    location: '',
    harvestDate: '',
    certification: ''
  });

  // Fetch batches from database
  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const result = await apiClient.getFarmerBatches();
      if (result.data?.batches) {
        setBatches(result.data.batches);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
      toast.error('Failed to load batches');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const createBatch = async () => {
    setLoading(true);
    try {
      const batchData = {
        crop_type: formData.productType,
        variety: formData.productType, // Using productType as variety
        quantity_kg: parseFloat(formData.quantity),
        harvest_date: formData.harvestDate,
        quality_grade: formData.certification,
        certification_status: 'pending',
        batch_number: `BATCH-${Date.now()}`,
        storage_location: formData.location,
        price_per_kg: parseFloat(formData.pricePerUnit),
        total_value: parseFloat(formData.quantity) * parseFloat(formData.pricePerUnit)
      };

      const result = await apiClient.createFarmerBatch(batchData);
      if (result.data?.batch) {
        toast.success('Batch created successfully!');
        setFormData({
          productType: '',
          quantity: '',
          pricePerUnit: '',
          location: '',
          harvestDate: '',
          certification: ''
        });
        // Refresh the batches list
        fetchBatches();
      }
    } catch (error) {
      console.error('Error creating batch:', error);
      toast.error('Failed to create batch');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'created': return 'status-created';
      case 'verified': return 'status-verified';
      case 'sold': return 'status-sold';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex space-x-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('create')}
          className={`py-2 px-4 font-medium ${
            activeTab === 'create'
              ? 'border-b-2 border-green-500 text-green-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Create Batch
        </button>
        <button
          onClick={() => setActiveTab('manage')}
          className={`py-2 px-4 font-medium ${
            activeTab === 'manage'
              ? 'border-b-2 border-green-500 text-green-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Manage Batches
        </button>
      </div>

      {activeTab === 'create' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-800">
            Create New Batch
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="form-label">Product Type</label>
                <select
                  name="productType"
                  value={formData.productType}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="">Select product type</option>
                  <option value="Wheat">Wheat</option>
                  <option value="Rice">Rice</option>
                  <option value="Corn">Corn</option>
                  <option value="Sugarcane">Sugarcane</option>
                  <option value="Cotton">Cotton</option>
                  <option value="Vegetables">Vegetables</option>
                </select>
              </div>

              <div>
                <label className="form-label">Quantity (kg)</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter quantity"
                  min="1"
                />
              </div>

              <div>
                <label className="form-label">Price per Unit (KRSI)</label>
                <input
                  type="number"
                  name="pricePerUnit"
                  value={formData.pricePerUnit}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter price per unit"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="form-label">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter location"
                />
              </div>

              <div>
                <label className="form-label">Harvest Date</label>
                <input
                  type="date"
                  name="harvestDate"
                  value={formData.harvestDate}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Certification</label>
                <select
                  name="certification"
                  value={formData.certification}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="">Select certification</option>
                  <option value="Organic">Organic</option>
                  <option value="Fair Trade">Fair Trade</option>
                  <option value="Rainforest Alliance">Rainforest Alliance</option>
                  <option value="UTZ">UTZ</option>
                  <option value="None">None</option>
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={createBatch}
            disabled={Object.values(formData).some(val => !val)}
            className="agri-button disabled:opacity-50"
          >
            Create Batch
          </button>
        </div>
      )}

      {activeTab === 'manage' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-800">
            Your Batches
          </h3>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Loading batches...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {batches.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 dark:text-gray-400 mb-4">
                    <div className="text-4xl mb-2">📦</div>
                    <p className="text-lg font-medium">No Batches Found</p>
                    <p className="text-sm">Create your first batch to get started.</p>
                  </div>
                </div>
              ) : (
                batches.map((batch) => (
                  <div key={batch.id} className="agri-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">
                          {batch.crop_type} Batch #{batch.batch_number}
                        </h4>
                        <p className="text-gray-600">
                          {batch.quantity_kg} kg • {batch.price_per_kg} KRSI/kg
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(batch.certification_status)}`}>
                        {batch.certification_status.toUpperCase()}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-500">Location</div>
                        <div className="font-medium">{batch.storage_location}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Harvest Date</div>
                        <div className="font-medium">{batch.harvest_date}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Quality Grade</div>
                        <div className="font-medium">{batch.quality_grade}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Batch ID: {batch.batch_number}
                      </div>
                      <div className="text-lg font-bold text-green-600">
                        Total: {batch.total_value} KRSI
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BatchManagement;
