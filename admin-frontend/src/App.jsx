import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import AdminLayout from './components/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import NFTManagement from './pages/NFTManagement';
import LoanManagement from './pages/LoanManagement';
import SupplyChainManagement from './pages/SupplyChainManagement';
import SystemSettings from './pages/SystemSettings';
import './index.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    // Check if admin is already logged in
    const token = localStorage.getItem('adminToken');
    const user = localStorage.getItem('adminUser');

    if (token && user) {
      setIsAuthenticated(true);
      setAdminUser(JSON.parse(user));
    }
  }, []);

  const handleLogin = (user, token) => {
    setIsAuthenticated(true);
    setAdminUser(user);
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAdminUser(null);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  };

  if (!isAuthenticated) {
    return (
      <ThemeProvider>
        <Login onLogin={handleLogin} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <Router>
        <AdminLayout adminUser={adminUser} onLogout={handleLogout}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/nfts" element={<NFTManagement />} />
            <Route path="/loans" element={<LoanManagement />} />
            <Route path="/supply-chain" element={<SupplyChainManagement />} />
            <Route path="/settings" element={<SystemSettings />} />
          </Routes>
        </AdminLayout>
      </Router>
    </ThemeProvider>
  );
}

export default App;