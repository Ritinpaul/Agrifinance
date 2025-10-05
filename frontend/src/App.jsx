import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Web3Provider } from './context/Web3Context';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import ProfileCompletion from './components/ProfileCompletion';
import Home from './pages/Home';
import Services from './pages/Services';
import FarmerDashboard from './pages/FarmerDashboard';
import LenderDashboard from './pages/LenderDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import SupplyChain from './pages/SupplyChain';
import NFTMarketplace from './pages/NFTMarketplace';
import ProductVerification from './pages/ProductVerification';
import TokenFaucetPage from './pages/TokenFaucetPage';
import Wallet from './pages/Wallet';
import HybridWallet from './pages/HybridWallet';
import DAOGovernance from './pages/DAOGovernance';
import Staking from './pages/Staking';
import TransactionHistory from './pages/TransactionHistory';
import AdminDashboard from './pages/AdminDashboard';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Profile from './pages/Profile';
import Documentation from './pages/Documentation';
import './App.css';

// Component to handle profile completion modal
const AppContent = () => {
  
  try {
    const { user, loading } = useAuth();
    
    const [showProfileModal, setShowProfileModal] = useState(false);

    useEffect(() => {
      // Show profile completion modal if user is logged in but profile is not completed
      if (user && !loading) {
        const isProfileIncomplete = !user.profile_completed || 
          !user.first_name || 
          !user.last_name || 
          !user.role || 
          user.role === 'user';
        
        if (isProfileIncomplete) {
          setShowProfileModal(true);
        }
      }
    }, [user, loading]);

    // Show loading spinner while checking authentication
    if (loading) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      );
    }

    const handleProfileComplete = () => {
      setShowProfileModal(false);
    };

    return (
      <>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <Navbar />
            <main className="container mx-auto px-4 py-6">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/services" element={<Services />} />
                <Route path="/farmer" element={<ProtectedRoute roles={["farmer","admin"]}><FarmerDashboard /></ProtectedRoute>} />
                <Route path="/lender" element={<ProtectedRoute roles={["lender","admin"]}><LenderDashboard /></ProtectedRoute>} />
                <Route path="/buyer" element={<ProtectedRoute roles={["buyer","admin"]}><BuyerDashboard /></ProtectedRoute>} />
                <Route path="/supply-chain" element={<SupplyChain />} />
                <Route path="/nft-marketplace" element={<NFTMarketplace />} />
                <Route path="/verify-product" element={<ProductVerification />} />
                <Route path="/token-faucet" element={<ProtectedRoute><TokenFaucetPage /></ProtectedRoute>} />
                <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
                <Route path="/hybrid-wallet" element={<ProtectedRoute><HybridWallet /></ProtectedRoute>} />
                <Route path="/dao" element={<ProtectedRoute><DAOGovernance /></ProtectedRoute>} />
                <Route path="/staking" element={<ProtectedRoute><Staking /></ProtectedRoute>} />
                <Route path="/transactions" element={<ProtectedRoute><TransactionHistory /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
                <Route path="/docs" element={<Documentation />} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                     </Routes>
            </main>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--toast-bg, #363636)',
                  color: 'var(--toast-color, #fff)',
                },
              }}
            />
          </div>
        </Router>

        {/* Profile Completion Modal */}
        {showProfileModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <ProfileCompletion user={user} onComplete={handleProfileComplete} />
            </div>
          </div>
        )}
      </>
    );
  } catch (error) {
    console.error('❌ Error in AppContent:', error);
    return (
      <div className="min-h-screen bg-red-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">App Error</h1>
          <p className="text-gray-700 mb-4">Something went wrong loading the application.</p>
          <p className="text-sm text-gray-500">Check the console for details.</p>
        </div>
      </div>
    );
  }
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('❌ ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-100 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Context Error</h1>
            <p className="text-gray-700 mb-4">Error in {this.props.contextName || 'context provider'}</p>
            <p className="text-sm text-gray-500">Check the console for details.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  
  return (
    <ErrorBoundary contextName="ThemeProvider">
      <ThemeProvider>
        <ErrorBoundary contextName="AuthProvider">
          <AuthProvider>
            <ErrorBoundary contextName="Web3Provider">
              <Web3Provider>
                <AppContent />
              </Web3Provider>
            </ErrorBoundary>
          </AuthProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;