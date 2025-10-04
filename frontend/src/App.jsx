import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Web3Provider } from './context/Web3Context';
import { ThemeProvider } from './context/ThemeContext';
import { SupabaseProvider, useSupabase } from './context/SupabaseContext';
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
import Staking from './pages/Staking';
import TransactionHistory from './pages/TransactionHistory';
import AdminDashboard from './pages/AdminDashboard';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Profile from './pages/Profile';
import Documentation from './pages/Documentation';
import SupabaseTest from './pages/SupabaseTest';
import './App.css';

// Component to handle profile completion modal
const AppContent = () => {
  const { user, userProfile, loading } = useSupabase();
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    // Show profile completion modal if user is logged in but profile is not completed
    // or if essential fields are missing
    if (user && userProfile && !loading) {
      const isProfileIncomplete = !userProfile.profile_completed || 
        !userProfile.first_name || 
        !userProfile.last_name || 
        !userProfile.role || 
        userProfile.role === 'user';
      
      if (isProfileIncomplete) {
        setShowProfileModal(true);
      }
    }
  }, [user, userProfile, loading]);

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
              <Route path="/staking" element={<ProtectedRoute><Staking /></ProtectedRoute>} />
              <Route path="/transactions" element={<ProtectedRoute><TransactionHistory /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
                     <Route path="/docs" element={<Documentation />} />
                     <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                     <Route path="/test-supabase" element={<SupabaseTest />} />
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
            <ProfileCompletion onComplete={handleProfileComplete} />
          </div>
        </div>
      )}
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <SupabaseProvider>
        <Web3Provider>
          <AppContent />
        </Web3Provider>
      </SupabaseProvider>
    </ThemeProvider>
  );
}

export default App;