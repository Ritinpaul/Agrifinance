import { useState, useEffect } from 'react';
import { UsersIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import adminApi from '../lib/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getUsers();
      setUsers(response?.users || []);
    } catch (error) {
      console.error('Failed to load users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    if (filter === 'all') return true;
    if (filter === 'admin') return user.role === 'admin';
    if (filter === 'user') return user.role === 'user' || !user.role;
    return true;
  });

  const getUserTypeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'user':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500 dark:text-gray-400">Loading users...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">User Management</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage user registrations and platform access
          </p>
        </div>
        <button 
          onClick={loadUsers}
          disabled={loading}
          className="admin-button admin-button-secondary flex items-center space-x-2"
        >
          <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="admin-button admin-button-secondary"
        >
          <option value="all">All Users ({users.length})</option>
          <option value="admin">Admins ({users.filter(u => u.role === 'admin').length})</option>
          <option value="user">Regular Users ({users.filter(u => !u.role || u.role === 'user').length})</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="admin-card">
        {users.length === 0 && !loading ? (
          <div className="text-center py-12">
            <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No users found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Users will appear here once they register on the platform.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      No users match the selected filter
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {user.first_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {user.first_name || user.last_name 
                                ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                                : 'No Name'}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              ID: {user.id.substring(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {user.phone}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getUserTypeColor(user.role || 'user')}`}>
                          {(user.role || 'user').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {new Date(user.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(user.created_at).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          user.profile_completed 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {user.profile_completed ? 'Active' : 'Incomplete'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
