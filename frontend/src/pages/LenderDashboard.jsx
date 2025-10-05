import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import apiClient from '../lib/api';
import toast from 'react-hot-toast';

const LenderDashboard = () => {
  const { account, isConnected } = useWeb3();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [lenderData, setLenderData] = useState(null);
  const [walletData, setWalletData] = useState(null);
  const [availableLoans, setAvailableLoans] = useState([]);
  const [myLoans, setMyLoans] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchLenderData();
      fetchAvailableLoans();
      fetchMyLoans();
    }
  }, [user]);

  const fetchLenderData = async () => {
    // Mock data for development
    const mockData = {
      name: 'Agricultural Investment Fund',
      totalLent: 125000,
      totalEarned: 15750,
      activeLoans: 8,
      completedLoans: 12,
      averageReturn: 12.6,
      riskScore: 2.3
    };
    setLenderData(mockData);
  };

  const fetchAvailableLoans = async () => {
    // Mock available loans
    const mockLoans = [
      {
        id: 1,
        borrower: '0x1234...5678',
        amount: 5000,
        interestRate: 8,
        duration: 180,
        purpose: 'Seeds Purchase',
        creditScore: 720,
        cropType: 'Wheat',
        riskLevel: 'Low'
      },
      {
        id: 2,
        borrower: '0x9876...5432',
        amount: 3000,
        interestRate: 12,
        duration: 90,
        purpose: 'Equipment',
        creditScore: 650,
        cropType: 'Rice',
        riskLevel: 'Medium'
      },
      {
        id: 3,
        borrower: '0xabcd...efgh',
        amount: 7500,
        interestRate: 10,
        duration: 365,
        purpose: 'Irrigation',
        creditScore: 750,
        cropType: 'Sugarcane',
        riskLevel: 'Low'
      }
    ];
    setAvailableLoans(mockLoans);
  };

  const fetchMyLoans = async () => {
    // Mock my loans
    const mockMyLoans = [
      {
        id: 1,
        borrower: '0x1111...2222',
        amount: 4000,
        interestRate: 9,
        duration: 120,
        startDate: '2024-01-01',
        endDate: '2024-04-30',
        status: 'active',
        earned: 120,
        remaining: 3880
      },
      {
        id: 2,
        borrower: '0x3333...4444',
        amount: 6000,
        interestRate: 11,
        duration: 180,
        startDate: '2023-12-15',
        endDate: '2024-06-15',
        status: 'active',
        earned: 330,
        remaining: 5670
      }
    ];
    setMyLoans(mockMyLoans);
  };

  const fundLoan = (loanId) => {
    // Mock funding
    alert(`Loan ${loanId} funded successfully!`);
    fetchAvailableLoans();
    fetchMyLoans();
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'Low': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'Medium': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'High': return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  // Heuristic risk score: 0-100 (higher is safer)
  const calculateRiskScore = (loan) => {
    const creditComponent = Math.min(100, Math.max(0, (loan.creditScore - 300) / 5.5)); // 300-850 -> ~0-100
    const ratePenalty = Math.min(30, loan.interestRate * 1.2); // higher rate -> lower score
    const durationPenalty = Math.min(20, loan.duration / 30); // longer duration -> lower score
    const amountPenalty = Math.min(20, loan.amount / 10000 * 20); // big amounts -> lower score
    const base = creditComponent - ratePenalty - durationPenalty - amountPenalty + 10; // small bias
    return Math.round(Math.min(100, Math.max(0, base)));
  };

  // Simple APY calculator state with localStorage persistence
  const [calc, setCalc] = useState(() => {
    const saved = localStorage.getItem('lender-apy-calc');
    return saved ? JSON.parse(saved) : { principal: 5000, rate: 12, termDays: 180, compounding: 12, defaultRate: 2 };
  });

  // Save calc settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('lender-apy-calc', JSON.stringify(calc));
  }, [calc]);
  const apyCalc = () => {
    const r = calc.rate / 100;
    const n = calc.compounding;
    const tYears = calc.termDays / 365;
    const compoundFactor = Math.pow(1 + r / n, n * tYears) - 1;
    const expectedLoss = (calc.defaultRate / 100) * r * tYears; // simplified loss
    const effectiveReturn = Math.max(0, compoundFactor - expectedLoss);
    const earned = calc.principal * effectiveReturn;
    const apy = Math.pow(1 + r / n, n) - 1;
    return { earned: earned.toFixed(2), apy: (apy * 100).toFixed(2), eff: (effectiveReturn * 100).toFixed(2) };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'completed': return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'defaulted': return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'available', label: 'Available Loans', icon: '💰' },
    { id: 'my-loans', label: 'My Loans', icon: '📋' },
    { id: 'analytics', label: 'Analytics', icon: '📈' }
  ];

  if (!user) {
    return (
      <div className="text-center py-16">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-3">
            Authentication Required
          </h2>
          <p className="text-yellow-700 dark:text-yellow-300 mb-4 text-sm">
            Please sign in to access the lender dashboard.
          </p>
          <button 
            onClick={() => window.location.href = '/signin'}
            className="agri-button"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="agri-card p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
              💰 Lender Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Welcome back, {lenderData?.name || 'Lender'}!
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Wallet: {account?.slice(0, 6)}...{account?.slice(-4)}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xl font-semibold text-green-600 dark:text-green-400">
              {lenderData?.averageReturn || 0}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500">Average Return</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="stats-card">
          <div className="stats-number">${lenderData?.totalLent?.toLocaleString() || 0}</div>
          <div className="stats-label">Total Lent</div>
        </div>
        <div className="stats-card">
          <div className="stats-number">${lenderData?.totalEarned?.toLocaleString() || 0}</div>
          <div className="stats-label">Total Earned</div>
        </div>
        <div className="stats-card">
          <div className="stats-number">{lenderData?.activeLoans || 0}</div>
          <div className="stats-label">Active Loans</div>
        </div>
        <div className="stats-card">
          <div className="stats-number">{lenderData?.riskScore || 0}</div>
          <div className="stats-label">Risk Score</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="agri-card mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-6 px-6">
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
                Portfolio Overview
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="agri-card p-6">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                    Recent Activity
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-800 dark:text-white">Funded Loan #3</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">2 hours ago</div>
                      </div>
                      <div className="text-green-600 dark:text-green-400 font-semibold">+$7,500</div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-800 dark:text-white">Loan Repayment</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">1 day ago</div>
                      </div>
                      <div className="text-blue-600 dark:text-blue-400 font-semibold">+$4,200</div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-800 dark:text-white">Interest Earned</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">3 days ago</div>
                      </div>
                      <div className="text-green-600 dark:text-green-400 font-semibold">+$150</div>
                    </div>
                  </div>
                </div>

                <div className="agri-card p-6">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                    Risk Analysis
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1 text-gray-700 dark:text-gray-300">
                        <span>Low Risk</span>
                        <span>60%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1 text-gray-700 dark:text-gray-300">
                        <span>Medium Risk</span>
                        <span>30%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1 text-gray-700 dark:text-gray-300">
                        <span>High Risk</span>
                        <span>10%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'available' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                Available Loans
              </h3>

              {/* Inline APY calculator */}
              <div className="agri-card p-4">
                <h4 className="font-semibold mb-3 text-gray-800 dark:text-white">APY & Earnings Simulator</h4>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Principal ($)</label>
                    <input type="number" className="input" value={calc.principal} onChange={(e)=>setCalc({...calc, principal:Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Rate %</label>
                    <input type="number" className="input" value={calc.rate} onChange={(e)=>setCalc({...calc, rate:Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Term (days)</label>
                    <input type="number" className="input" value={calc.termDays} onChange={(e)=>setCalc({...calc, termDays:Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Compounds/yr</label>
                    <input type="number" className="input" value={calc.compounding} onChange={(e)=>setCalc({...calc, compounding:Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Default %</label>
                    <input type="number" className="input" value={calc.defaultRate} onChange={(e)=>setCalc({...calc, defaultRate:Number(e.target.value)})} />
                  </div>
                </div>
                <div className="mt-3 text-sm text-gray-700 dark:text-gray-300">
                  {(() => { const res = apyCalc(); return (
                    <div className="flex flex-wrap gap-4">
                      <span>Expected Earnings: <b>${res.earned}</b></span>
                      <span>Nominal APY: <b>{res.apy}%</b></span>
                      <span>Effective Return (term): <b>{res.eff}%</b></span>
                    </div>
                  ); })()}
                </div>
              </div>
              
              <div className="space-y-4">
                {availableLoans.map((loan) => (
                  <div key={loan.id} className="agri-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                          Loan #{loan.id}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          {loan.borrower} • {loan.cropType}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${getRiskColor(loan.riskLevel)}`}>
                        {loan.riskLevel.toUpperCase()} RISK
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Amount</div>
                        <div className="font-medium text-gray-900 dark:text-white">${loan.amount.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Interest Rate</div>
                        <div className="font-medium text-gray-900 dark:text-white">{loan.interestRate}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Duration</div>
                        <div className="font-medium text-gray-900 dark:text-white">{loan.duration} days</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Credit Score</div>
                        <div className="font-medium text-gray-900 dark:text-white">{loan.creditScore}</div>
                      </div>
                    </div>

                    {/* Heuristic risk score */}
                    <div className="mb-3">
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        Risk Score (0-100)
                        <div className="relative group">
                          <svg className="w-3 h-3 text-gray-400 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                          </svg>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                            Higher credit score, lower interest rate, shorter term, and smaller amounts increase the score.
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-40 h-2 bg-gray-200 dark:bg-gray-600 rounded">
                          <div className={`${calculateRiskScore(loan) > 66 ? 'bg-green-500' : calculateRiskScore(loan) > 33 ? 'bg-yellow-500' : 'bg-red-500'} h-2 rounded`} style={{ width: `${calculateRiskScore(loan)}%` }}></div>
                        </div>
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{calculateRiskScore(loan)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Purpose: {loan.purpose}
                      </div>
                      <button
                        onClick={() => fundLoan(loan.id)}
                        className="agri-button"
                      >
                        Fund Loan
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'my-loans' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                My Active Loans
              </h3>
              
              <div className="space-y-4">
                {myLoans.map((loan) => (
                  <div key={loan.id} className="agri-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                          Loan #{loan.id}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          Borrower: {loan.borrower}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                        {loan.status.toUpperCase()}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Amount</div>
                        <div className="font-medium text-gray-900 dark:text-white">${loan.amount.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Interest Rate</div>
                        <div className="font-medium text-gray-900 dark:text-white">{loan.interestRate}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Earned</div>
                        <div className="font-medium text-green-600 dark:text-green-400">${loan.earned}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Remaining</div>
                        <div className="font-medium text-gray-900 dark:text-white">${loan.remaining.toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        End Date: {loan.endDate}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Expected Return: ${(loan.amount * loan.interestRate / 100).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                Portfolio Analytics
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="agri-card p-6">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                    Monthly Returns
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-gray-700 dark:text-gray-300">
                      <span>January 2024</span>
                      <span className="text-green-600 dark:text-green-400 font-semibold">+$2,150</span>
                    </div>
                    <div className="flex justify-between text-gray-700 dark:text-gray-300">
                      <span>December 2023</span>
                      <span className="text-green-600 dark:text-green-400 font-semibold">+$1,980</span>
                    </div>
                    <div className="flex justify-between text-gray-700 dark:text-gray-300">
                      <span>November 2023</span>
                      <span className="text-green-600 dark:text-green-400 font-semibold">+$2,340</span>
                    </div>
                  </div>
                </div>

                <div className="agri-card p-6">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                    Loan Distribution
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1 text-gray-700 dark:text-gray-300">
                        <span>Wheat</span>
                        <span>40%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1 text-gray-700 dark:text-gray-300">
                        <span>Rice</span>
                        <span>30%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1 text-gray-700 dark:text-gray-300">
                        <span>Other</span>
                        <span>30%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                      </div>
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

export default LenderDashboard;
