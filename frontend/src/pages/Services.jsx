import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const Services = () => {
  const { isDark } = useTheme();

  const services = [
    {
      id: 'farmer',
      title: 'Farmer Services',
      description: 'Manage your farm operations, apply for agricultural loans, track your crops, and access farming resources.',
      icon: '🌾',
      features: [
        'Apply for agricultural loans',
        'Track crop production',
        'Manage farm inventory',
        'Access farming resources',
        'Connect with buyers',
        'Monitor soil health'
      ],
      link: '/farmer',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'lender',
      title: 'Lender Services',
      description: 'Provide financial support to farmers, manage your loan portfolio, and earn returns on agricultural investments.',
      icon: '💰',
      features: [
        'Review loan applications',
        'Manage loan portfolio',
        'Track repayment schedules',
        'Assess farmer creditworthiness',
        'Monitor agricultural markets',
        'Generate investment reports'
      ],
      link: '/lender',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'buyer',
      title: 'Buyer Services',
      description: 'Purchase verified agricultural products, track supply chain, and ensure product quality and authenticity.',
      icon: '🛒',
      features: [
        'Browse verified products',
        'Track supply chain',
        'Verify product authenticity',
        'Place bulk orders',
        'Monitor product quality',
        'Access market analytics'
      ],
      link: '/buyer',
      color: 'from-purple-500 to-purple-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Our Services
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            AgriFinance provides comprehensive solutions for farmers, lenders, and buyers in the agricultural ecosystem.
            Choose the service that best fits your needs.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
            >
              {/* Service Header */}
              <div className={`bg-gradient-to-r ${service.color} p-6 text-white`}>
                <div className="text-4xl mb-3">{service.icon}</div>
                <h3 className="text-2xl font-bold mb-2">{service.title}</h3>
                <p className="text-white/90">{service.description}</p>
              </div>

              {/* Features List */}
              <div className="p-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Key Features:
                </h4>
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-600 dark:text-gray-400">
                      <svg className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Action Button */}
                <Link
                  to={service.link}
                  className={`w-full bg-gradient-to-r ${service.color} text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-200 transform group-hover:scale-105 text-center block`}
                >
                  Access {service.title}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose AgriFinance?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Blockchain Verified
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  All transactions and products are verified on the blockchain for transparency and security.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Fast & Secure
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Quick loan processing and secure payment systems for all agricultural transactions.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Community Driven
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Built by and for the agricultural community with sustainable farming practices in mind.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
