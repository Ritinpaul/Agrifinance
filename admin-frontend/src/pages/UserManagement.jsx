import { useState, useEffect } from 'react';
import { UsersIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with real API call
    const mockUsers = [
      {
        id: 1,
        walletAddress: '0x1234...5678',
        userType: 'farmer',
        profile: {
          name: 'Rajesh Kumar',
          email: 'rajesh@example.com',
          phone: '+91 98765 43210',
          location: 'Punjab, India'
        },
        creditScore: 750,
        reputation: 85,
        isVerified: false,
        createdAt: new Date('2024-01-15')
      },
      {
        id: 2,
        walletAddress: '0x2345...6789',
        userType: 'lender',
        profile: {
          name: 'Priya Sharma',
          email: 'priya@example.com',
          phone: '+91 98765 43211',
          location: 'Mumbai, India'
        },
        creditScore: 0,
        reputation: 92,
        isVerified: true,
        createdAt: new Date('2024-01-10')
      },
      {
        id: 3,
        walletAddress: '0x3456...7890',
        userType: 'buyer',
        profile: {
          name: 'Amit Patel',
          email: 'amit@example.com',
          phone: '+91 98765 43212',
          location: 'Delhi, India',
          organization: 'Fresh Foods Ltd'
        },
        creditScore: 0,
        reputation: 78,
        isVerified: true,
        createdAt: new Date('2024-01-08')
      }
    ];
    
    setUsers(mockUsers);
    setLoading(false);
  }, []);

  const handleVerifyUser = async (userId) => {
    // Mock API call
    setUsers(users.map(user => 
      user.id === userId ? { ...user, isVerified: true } : user
    ));
  };

  const handleRejectUser = async (userId) => {
    // Mock API call
    setUsers(users.filter(user => user.id !== userId));
  };

  const filteredUsers = users.filter(user => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !user.isVerified;
    if (filter === 'verified') return user.isVerified;
    return user.userType === filter;
  });

  const getUserTypeColor = (type) => {
    switch (type) {
      case 'farmer':
        return 'admin-badge-success';
      case 'lender':
        return 'admin-badge-info';
      case 'buyer':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">User Management</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage user registrations and verifications
        </p>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="admin-button admin-button-secondary"
        >
          <option value="all">All Users</option>
          <option value="pending">Pending Verification</option>
          <option value="verified">Verified Users</option>
          <option value="farmer">Farmers</option>
          <option value="lender">Lenders</option>
          <option value="buyer">Buyers</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="admin-card">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="admin-table th">
                  User
                </th>
                <th className="admin-table th">
                  Type
                </th>
                <th className="admin-table th">
                  Credit Score
                </th>
                <th className="admin-table th">
                  Reputation
                </th>
                <th className="admin-table th">
                  Status
                </th>
                <th className="admin-table th">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="admin-table td">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                          <UsersIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {user.profile.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.profile.email}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {user.walletAddress}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="admin-table td">
                    <span className={`admin-badge ${getUserTypeColor(user.userType)}`}>
                      {user.userType}
                    </span>
                  </td>
                  <td className="admin-table td">
                    {user.creditScore > 0 ? user.creditScore : '-'}
                  </td>
                  <td className="admin-table td">
                    {user.reputation}
                  </td>
                  <td className="admin-table td">
                    <span className={`admin-badge ${
                      user.isVerified 
                        ? 'admin-badge-success' 
                        : 'admin-badge-warning'
                    }`}>
                      {user.isVerified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="admin-table td">
                    {!user.isVerified && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleVerifyUser(user.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <CheckIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleRejectUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
