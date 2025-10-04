import React, { useEffect, useMemo, useState } from 'react';
import { useSupabase } from '../context/SupabaseContext';
import { useWeb3 } from '../context/Web3Context';
import { useAdminApproval } from '../utils/adminApproval';

const NFTManagement = () => {
  const [activeTab, setActiveTab] = useState('mint');
  const { supabase, user } = useSupabase();
  const { account } = useWeb3();
  const adminApproval = useAdminApproval(supabase, {});
  const [nftLands, setNftLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [minting, setMinting] = useState(false);

  const [formData, setFormData] = useState({
    location: '',
    area: '',
    soilType: '',
    cropHistory: '',
    documentHash: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    const fetchMine = async () => {
      if (!user?.id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('nft_lands')
        .select('*')
        .eq('farmer_id', user.id)
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
            creditScore: Number(meta.creditScore ?? meta.credit_score ?? 0)
          };
        });
        setNftLands(mapped);
      } else {
        setNftLands([]);
      }
      setLoading(false);
    };
    fetchMine();
  }, [supabase, user]);

  const mintNFT = async () => {
    if (!user?.id) {
      alert('Please sign in');
      return;
    }

    if (!account) {
      alert('Please connect your wallet');
      return;
    }

    setMinting(true);
    try {
      const mintData = {
        userId: user.id,
        location: formData.location,
        landSize: formData.area,
        metadata: {
          soilType: formData.soilType,
          cropHistory: formData.cropHistory,
          documentHash: formData.documentHash,
          isVerified: false,
          creditScore: 0
        }
      };

      // Request admin approval for NFT minting
      const approval = await adminApproval.requestNFTMint(mintData, account);

      alert(`NFT minting request submitted for admin approval!\nRequest ID: ${approval.id}\n\nAn admin will review and process your request.`);

      setFormData({
        location: '',
        area: '',
        soilType: '',
        cropHistory: '',
        documentHash: ''
      });

    } catch (error) {
      console.error('Mint request failed:', error);
      alert(`Mint request failed: ${error.message}`);
    } finally {
      setMinting(false);
    }
  };

  const updateCropHistory = (tokenId, newHistory) => {
    setNftLands(prev => prev.map(nft => 
      nft.tokenId === tokenId 
        ? { ...nft, cropHistory: newHistory, creditScore: nft.creditScore + 10 }
        : nft
    ));
    alert('Crop history updated successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('mint')}
          className={`py-2 px-4 font-medium ${
            activeTab === 'mint'
              ? 'border-b-2 border-green-500 dark:border-green-400 text-green-600 dark:text-green-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Mint Land NFT
        </button>
        <button
          onClick={() => setActiveTab('manage')}
          className={`py-2 px-4 font-medium ${
            activeTab === 'manage'
              ? 'border-b-2 border-green-500 dark:border-green-400 text-green-600 dark:text-green-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Manage NFTs
        </button>
      </div>

      {activeTab === 'mint' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Mint Land NFT
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Create an NFT representing your land ownership to improve your creditworthiness.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="form-label">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter land location"
                />
              </div>

              <div>
                <label className="form-label">Area (acres)</label>
                <input
                  type="number"
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter land area"
                  min="0"
                  step="0.1"
                />
              </div>

              <div>
                <label className="form-label">Soil Type</label>
                <select
                  name="soilType"
                  value={formData.soilType}
                  onChange={handleInputChange}
                  className="form-input"
                >
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
                  name="cropHistory"
                  value={formData.cropHistory}
                  onChange={handleInputChange}
                  className="form-input"
                  rows="3"
                  placeholder="Enter previous crops grown"
                />
              </div>

              <div>
                <label className="form-label">Document Hash</label>
                <input
                  type="text"
                  name="documentHash"
                  value={formData.documentHash}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="IPFS hash of land documents"
                />
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Benefits of Land NFTs</h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Improves creditworthiness for loan applications</li>
              <li>• Provides verifiable land ownership</li>
              <li>• Tracks land performance and history</li>
              <li>• Enables better risk assessment</li>
            </ul>
          </div>

          <button
            onClick={mintNFT}
            disabled={Object.values(formData).some(val => !val) || minting}
            className="agri-button disabled:opacity-50"
          >
            {minting ? 'Requesting Mint...' : 'Request NFT Mint'}
          </button>
        </div>
      )}

      {activeTab === 'manage' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Your Land NFTs
          </h3>

          <div className="space-y-4">
            {loading && (
              <div className="text-gray-600 dark:text-gray-400">Loading your NFTs…</div>
            )}
            {!loading && nftLands.length === 0 && (
              <div className="text-gray-600 dark:text-gray-400">You have no NFTs yet.</div>
            )}
            {!loading && nftLands.map((nft) => (
              <div key={nft.tokenId} className="agri-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      Land NFT #{nft.tokenId}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      {nft.location} • {nft.area} acres
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    {nft.isVerified && (
                      <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-xs font-medium">
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
                    <div className="font-medium text-gray-800 dark:text-gray-200">{nft.soilType}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Crop History</div>
                    <div className="font-medium text-gray-800 dark:text-gray-200">{nft.cropHistory}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Status</div>
                    <div className="font-medium text-gray-800 dark:text-gray-200">
                      {nft.isVerified ? 'Verified' : 'Pending Verification'}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      const newHistory = prompt('Enter new crop history:', nft.cropHistory);
                      if (newHistory) {
                        updateCropHistory(nft.tokenId, newHistory);
                      }
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    Update Crop History
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
    </div>
  );
};

export default NFTManagement;
