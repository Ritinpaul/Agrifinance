import { useState, useEffect } from 'react';
import { CurrencyDollarIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

const LoanManagement = () => {
  const [loans, setLoans] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const load = async () => {
      try {
        // Placeholder removed: load empty until backend loans API exists
        setLoans([]);
      } catch (e) {
        setLoans([]);
      }
    };
    load();
  }, []);

  const handleApproveLoan = async (loanId) => {
    setLoans(loans.map(loan => 
      loan.id === loanId ? { ...loan, status: 'active' } : loan
    ));
  };

  const handleRejectLoan = async (loanId) => {
    setLoans(loans.map(loan => 
      loan.id === loanId ? { ...loan, status: 'rejected' } : loan
    ));
  };

  const filteredLoans = loans.filter(loan => {
    if (filter === 'all') return true;
    return loan.status === filter;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'repaid':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Loan Management</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Monitor and manage loan applications and approvals
        </p>
      </div>

      <div className="flex space-x-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="admin-button admin-button-secondary"
        >
          <option value="all">All Loans</option>
          <option value="pending">Pending Approval</option>
          <option value="active">Active Loans</option>
          <option value="rejected">Rejected</option>
          <option value="repaid">Repaid</option>
        </select>
      </div>

      <div className="admin-card">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="admin-table th">
                  Loan Details
                </th>
                <th className="admin-table th">
                  Amount
                </th>
                <th className="admin-table th">
                  Interest Rate
                </th>
                <th className="admin-table th">
                  Duration
                </th>
                <th className="admin-table th">
                  Credit Score
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
              {filteredLoans.map((loan) => (
                <tr key={loan.id}>
                  <td className="admin-table td">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-600 flex items-center justify-center">
                          <CurrencyDollarIcon className="h-6 w-6 text-green-600 dark:text-green-300" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Loan #{loan.id}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {loan.purpose}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {loan.borrower}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="admin-table td">
                    {formatCurrency(loan.amount)}
                  </td>
                  <td className="admin-table td">
                    {loan.interestRate}%
                  </td>
                  <td className="admin-table td">
                    {loan.duration} days
                  </td>
                  <td className="admin-table td">
                    {loan.creditScore}
                  </td>
                  <td className="admin-table td">
                    <span className={`admin-badge ${getStatusColor(loan.status)}`}>
                      {loan.status}
                    </span>
                  </td>
                  <td className="admin-table td">
                    {loan.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApproveLoan(loan.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <CheckIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleRejectLoan(loan.id)}
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

export default LoanManagement;
