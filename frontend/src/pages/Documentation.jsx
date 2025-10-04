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
    { id: 'features', title: 'Features', icon: '⚡' },
    { id: 'faq', title: 'FAQ', icon: '❓' }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          🌾 Welcome to AgriFinance Documentation
        </h2>
        <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
          AgriFinance is a blockchain-powered platform that helps farmers get loans without traditional collateral, 
          tracks agricultural products from farm to market, and connects farmers with lenders and buyers. 
          This documentation will help you understand how to use our platform effectively.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-3xl mb-3">👨‍🌾</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">For Farmers</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Get loans without traditional collateral, track your crops, and sell directly to buyers.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-3xl mb-3">💰</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">For Lenders</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Provide loans to farmers and earn returns while supporting agriculture.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-3xl mb-3">🛒</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">For Buyers</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Buy verified agricultural products with complete traceability.
          </p>
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
            Step 2: Connect Your Wallet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Connect your MetaMask wallet to interact with blockchain features like loans and NFTs.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-blue-800 dark:text-blue-300 text-sm">
              <strong>Note:</strong> You need MetaMask wallet installed in your browser. 
              Download it from <a href="https://metamask.io" target="_blank" rel="noopener noreferrer" className="underline">metamask.io</a>
            </p>
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
            Get agricultural loans without traditional collateral using our AI-powered credit scoring system.
          </p>
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <span className="text-green-500 mt-1">✓</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">No traditional collateral required</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-green-500 mt-1">✓</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">AI analyzes your farming history and yield data</span>
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
              <span className="text-sm text-gray-600 dark:text-gray-400">Improve your credit score</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-purple-500 mt-1">🔒</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Secure land ownership records</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            🤖 Credit Score Monitoring
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Monitor your AI-powered credit score based on farming performance, loan history, and land ownership.
          </p>
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <span className="text-orange-500 mt-1">📊</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Real-time credit score updates</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-orange-500 mt-1">📈</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Track factors affecting your score</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-orange-500 mt-1">💡</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Get tips to improve your score</span>
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
              <span className="text-sm text-gray-600 dark:text-gray-400">View farmer's credit score and history</span>
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
        ⚡ Platform Features
      </h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            💰 Zero Collateral DeFi Lending
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Get agricultural loans without traditional collateral using blockchain technology and AI credit scoring.
          </p>
          <Link to="/farmer" className="text-green-600 dark:text-green-400 text-sm font-medium hover:underline">
            Learn More →
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            📦 Blockchain Supply Chain
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Track agricultural products from farm to market with complete transparency and immutability.
          </p>
          <Link to="/supply-chain" className="text-green-600 dark:text-green-400 text-sm font-medium hover:underline">
            Learn More →
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            🤖 AI Credit Scoring
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Fair credit assessments based on yield data, sales history, weather patterns, and farming practices.
          </p>
          <Link to="/farmer" className="text-green-600 dark:text-green-400 text-sm font-medium hover:underline">
            Learn More →
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            🧾 NFT Land Ownership
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Convert land ownership into NFTs to improve creditworthiness and prove ownership securely.
          </p>
          <Link to="/nft-marketplace" className="text-green-600 dark:text-green-400 text-sm font-medium hover:underline">
            Learn More →
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            🔍 Product Verification
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Verify product authenticity and quality using QR codes and blockchain verification.
          </p>
          <Link to="/verify-product" className="text-green-600 dark:text-green-400 text-sm font-medium hover:underline">
            Learn More →
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            🚰 Token Faucet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Get free test tokens to explore platform features without spending real money.
          </p>
          <Link to="/token-faucet" className="text-green-600 dark:text-green-400 text-sm font-medium hover:underline">
            Learn More →
          </Link>
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
            AI-powered credit scoring and NFT land ownership verification.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            How do I get a loan as a farmer?
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Farmers can apply for loans through the Farmer Dashboard. Our AI system analyzes your farming history, 
            yield data, and land ownership to determine your creditworthiness. No traditional collateral is required.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            What is a land NFT?
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            A land NFT (Non-Fungible Token) is a digital certificate that proves your ownership of agricultural land. 
            It's stored on the blockchain and can improve your credit score, making it easier to get loans.
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
            You can still create an account and explore most features without a wallet. However, to access 
            blockchain features like loans and NFTs, you'll need to install MetaMask wallet in your browser.
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
