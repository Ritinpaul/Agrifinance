import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

// Fallback ChevronDownIcon component
const ChevronDownIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const DigitalAssetsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isDigitalAssetsActive = () => {
    return ['/hybrid-wallet', '/staking', '/dao', '/transactions'].includes(location.pathname);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const digitalAssets = [
    {
      name: 'Wallet',
      path: '/hybrid-wallet',
      description: 'Manage your mobile and blockchain wallets',
      icon: '💳'
    },
    {
      name: 'Staking',
      path: '/staking',
      description: 'Stake KRSI tokens and earn rewards',
      icon: '🥩'
    },
    {
      name: 'DAO',
      path: '/dao',
      description: 'Participate in community governance',
      icon: '🏛️'
    },
    {
      name: 'Transactions',
      path: '/transactions',
      description: 'View your transaction history',
      icon: '📊'
    }
  ];

  return (
    <div className="relative shrink-0 z-40" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`nav-link flex items-center space-x-1 px-2 text-sm ${
          isDigitalAssetsActive() ? 'nav-link-active' : 'nav-link-inactive'
        }`}
      >
        <span>Digital Assets</span>
        <ChevronDownIcon 
          className={`h-4 w-4 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 digital-assets-dropdown">
          <div className="p-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Digital Assets
            </h3>

            <div className="space-y-1">
              {digitalAssets.map((asset) => (
                <Link
                  key={asset.path}
                  to={asset.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2 rounded-lg transition-colors duration-200 digital-assets-dropdown-item ${
                    isActive(asset.path)
                      ? 'active bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{asset.icon}</span>
                    <div className="flex-1">
                      <span className={`text-sm font-medium ${
                        isActive(asset.path) ? 'text-green-700 dark:text-green-300' : 'text-gray-900 dark:text-gray-100'
                      }`}>
                        {asset.name}
                      </span>
                      <p className={`text-xs ${
                        isActive(asset.path) ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {asset.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DigitalAssetsDropdown;
