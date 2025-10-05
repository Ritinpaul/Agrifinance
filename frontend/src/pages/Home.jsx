import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { useAuth } from '../context/AuthContext';
import GuidedTour from '../components/GuidedTour';

const Home = () => {
  // Web3 is optional - handle gracefully if not available
  let web3Data = { address: null, connectWallet: () => {} };
  try {
    const web3 = useWeb3();
    web3Data = web3;
  } catch (error) {
    console.log('Web3 not available:', error.message);
  }
  
  const { address, connectWallet } = web3Data;
  const { user } = useAuth();
  const [showTour, setShowTour] = useState(false);

  const features = [
    {
      title: 'Zero Collateral DeFi Lending',
      description: 'Access instant blockchain loans without traditional collateral requirements',
      icon: '💰',
      link: '/farmer',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Blockchain Supply Chain',
      description: 'Track produce from farm to market with complete transparency',
      icon: '📦',
      link: '/supply-chain',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'AI Credit Scoring',
      description: 'Get fair credit assessments based on yield, sales, and weather data',
      icon: '🤖',
      link: '/farmer',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'NFT Land Ownership',
      description: 'Verify land ownership and improve creditworthiness with NFTs',
      icon: '🧾',
      link: '/nft-marketplace',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const userTypes = [
    {
      title: 'Farmer',
      description: 'Apply for loans, track your produce, and manage your land NFTs',
      features: ['Loan Applications', 'Supply Chain Tracking', 'Land NFT Management', 'Credit Score Monitoring'],
      link: '/farmer',
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      icon: '👨‍🌾'
    },
    {
      title: 'Lender',
      description: 'Provide liquidity and earn yields through agricultural lending',
      features: ['Loan Pool Management', 'Risk Assessment', 'Yield Generation', 'Portfolio Analytics'],
      link: '/lender',
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      icon: '💰'
    },
    {
      title: 'Buyer',
      description: 'Purchase verified produce with complete traceability',
      features: ['Product Verification', 'Supply Chain Transparency', 'Quality Assurance', 'Direct Farmer Connection'],
      link: '/buyer',
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      icon: '🛒'
    }
  ];

  return (
    <div className="min-h-screen hero-section">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/5 to-blue-600/5 dark:from-green-600/10 dark:to-blue-600/10"></div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-16 pb-8 sm:pb-12">
          <div className="text-center">
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-full p-3 sm:p-4 shadow-lg">
                <span className="text-3xl sm:text-4xl">🌾</span>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4 px-4">
              Welcome to <span className="text-green-600 dark:text-green-400">AgriFinance</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 max-w-3xl mx-auto font-medium px-4">
              Blockchain-Powered Agricultural Supply Chain & DeFi Lending Platform
            </p>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-500 mb-6 sm:mb-8 max-w-4xl mx-auto leading-relaxed px-4">
              Empowering farmers with zero-collateral loans, transparent supply chains, 
              AI-based credit scoring, and NFT land ownership verification.
            </p>
            
            {!user && (
              <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-4 mb-8 max-w-2xl mx-auto rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-orange-500 text-lg">⚠️</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-orange-700 dark:text-orange-300 font-medium text-sm">
                      Please sign in to access all features
                    </p>
                  </div>
                </div>
              </div>
            )}

            {user && !address && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 mb-8 max-w-2xl mx-auto rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-blue-500 text-lg">ℹ️</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-blue-700 dark:text-blue-300 font-medium text-sm">
                      Connect your MetaMask wallet or use in-app wallet for blockchain features
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Link 
                to="/farmer" 
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg text-sm shadow-md hover:shadow-lg transition-all duration-200 text-center"
              >
                👨‍🌾 Farmer Dashboard
              </Link>
              <Link 
                to="/lender" 
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg text-sm shadow-md hover:shadow-lg transition-all duration-200 text-center"
              >
                💰 Lender Dashboard
              </Link>
              <Link 
                to="/buyer" 
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg text-sm shadow-md hover:shadow-lg transition-all duration-200 text-center"
              >
                🛒 Buyer Dashboard
              </Link>
              <button
                onClick={() => setShowTour(true)}
                className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg text-sm shadow-md hover:shadow-lg transition-all duration-200 text-center"
              >
                🎯 Take Tour
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Core Features</h2>
            <p className="section-subtitle">
              Revolutionizing agriculture through blockchain technology and AI-powered solutions
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <Link
                key={index}
                to={feature.link}
                className="group feature-card"
              >
                <div className="text-center">
                  <div className={`bg-gradient-to-r ${feature.color} rounded-lg p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:scale-105 transition-transform duration-200`}>
                    <span className="text-white text-xl">{feature.icon}</span>
                  </div>
                  <h3 className="card-title group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="card-subtitle">
                    {feature.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Choose Your Role</h2>
            <p className="section-subtitle">
              Join the agricultural revolution with role-specific tools and features
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {userTypes.map((userType, index) => (
              <Link
                key={index}
                to={userType.link}
                className="group feature-card"
              >
                <div className={`${userType.color} rounded-lg p-3 w-16 h-16 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-200`}>
                  <span className="text-white text-xl">{userType.icon}</span>
                </div>
                <h3 className="card-title group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                  {userType.title}
                </h3>
                <p className="card-subtitle mb-4">
                  {userType.description}
                </p>
                <ul className="space-y-2 mb-6">
                  {userType.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-600 dark:text-gray-400">
                      <span className="text-green-500 dark:text-green-400 mr-2 text-sm">✓</span>
                      <span className="text-sm font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="text-green-600 dark:text-green-400 font-semibold text-sm group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors">
                  Get Started →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Platform Statistics</h2>
            <p className="section-subtitle">
              Trusted by thousands of farmers, lenders, and buyers worldwide
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-6 text-center shadow-sm">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">$2.5M</div>
              <div className="text-gray-600 dark:text-gray-400 font-medium text-sm">Total Loans Disbursed</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6 text-center shadow-sm">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">1,250</div>
              <div className="text-gray-600 dark:text-gray-400 font-medium text-sm">Active Farmers</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-6 text-center shadow-sm">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">850</div>
              <div className="text-gray-600 dark:text-gray-400 font-medium text-sm">Verified Batches</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-6 text-center shadow-sm">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">95%</div>
              <div className="text-gray-600 dark:text-gray-400 font-medium text-sm">Loan Repayment Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Agriculture?
          </h2>
          <p className="text-lg text-green-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            Join thousands of farmers, lenders, and buyers already using AgriFinance
            to build a more transparent and inclusive agricultural ecosystem.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/farmer"
              className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Start as Farmer
            </Link>
            <Link
              to="/lender"
              className="bg-green-700 text-white px-8 py-3 rounded-lg font-semibold text-sm hover:bg-green-800 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Become a Lender
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-green-600 rounded-lg p-2">
                <span className="text-white text-xl">🌾</span>
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">AgriFinance</h3>
            <p className="text-gray-400 mb-6 text-sm">Transforming Agriculture Through Blockchain Technology</p>
            <div className="flex justify-center space-x-6">
              <Link to="/supply-chain" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Supply Chain</Link>
              <Link to="/nft-marketplace" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">NFT Marketplace</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Guided Tour Modal */}
      <GuidedTour isOpen={showTour} onClose={() => setShowTour(false)} />
    </div>
  );
};

export default Home;