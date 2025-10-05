// admin-frontend/src/lib/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class AdminApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('adminToken') || localStorage.getItem('auth_token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('adminToken', token);
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('auth_token');
    }
  }

  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = { headers: this.getHeaders(), ...options };
    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${response.status}`);
      }
      return await response.json();
    } catch (e) {
      throw e;
    }
  }

  // Auth methods
  async signIn(email, password) {
    const result = await this.request('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    if (result.token) {
      this.setToken(result.token);
    }
    
    return result;
  }

  async signOut() {
    this.setToken(null);
    return { success: true };
  }

  async getCurrentUser() {
    try {
      return await this.request('/auth/me');
    } catch (error) {
      return { user: null, error };
    }
  }

  // NFT methods
  async getNFTs() {
    return this.request('/nfts');
  }

  async setNFTPrice({ nft_id, token_id, price_wei }) {
    return this.request('/nft/set-price', {
      method: 'POST',
      body: JSON.stringify({ nft_id, token_id, price_wei })
    });
  }

  // Approval methods
  async getPendingApprovals() {
    return this.request('/admin/approvals/pending');
  }

  async approveRequest(approvalId, adminNotes = '') {
    return this.request(`/admin/approvals/${approvalId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ admin_notes: adminNotes })
    });
  }

  async rejectRequest(approvalId, adminNotes = '') {
    return this.request(`/admin/approvals/${approvalId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ admin_notes: adminNotes })
    });
  }

  async createNFT({ name, description, image_url, price_krsi }) {
    return this.request('/nfts', {
      method: 'POST',
      body: JSON.stringify({ name, description, image_url, price_krsi })
    });
  }

  async syncWallet({ address, balance_wei = '0', wallet_type = 'agrifinance', metadata }) {
    return this.request('/wallet/sync', {
      method: 'POST',
      body: JSON.stringify({ address, balance_wei, wallet_type, metadata })
    });
  }

  // User management
  async getUsers() {
    return this.request('/admin/users');
  }

  async getUserById(userId) {
    return this.request(`/admin/users/${userId}`);
  }
}

const adminApi = new AdminApiClient();
export default adminApi;

