import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

// Fallback ChevronDownIcon component
const ChevronDownIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const ServicesDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isServicesActive = () => {
    return ['/services', '/farmer', '/lender', '/buyer'].includes(location.pathname);
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

  const services = [
    {
      name: 'Farmer',
      path: '/farmer',
      description: 'Manage your farm, apply for loans, and track your crops',
      icon: '🌾'
    },
    {
      name: 'Lender',
      path: '/lender',
      description: 'Provide loans to farmers and manage your portfolio',
      icon: '💰'
    },
    {
      name: 'Buyer',
      path: '/buyer',
      description: 'Purchase verified agricultural products and track supply chain',
      icon: '🛒'
    }
  ];

  return (
    <div className="relative shrink-0 z-40" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`nav-link flex items-center space-x-1 px-2 text-sm ${
          isServicesActive() ? 'nav-link-active' : 'nav-link-inactive'
        }`}
      >
        <span>Services</span>
        <ChevronDownIcon 
          className={`h-4 w-4 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 services-dropdown">
          <div className="p-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Our Services
            </h3>

            {/* Services Overview Link */}
            <Link
              to="/services"
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 rounded-lg transition-colors duration-200 mb-2 services-dropdown-item ${
                isActive('/services')
                  ? 'active bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl">🏢</span>
                <span className={`text-sm font-medium ${
                  isActive('/services') ? 'text-green-700 dark:text-green-300' : 'text-gray-900 dark:text-gray-100'
                }`}>
                  Services Overview
                </span>
              </div>
            </Link>

            <div className="space-y-1">
              {services.map((service) => (
                <Link
                  key={service.path}
                  to={service.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2 rounded-lg transition-colors duration-200 services-dropdown-item ${
                    isActive(service.path)
                      ? 'active bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{service.icon}</span>
                    <span className={`text-sm font-medium ${
                      isActive(service.path) ? 'text-green-700 dark:text-green-300' : 'text-gray-900 dark:text-gray-100'
                    }`}>
                      {service.name}
                    </span>
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

export default ServicesDropdown;
