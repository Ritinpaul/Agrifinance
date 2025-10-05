import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Documentation = () => {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', title: 'Overview', icon: '📖' },
    { id: 'getting-started', title: 'Getting Started', icon: '🚀' },
    { id: 'farmer-guide', title: 'Farmer Guide', icon: '👨‍🌾' },
    { id: 'lender-guide', title: 'Lender Guide', icon: '💰' },
    { id: 'buyer-guide', title: 'Buyer Guide', icon: '🛒' },
    { id: 'features', title: 'Core Features', icon: '⚡' },
    { id: 'innovation', title: 'Technical Innovation', icon: '🔬' },
    { id: 'impact', title: 'Social Impact', icon: '🌍' },
    { id: 'architecture', title: 'System Architecture', icon: '🏗️' },
    { id: 'faq', title: 'FAQ', icon: '❓' }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          🌾 AgriFinance: Revolutionizing Agriculture with Blockchain & AI
        </h2>
        <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-4">
          AgriFinance is a cutting-edge blockchain-powered platform that democratizes agricultural finance, 
          eliminates traditional barriers to credit, and creates transparent supply chains. Built for the 
          hackathon challenge, we're transforming how farmers access capital, track produce, and connect with markets.
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">🏆 Hackathon Innovation Highlights</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span className="text-gray-600 dark:text-gray-400">Zero-collateral DeFi lending with blockchain verification</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span className="text-gray-600 dark:text-gray-400">Hybrid blockchain-database transaction system</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span className="text-gray-600 dark:text-gray-400">NFT land ownership verification</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span className="text-gray-600 dark:text-gray-400">Complete supply chain traceability</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-6 shadow-sm border border-green-200 dark:border-green-800">
          <div className="text-3xl mb-3">👨‍🌾</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">For Farmers</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
            Access instant loans without collateral, track your crops with blockchain technology, 
            and sell directly to verified buyers with complete transparency.
          </p>
          <div className="text-xs text-green-600 dark:text-green-400 font-medium">
            🚀 No traditional banks needed • 💰 Instant loan approval • 📱 Mobile-friendly
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6 shadow-sm border border-blue-200 dark:border-blue-800">
          <div className="text-3xl mb-3">💰</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">For Lenders</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
            Provide liquidity to farmers with AI-powered risk assessment, earn competitive returns, 
            and support sustainable agriculture while building a diversified portfolio.
          </p>
          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
            🤖 AI risk analysis • 📊 Real-time portfolio tracking • 🌱 Impact investing
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-6 shadow-sm border border-purple-200 dark:border-purple-800">
          <div className="text-3xl mb-3">🛒</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">For Buyers</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
            Purchase verified agricultural products with complete traceability from farm to table, 
            ensuring quality, authenticity, and supporting sustainable farming practices.
          </p>
          <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">
            🔍 QR code verification • 📦 Complete traceability • 🌾 Direct farmer connection
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg p-6 border border-orange-200 dark:border-orange-800">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">🎯 Problem We're Solving</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Traditional Challenges:</h4>
            <ul className="space-y-1 text-gray-600 dark:text-gray-400">
              <li>• Farmers lack collateral for loans</li>
              <li>• Supply chains lack transparency</li>
              <li>• Credit scoring is biased</li>
              <li>• Middlemen reduce farmer profits</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Our Solution:</h4>
            <ul className="space-y-1 text-gray-600 dark:text-gray-400">
              <li>• Blockchain-based loan verification</li>
              <li>• Blockchain supply chain tracking</li>
              <li>• NFT land ownership verification</li>
              <li>• Direct farmer-buyer connections</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGettingStarted = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        🚀 Getting Started
      </h2>
      
      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Step 1: Create an Account
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Sign up for a free account to access all platform features.
          </p>
          <Link to="/signup" className="agri-button inline-block">
            Create Account
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Step 2: Choose Your Wallet Option
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You have two options to access blockchain features like loans and NFTs:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">🦊 MetaMask Wallet</h4>
              <p className="text-blue-700 dark:text-blue-400 text-sm mb-2">
                Connect your existing MetaMask wallet for full blockchain features.
              </p>
              <a href="https://metamask.io" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 text-xs underline">
                Download MetaMask →
              </a>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">🏦 In-App Wallet</h4>
              <p className="text-green-700 dark:text-green-400 text-sm mb-2">
                Use our built-in wallet - no external software needed!
              </p>
              <Link to="/hybrid-wallet" className="text-green-600 dark:text-green-400 text-xs underline">
                Try In-App Wallet →
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Step 3: Choose Your Role
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Select whether you're a farmer, lender, or buyer to access relevant features.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/farmer" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
              👨‍🌾 Farmer Dashboard
            </Link>
            <Link to="/lender" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
              💰 Lender Dashboard
            </Link>
            <Link to="/buyer" className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700">
              🛒 Buyer Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFarmerGuide = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        👨‍🌾 Farmer Guide
      </h2>
      
      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            💰 Applying for Loans
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Get agricultural loans without traditional collateral using our blockchain-based verification system.
          </p>
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <span className="text-green-500 mt-1">✓</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">No traditional collateral required</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-green-500 mt-1">✓</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Blockchain verifies your farming history and land ownership</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-green-500 mt-1">✓</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Quick approval process</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            📦 Managing Crop Batches
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Track your agricultural products from harvest to sale with complete transparency.
          </p>
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <span className="text-blue-500 mt-1">📝</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Record harvest details (quantity, quality, date)</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-500 mt-1">🔍</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Get QR codes for product verification</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-500 mt-1">📊</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Track batch status and location</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            🧾 Land NFT Management
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Convert your land ownership into NFTs to improve your creditworthiness and prove ownership.
          </p>
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <span className="text-purple-500 mt-1">🏞️</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Mint NFTs for your land parcels</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-purple-500 mt-1">📈</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Improve your loan eligibility</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-purple-500 mt-1">🔒</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Secure land ownership records</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            📊 Loan History Tracking
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Track your loan applications, approvals, and repayment history to build a strong financial profile.
          </p>
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <span className="text-orange-500 mt-1">📊</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Real-time loan status updates</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-orange-500 mt-1">📈</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Track repayment progress</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-orange-500 mt-1">💡</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">View loan history and performance</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLenderGuide = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        💰 Lender Guide
      </h2>
      
      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            📋 Reviewing Loan Applications
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Review and approve loan applications from farmers using our comprehensive assessment tools.
          </p>
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <span className="text-green-500 mt-1">✓</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">View farmer's loan history and land ownership</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-green-500 mt-1">✓</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Analyze farming performance data</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-green-500 mt-1">✓</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Review land ownership NFTs</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            💼 Managing Your Portfolio
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Track your loan portfolio, monitor repayments, and analyze returns on your agricultural investments.
          </p>
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <span className="text-blue-500 mt-1">📊</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">View all active loans</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-500 mt-1">💰</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Track repayment schedules</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-500 mt-1">📈</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Analyze portfolio performance</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            🎯 Risk Assessment
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Use our AI-powered tools to assess risk and make informed lending decisions.
          </p>
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <span className="text-purple-500 mt-1">🤖</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">AI-powered risk analysis</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-purple-500 mt-1">📊</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Historical performance data</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-purple-500 mt-1">🌦️</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Weather and market analysis</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBuyerGuide = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        🛒 Buyer Guide
      </h2>
      
      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            🔍 Product Verification
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Verify the authenticity and quality of agricultural products using QR codes and blockchain records.
          </p>
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <span className="text-green-500 mt-1">📱</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Scan QR codes to verify products</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-green-500 mt-1">🔍</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">View complete product history</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-green-500 mt-1">✅</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Verify farmer and batch information</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            📦 Supply Chain Tracking
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Track products from farm to your location with complete transparency and traceability.
          </p>
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <span className="text-blue-500 mt-1">🌾</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">View farm origin details</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-500 mt-1">🚚</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Track transportation history</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-500 mt-1">📊</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Monitor storage conditions</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            🛍️ Making Purchases
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Purchase verified agricultural products directly from farmers with secure payment processing.
          </p>
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <span className="text-purple-500 mt-1">🛒</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Browse verified products</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-purple-500 mt-1">💳</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Secure payment processing</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-purple-500 mt-1">📞</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Direct farmer communication</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFeatures = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        ⚡ Core Platform Features
      </h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-6 shadow-sm border border-green-200 dark:border-green-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            💰 Zero Collateral DeFi Lending
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Revolutionary lending system using blockchain verification and NFT land ownership. No traditional collateral required.
          </p>
          <div className="text-xs text-green-600 dark:text-green-400 font-medium mb-2">
            🚀 Instant approval • 🔒 Blockchain verified • 💎 DeFi protocol
          </div>
          <Link to="/farmer" className="text-green-600 dark:text-green-400 text-sm font-medium hover:underline">
            Learn More →
          </Link>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6 shadow-sm border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            📦 Blockchain Supply Chain
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Complete traceability from farm to table with immutable blockchain records and QR code verification.
          </p>
          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-2">
            🔍 QR verification • 📊 Real-time tracking • 🔒 Immutable records
          </div>
          <Link to="/supply-chain" className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline">
            Learn More →
          </Link>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-6 shadow-sm border border-purple-200 dark:border-purple-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            🔍 Blockchain Verification
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Secure, transparent verification system using blockchain technology for land ownership and farming data validation.
          </p>
          <div className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-2">
            🔒 Immutable records • 📊 Data validation • 🌾 Farming verification
          </div>
          <Link to="/farmer" className="text-purple-600 dark:text-purple-400 text-sm font-medium hover:underline">
            Learn More →
          </Link>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-6 shadow-sm border border-orange-200 dark:border-orange-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            🧾 NFT Land Ownership
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Convert land ownership into NFTs for improved creditworthiness and secure ownership verification.
          </p>
          <div className="text-xs text-orange-600 dark:text-orange-400 font-medium mb-2">
            🏞️ Land NFTs • 📈 Credit boost • 🔐 Secure ownership
          </div>
          <Link to="/nft-marketplace" className="text-orange-600 dark:text-orange-400 text-sm font-medium hover:underline">
            Learn More →
          </Link>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-lg p-6 shadow-sm border border-indigo-200 dark:border-indigo-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            🏦 Hybrid Wallet System
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Seamless integration between MetaMask and in-app wallet for maximum accessibility and user convenience.
          </p>
          <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mb-2">
            🦊 MetaMask support • 🏦 In-app wallet • 🔄 Seamless sync
          </div>
          <Link to="/hybrid-wallet" className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:underline">
            Learn More →
          </Link>
        </div>

        <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-lg p-6 shadow-sm border border-pink-200 dark:border-pink-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            🎯 DAO Governance
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Decentralized governance system allowing community-driven decisions on platform development and policies.
          </p>
          <div className="text-xs text-pink-600 dark:text-pink-400 font-medium mb-2">
            🗳️ Community voting • 📋 Proposal system • 🌐 Decentralized
          </div>
          <Link to="/dao" className="text-pink-600 dark:text-pink-400 text-sm font-medium hover:underline">
            Learn More →
          </Link>
        </div>
      </div>
    </div>
  );

  const renderInnovation = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        🔬 Technical Innovation
      </h2>
      
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">🏆 Hackathon Innovation Highlights</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">🚀 Blockchain Innovations</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">✓</span>
                <span><strong>Hybrid Transaction System:</strong> Seamless blockchain-database synchronization</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">✓</span>
                <span><strong>Smart Contract Integration:</strong> Automated loan processing and NFT minting</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">✓</span>
                <span><strong>Gasless Transactions:</strong> Reduced blockchain costs for farmers</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">✓</span>
                <span><strong>Multi-Chain Support:</strong> Polygon network for scalability</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">🔍 Blockchain Verification</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">✓</span>
                <span><strong>Land Ownership Verification:</strong> NFT-based property validation</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">✓</span>
                <span><strong>Supply Chain Tracking:</strong> Immutable product journey records</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">✓</span>
                <span><strong>Transaction Verification:</strong> Blockchain-based loan processing</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">✓</span>
                <span><strong>Data Integrity:</strong> Tamper-proof farming records</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            🔧 Technical Stack
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">Frontend</h4>
              <p className="text-gray-600 dark:text-gray-400">React.js, Tailwind CSS, Ethers.js, React Router</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">Backend</h4>
              <p className="text-gray-600 dark:text-gray-400">Node.js, Express.js, PostgreSQL, JWT Authentication</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">Blockchain</h4>
              <p className="text-gray-600 dark:text-gray-400">Solidity, Hardhat, Polygon Network, MetaMask</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">Database</h4>
              <p className="text-gray-600 dark:text-gray-400">NeonDB (PostgreSQL), Redis caching</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            🛡️ Security Features
          </h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <span className="text-green-500">🔒</span>
              <span>End-to-end encryption for sensitive data</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">🔐</span>
              <span>JWT-based authentication system</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">🛡️</span>
              <span>Smart contract security audits</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">🔍</span>
              <span>Multi-layer verification system</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">📊</span>
              <span>Real-time transaction monitoring</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderImpact = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        🌍 Social Impact & Sustainability
      </h2>
      
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">🎯 Our Mission</h3>
        <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-4">
          AgriFinance is designed to democratize agricultural finance and create sustainable, transparent supply chains 
          that benefit farmers, consumers, and the environment. We're building a more equitable agricultural ecosystem.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-6 shadow-sm border border-green-200 dark:border-green-800">
          <div className="text-3xl mb-3">👨‍🌾</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Farmer Empowerment</h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>• Access to credit without traditional collateral</li>
            <li>• Direct market access bypassing middlemen</li>
            <li>• Fair pricing through transparent transactions</li>
            <li>• Land ownership verification and protection</li>
            <li>• Financial inclusion for underserved communities</li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6 shadow-sm border border-blue-200 dark:border-blue-800">
          <div className="text-3xl mb-3">🌱</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Environmental Impact</h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>• Reduced food waste through better tracking</li>
            <li>• Support for sustainable farming practices</li>
            <li>• Carbon footprint reduction in supply chains</li>
            <li>• Incentivizing organic and eco-friendly methods</li>
            <li>• Transparent environmental impact reporting</li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-6 shadow-sm border border-purple-200 dark:border-purple-800">
          <div className="text-3xl mb-3">🏘️</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Community Benefits</h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>• Strengthened rural economies</li>
            <li>• Job creation in agricultural tech</li>
            <li>• Knowledge sharing and education</li>
            <li>• Community-driven governance</li>
            <li>• Reduced inequality in agricultural access</li>
          </ul>
        </div>
      </div>

      <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg p-6 border border-orange-200 dark:border-orange-800">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">📊 Impact Metrics & Goals</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Short-term Goals (6 months)</h4>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>• Onboard 1,000+ farmers to the platform</li>
              <li>• Process $1M+ in agricultural loans</li>
              <li>• Track 10,000+ product batches</li>
              <li>• Reduce loan processing time by 80%</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Long-term Vision (2 years)</h4>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>• Serve 100,000+ farmers globally</li>
              <li>• Process $100M+ in agricultural finance</li>
              <li>• Create 1M+ verified product records</li>
              <li>• Reduce food waste by 30%</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderArchitecture = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        🏗️ System Architecture
      </h2>
      
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-6 border border-indigo-200 dark:border-indigo-800">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">🔄 Hybrid Blockchain Architecture</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Our innovative hybrid system combines the security of blockchain with the efficiency of traditional databases, 
          ensuring both transparency and scalability for agricultural applications.
        </p>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">🔗 Blockchain Layer</h4>
            <ul className="space-y-1 text-gray-600 dark:text-gray-400">
              <li>• Smart contracts for loans & NFTs</li>
              <li>• Immutable transaction records</li>
              <li>• Decentralized governance</li>
              <li>• Cryptocurrency transactions</li>
            </ul>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">💾 Database Layer</h4>
            <ul className="space-y-1 text-gray-600 dark:text-gray-400">
              <li>• User profiles & preferences</li>
              <li>• Supply chain tracking data</li>
              <li>• Analytics & reporting</li>
              <li>• Fast query performance</li>
            </ul>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">🔄 Sync Layer</h4>
            <ul className="space-y-1 text-gray-600 dark:text-gray-400">
              <li>• Real-time synchronization</li>
              <li>• Conflict resolution</li>
              <li>• Data integrity checks</li>
              <li>• Automated reconciliation</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            🏛️ Smart Contracts
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">KrishiToken (KRSI)</h4>
              <p className="text-gray-600 dark:text-gray-400">ERC-20 token with staking, governance, and burning capabilities</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">LoanContract</h4>
              <p className="text-gray-600 dark:text-gray-400">Automated loan processing and repayment management</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">NFTLand</h4>
              <p className="text-gray-600 dark:text-gray-400">ERC-721 NFTs for land ownership verification</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">AgriFinanceDAO</h4>
              <p className="text-gray-600 dark:text-gray-400">Governance token for community-driven decisions</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            🗄️ Database Schema
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">User Management</h4>
              <p className="text-gray-600 dark:text-gray-400">Users, farmer_profiles, wallet_accounts</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">Financial Data</h4>
              <p className="text-gray-600 dark:text-gray-400">farmer_loans, wallet_transactions</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">Supply Chain</h4>
              <p className="text-gray-600 dark:text-gray-400">farmer_batches, nfts, supply_chain_events</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">Governance</h4>
              <p className="text-gray-600 dark:text-gray-400">dao_proposals, dao_votes, agricultural_metrics</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">🚀 Scalability & Performance</h3>
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Performance Optimizations</h4>
            <ul className="space-y-1 text-gray-600 dark:text-gray-400">
              <li>• Database indexing for fast queries</li>
              <li>• Caching layer for frequently accessed data</li>
              <li>• Optimized smart contract gas usage</li>
              <li>• CDN for static asset delivery</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Scalability Features</h4>
            <ul className="space-y-1 text-gray-600 dark:text-gray-400">
              <li>• Microservices architecture</li>
              <li>• Horizontal scaling capabilities</li>
              <li>• Load balancing and failover</li>
              <li>• Multi-region deployment support</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFAQ = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        ❓ Frequently Asked Questions
      </h2>
      
      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            What is AgriFinance?
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            AgriFinance is a blockchain-powered platform that helps farmers get loans without traditional collateral, 
            tracks agricultural products from farm to market, and connects farmers with lenders and buyers using 
            blockchain verification and NFT land ownership validation.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            How do I get a loan as a farmer?
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Farmers can apply for loans through the Farmer Dashboard. Our blockchain-based system verifies your 
            land ownership through NFTs and farming data to determine loan eligibility. No traditional collateral is required.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            What is a land NFT?
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            A land NFT (Non-Fungible Token) is a digital certificate that proves your ownership of agricultural land. 
            It's stored on the blockchain and can be used for loan verification, making it easier to get loans without traditional collateral.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            How does product verification work?
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Each batch of agricultural products gets a unique QR code. Buyers can scan this code to see the complete 
            history of the product, including farm details, harvest date, transportation, and storage information.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Do I need to pay to use the platform?
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Creating an account and basic platform usage is free. You only pay transaction fees for blockchain 
            operations (like minting NFTs or processing loans) and any fees associated with specific services.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            What if I don't have a MetaMask wallet?
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            No problem! You can use our built-in in-app wallet instead. It provides the same blockchain features 
            without requiring external software. You can also install MetaMask later if you prefer. Both options 
            give you full access to loans, NFTs, and other blockchain features.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            How does the hybrid blockchain system work?
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Our hybrid system combines blockchain security with database efficiency. Important transactions 
            (like loans and NFT minting) are recorded on the blockchain for transparency, while detailed data 
            (like user profiles and analytics) is stored in our database for fast access. This gives you the 
            best of both worlds: security and performance.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Is my data secure on the platform?
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Absolutely! We use enterprise-grade security including end-to-end encryption, JWT authentication, 
            and smart contract audits. Your sensitive data is encrypted, and blockchain transactions are 
            immutable. We also have real-time monitoring to detect any suspicious activity.
          </p>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'overview': return renderOverview();
      case 'getting-started': return renderGettingStarted();
      case 'farmer-guide': return renderFarmerGuide();
      case 'lender-guide': return renderLenderGuide();
      case 'buyer-guide': return renderBuyerGuide();
      case 'features': return renderFeatures();
      case 'innovation': return renderInnovation();
      case 'impact': return renderImpact();
      case 'architecture': return renderArchitecture();
      case 'faq': return renderFAQ();
      default: return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                📖 Documentation
              </h2>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      activeSection === section.id
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="mr-2">{section.icon}</span>
                    {section.title}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation;
