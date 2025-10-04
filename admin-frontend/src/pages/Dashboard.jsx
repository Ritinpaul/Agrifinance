import { useState, useEffect } from 'react';
import {
  UsersIcon,
  CurrencyDollarIcon,
  CubeIcon,
  TruckIcon,
  ChartBarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeLoans: 0,
    totalNFTs: 0,
    pendingVerifications: 0,
    platformRevenue: 0,
    riskAlerts: 0
  });

  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    // Mock data - replace with real API calls
    setStats({
      totalUsers: 1247,
      activeLoans: 89,
      totalNFTs: 156,
      pendingVerifications: 23,
      platformRevenue: 45678,
      riskAlerts: 3
    });

    setRecentActivity([
      {
        id: 1,
        type: 'loan_application',
        user: 'Rajesh Kumar',
        amount: 5000,
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        status: 'pending'
      },
      {
        id: 2,
        type: 'nft_verification',
        user: 'Priya Sharma',
        amount: null,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        status: 'pending'
      },
      {
        id: 3,
        type: 'batch_verification',
        user: 'Amit Patel',
        amount: null,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
        status: 'approved'
      }
    ]);
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (minutes < 60) {
      return `${minutes} minutes ago`;
    } else {
      return `${hours} hours ago`;
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'loan_application':
        return <CurrencyDollarIcon className="h-5 w-5 text-blue-500" />;
      case 'nft_verification':
        return <CubeIcon className="h-5 w-5 text-green-500" />;
      case 'batch_verification':
        return <TruckIcon className="h-5 w-5 text-purple-500" />;
      default:
        return <UsersIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
      case 'approved':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      case 'rejected':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Overview of AgriFinance platform operations
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="admin-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UsersIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Total Users
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {stats.totalUsers.toLocaleString()}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Active Loans
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {stats.activeLoans}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CubeIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Total NFTs
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {stats.totalNFTs}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TruckIcon className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Pending Verifications
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {stats.pendingVerifications}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Platform Revenue
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {formatCurrency(stats.platformRevenue)}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Risk Alerts
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {stats.riskAlerts}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="admin-card">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Recent Activity</h3>
        <div className="flow-root">
          <ul className="-mb-8">
            {recentActivity.map((activity, activityIdx) => (
              <li key={activity.id}>
                <div className="relative pb-8">
                  {activityIdx !== recentActivity.length - 1 ? (
                    <span
                      className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-600"
                      aria-hidden="true"
                    />
                  ) : null}
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center ring-8 ring-white dark:ring-gray-800">
                        {getActivityIcon(activity.type)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-medium text-gray-900 dark:text-gray-100">{activity.user}</span>{' '}
                          {activity.type === 'loan_application' && 'applied for a loan'}
                          {activity.type === 'nft_verification' && 'requested NFT verification'}
                          {activity.type === 'batch_verification' && 'submitted batch for verification'}
                          {activity.amount && ` of ${formatCurrency(activity.amount)}`}
                        </p>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                          {activity.status}
                        </span>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                          {formatTimeAgo(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
