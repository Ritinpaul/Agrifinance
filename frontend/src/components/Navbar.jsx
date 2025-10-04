import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { useTheme } from '../context/ThemeContext';
import { useSupabase } from '../context/SupabaseContext';
import AuthModal from './AuthModal';
import ServicesDropdown from './ServicesDropdown';
import toast from 'react-hot-toast';

const Navbar = () => {
  const location = useLocation();
  const { account, isConnected, connectWallet, disconnectWallet, isLoading, error } = useWeb3();
  const { theme, toggleTheme } = useTheme();
  const { user, session, userProfile, signOut, loading } = useSupabase();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(0);
  
  // Force refresh when user state changes
  useEffect(() => {
    setForceRefresh(prev => prev + 1);
  }, [user, userProfile, loading]);
  
  // Drive auth UI strictly from `user`, which we clear aggressively on signOut
  const isAuthenticated = Boolean(user?.id);

  const isActive = (path) => location.pathname === path;

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm z-40 relative">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 shrink-0">
            <div className="w-8 h-8 bg-green-600 dark:bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">🌾</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
              AgriFinance
            </span>
          </Link>

          {/* Navigation Links - Desktop */}
          <div className="hidden lg:flex items-center space-x-8 flex-1 justify-center">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              Home
            </Link>
            <ServicesDropdown />
            <Link 
              to="/supply-chain" 
              className={`text-sm font-medium transition-colors ${
                isActive('/supply-chain') 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              Supply Chain
            </Link>
            <Link 
              to="/nft-marketplace" 
              className={`text-sm font-medium transition-colors ${
                isActive('/nft-marketplace') 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              NFT Marketplace
            </Link>
            <Link 
              to="/verify-product" 
              className={`text-sm font-medium transition-colors ${
                isActive('/verify-product') 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              Verify Product
            </Link>
            <Link 
              to="/token-faucet" 
              className={`text-sm font-medium transition-colors ${
                isActive('/token-faucet') 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              Token Faucet
            </Link>
            <Link 
              to="/docs" 
              className={`text-sm font-medium transition-colors ${
                isActive('/docs') 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              Docs
            </Link>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4 shrink-0">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>

            {/* Authentication */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setOpenUserMenu((v) => !v)}
                  className="flex items-center space-x-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-blue-500 text-white flex items-center justify-center text-sm font-semibold">
                    {(userProfile?.first_name || userProfile?.email || user?.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {userProfile?.first_name || 'User'}
                  </span>
                  <svg className={`w-4 h-4 text-gray-500 dark:text-gray-300 transform transition-transform ${openUserMenu ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                  </svg>
                </button>
                {openUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{userProfile?.first_name || 'User'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{userProfile?.email || user?.email}</p>
                    </div>
                    <Link 
                      to="/profile" 
                      onClick={() => setOpenUserMenu(false)} 
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={async () => {
                        try {
                          // Close menu immediately
                          setOpenUserMenu(false);
                          
                          // Show immediate feedback
                          toast.success('Signing out...');
                          
                          // Perform sign out
                          const { error } = await signOut();
                          if (error) {
                            toast.error(error.message || 'Failed to sign out');
                            return;
                          }
                          
                          // Force page reload to ensure clean state
                          setTimeout(() => {
                            window.location.href = '/signin';
                          }, 500);
                        } catch (error) {
                          toast.error('Failed to sign out');
                          console.error('Sign out error:', error);
                          // Still redirect to signin page
                          setTimeout(() => {
                            window.location.href = '/signin';
                          }, 500);
                        }
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link 
                  to="/signin" 
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  to="/signup" 
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Wallet */}
            {isConnected ? (
              <div className="flex items-center space-x-2">
                <div className="hidden xl:flex items-center bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="ml-2 text-xs font-medium text-blue-700 dark:text-blue-400">{formatAddress(account)}</span>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-3 space-y-1">
          <Link to="/" className={`block px-3 py-2 rounded-md text-sm ${isActive('/') ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'}`}>Home</Link>
          <div className="px-3">
            <div className="text-sm font-medium mb-1">Services</div>
            <div className="ml-4 space-y-1">
              <Link to="/farmer" className="block px-3 py-2 rounded-md text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">Farmer Dashboard</Link>
              <Link to="/lender" className="block px-3 py-2 rounded-md text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">Lender Dashboard</Link>
              <Link to="/buyer" className="block px-3 py-2 rounded-md text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">Buyer Dashboard</Link>
            </div>
          </div>
          <Link to="/supply-chain" className={`block px-3 py-2 rounded-md text-sm ${isActive('/supply-chain') ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'}`}>Supply Chain</Link>
          <Link to="/nft-marketplace" className={`block px-3 py-2 rounded-md text-sm ${isActive('/nft-marketplace') ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'}`}>NFT Marketplace</Link>
          <Link to="/verify-product" className={`block px-3 py-2 rounded-md text-sm ${isActive('/verify-product') ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'}`}>Verify Product</Link>
          <Link to="/token-faucet" className={`block px-3 py-2 rounded-md text-sm ${isActive('/token-faucet') ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'}`}>Token Faucet</Link>
          <Link to="/docs" className={`block px-3 py-2 rounded-md text-sm ${isActive('/docs') ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'}`}>Docs</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;