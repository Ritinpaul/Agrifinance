import React, { useState, useEffect } from 'react';
import { useSupabase } from '../context/SupabaseContext';
import { useWeb3 } from '../context/Web3Context';
import toast from 'react-hot-toast';

const DAOGovernance = () => {
  const { user, userProfile } = useSupabase();
  const { account, isConnected, contract } = useWeb3();
  
  // State management
  const [activeTab, setActiveTab] = useState('proposals'); // proposals, create, profile
  const [proposals, setProposals] = useState([]);
  const [userVotingPower, setUserVotingPower] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Create proposal states
  const [showCreateProposal, setShowCreateProposal] = useState(false);
  const [proposalForm, setProposalForm] = useState({
    title: '',
    description: '',
    type: 'PLATFORM_POLICY'
  });
  
  // Voting states
  const [votingProposal, setVotingProposal] = useState(null);
  const [showVoteModal, setShowVoteModal] = useState(false);

  // Load DAO data
  const loadDAOData = async () => {
    if (!user?.id || !isConnected) return;
    
    setLoading(true);
    try {
      // Load proposals from contract
      // This would be replaced with actual contract calls
      const mockProposals = [
        {
          id: 1,
          title: "Increase KRSI Staking Rewards",
          description: "Proposal to increase staking rewards from 12% to 15% APY to attract more farmers to stake their tokens.",
          proposer: "0x1234...5678",
          startTime: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
          endTime: Date.now() + 5 * 24 * 60 * 60 * 1000, // 5 days from now
          forVotes: 1500000,
          againstVotes: 300000,
          type: "LOAN_TERMS",
          status: "ACTIVE"
        },
        {
          id: 2,
          title: "Add Rice Crop Support",
          description: "Add rice as a supported crop for loans and NFT marketplace with competitive pricing.",
          proposer: "0x8765...4321",
          startTime: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
          endTime: Date.now() + 6 * 24 * 60 * 60 * 1000, // 6 days from now
          forVotes: 800000,
          againstVotes: 200000,
          type: "FEATURE_REQUEST",
          status: "ACTIVE"
        },
        {
          id: 3,
          title: "Emergency Fund Allocation",
          description: "Allocate 10% of community treasury to emergency relief fund for farmers affected by natural disasters.",
          proposer: "0x1111...2222",
          startTime: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
          endTime: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
          forVotes: 2000000,
          againstVotes: 100000,
          type: "FUND_ALLOCATION",
          status: "EXECUTED"
        }
      ];
      
      setProposals(mockProposals);
      
      // Calculate user voting power
      const votingPower = calculateVotingPower();
      setUserVotingPower(votingPower);
      
    } catch (error) {
      console.error('Error loading DAO data:', error);
      toast.error('Failed to load DAO data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDAOData();
  }, [user, isConnected]);

  // Calculate user voting power
  const calculateVotingPower = () => {
    if (!userProfile) return 0;
    
    let power = 0;
    
    // Base power from KRSI tokens (mock)
    power += 1000; // This would come from actual token balance
    
    // Farming activity bonus
    if (userProfile.role === 'farmer') {
      power += 500; // Bonus for farmers
    }
    
    // Platform participation bonus
    power += 200; // Mock participation score
    
    return power;
  };

  // Handle creating proposal
  const handleCreateProposal = async () => {
    if (!proposalForm.title || !proposalForm.description) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      // This would call the smart contract
      toast.success('Proposal created successfully!');
      setShowCreateProposal(false);
      setProposalForm({ title: '', description: '', type: 'PLATFORM_POLICY' });
      loadDAOData(); // Refresh proposals
    } catch (error) {
      toast.error('Failed to create proposal');
      console.error('Create proposal error:', error);
    }
  };

  // Handle voting
  const handleVote = async (proposalId, support) => {
    try {
      // This would call the smart contract
      toast.success(`Vote ${support ? 'for' : 'against'} proposal submitted!`);
      setShowVoteModal(false);
      setVotingProposal(null);
      loadDAOData(); // Refresh proposals
    } catch (error) {
      toast.error('Failed to submit vote');
      console.error('Vote error:', error);
    }
  };

  // Format proposal type
  const formatProposalType = (type) => {
    const types = {
      'PLATFORM_POLICY': 'Platform Policy',
      'CROP_PRICING': 'Crop Pricing',
      'LOAN_TERMS': 'Loan Terms',
      'FEATURE_REQUEST': 'Feature Request',
      'FUND_ALLOCATION': 'Fund Allocation',
      'EMERGENCY_ACTION': 'Emergency Action'
    };
    return types[type] || type;
  };

  // Format proposal status
  const formatProposalStatus = (proposal) => {
    const now = Date.now();
    if (proposal.status === 'EXECUTED') return 'Executed';
    if (proposal.status === 'REJECTED') return 'Rejected';
    if (now < proposal.startTime) return 'Pending';
    if (now > proposal.endTime) return 'Expired';
    return 'Active';
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'text-green-600 bg-green-100';
      case 'Executed': return 'text-blue-600 bg-blue-100';
      case 'Rejected': return 'text-red-600 bg-red-100';
      case 'Expired': return 'text-gray-600 bg-gray-100';
      case 'Pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading DAO governance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🏛️ AgriFinance DAO
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Community governance for agricultural finance decisions
          </p>
        </div>

        {/* User Voting Power */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Your Voting Power
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Participate in community governance decisions
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">
                {userVotingPower.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">Voting Power</p>
            </div>
          </div>
        </div>

        {/* DAO Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('proposals')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'proposals'
                    ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📋 Active Proposals
              </button>
              <button
                onClick={() => setActiveTab('create')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'create'
                    ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                ✍️ Create Proposal
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                👤 Governance Profile
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Proposals Tab */}
            {activeTab === 'proposals' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Community Proposals
                  </h3>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    + Create Proposal
                  </button>
                </div>

                {proposals.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      No proposals found. Be the first to create one!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {proposals.map((proposal) => (
                      <div key={proposal.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {proposal.title}
                              </h4>
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(formatProposalStatus(proposal))}`}>
                                {formatProposalStatus(proposal)}
                              </span>
                              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                {formatProposalType(proposal.type)}
                              </span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mb-3">
                              {proposal.description}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>Proposed by: {proposal.proposer}</span>
                              <span>•</span>
                              <span>ID: #{proposal.id}</span>
                            </div>
                          </div>
                        </div>

                        {/* Voting Progress */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <span>Voting Progress</span>
                            <span>
                              {proposal.forVotes.toLocaleString()} For • {proposal.againstVotes.toLocaleString()} Against
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ 
                                width: `${(proposal.forVotes / (proposal.forVotes + proposal.againstVotes)) * 100}%` 
                              }}
                            ></div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        {formatProposalStatus(proposal) === 'Active' && (
                          <div className="flex space-x-3">
                            <button
                              onClick={() => {
                                setVotingProposal(proposal);
                                setShowVoteModal(true);
                              }}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              Vote
                            </button>
                            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                              View Details
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Create Proposal Tab */}
            {activeTab === 'create' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Create New Proposal
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Submit a proposal for community consideration
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Proposal Title
                      </label>
                      <input
                        type="text"
                        value={proposalForm.title}
                        onChange={(e) => setProposalForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Brief title of your proposal"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Proposal Type
                      </label>
                      <select
                        value={proposalForm.type}
                        onChange={(e) => setProposalForm(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                      >
                        <option value="PLATFORM_POLICY">Platform Policy</option>
                        <option value="CROP_PRICING">Crop Pricing</option>
                        <option value="LOAN_TERMS">Loan Terms</option>
                        <option value="FEATURE_REQUEST">Feature Request</option>
                        <option value="FUND_ALLOCATION">Fund Allocation</option>
                        <option value="EMERGENCY_ACTION">Emergency Action</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Proposal Description
                      </label>
                      <textarea
                        value={proposalForm.description}
                        onChange={(e) => setProposalForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Detailed description of your proposal..."
                        rows={6}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                    <button
                      onClick={handleCreateProposal}
                      className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Create Proposal
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Governance Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Your Governance Profile
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Track your participation in community governance
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center">
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      {userVotingPower.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Total Voting Power
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      5
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Proposals Voted
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-2">
                      2
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Proposals Created
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                    Voting Power Breakdown
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">KRSI Token Holdings</span>
                      <span className="font-medium">1,000 points</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Farming Activity</span>
                      <span className="font-medium">500 points</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Platform Participation</span>
                      <span className="font-medium">200 points</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Governance Participation</span>
                      <span className="font-medium">100 points</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Vote Modal */}
        {showVoteModal && votingProposal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Vote on Proposal
              </h3>
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  {votingProposal.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {votingProposal.description.substring(0, 100)}...
                </p>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Your voting power: {userVotingPower.toLocaleString()} points
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleVote(votingProposal.id, true)}
                  className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Vote For
                </button>
                <button
                  onClick={() => handleVote(votingProposal.id, false)}
                  className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Vote Against
                </button>
              </div>
              <button
                onClick={() => setShowVoteModal(false)}
                className="w-full mt-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DAOGovernance;
