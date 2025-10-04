# AgriFinance - Blockchain-Powered Agricultural Supply Chain & DeFi Platform

A comprehensive blockchain-based platform that empowers farmers with zero-collateral loans, transparent supply chains, AI-based credit scoring, and NFT land ownership verification.

## 🌟 Features

### Core Functionality
- **User Authentication**: Secure signup/signin with Supabase Auth
- **Role-Based Access**: Farmers, Lenders, Buyers, and Admin dashboards
- **Profile Management**: Complete user profiles with role-specific fields
- **NFT Land Management**: Mint, buy, and manage agricultural land NFTs
- **Supply Chain Tracking**: Transparent product tracking from farm to buyer
- **Loan Management**: Apply for and manage agricultural loans
- **Credit Scoring**: AI-based credit assessment system
- **Wallet Integration**: In-app wallet with MetaMask connectivity
- **Staking System**: Stake tokens for rewards
- **Admin Dashboard**: Comprehensive admin panel for platform management

### Blockchain Integration
- **Smart Contracts**: Deployed on Polygon Amoy testnet
- **KrishiToken**: Custom ERC20 token for platform transactions
- **NFT Land Contract**: ERC721 NFTs representing agricultural land
- **Loan Contract**: Decentralized lending system
- **Supply Chain Contract**: Blockchain-based product tracking

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd agrifinance
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Configure Supabase credentials in `frontend/src/lib/supabase.js`
   - Update contract addresses in deployment files

4. **Start development servers**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Admin Panel: http://localhost:5176

## 📁 Project Structure

```
agrifinance/
├── frontend/                 # Main React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React contexts (Auth, Web3, Theme)
│   │   ├── utils/          # Utility functions
│   │   └── lib/           # External library configurations
│   └── package.json
├── admin-frontend/          # Admin dashboard
├── contracts/              # Smart contracts
├── scripts/               # Deployment and setup scripts
├── test/                  # Test files
└── package.json           # Root package.json
```

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Supabase** - Authentication and database
- **Web3.js** - Blockchain interaction

### Backend
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Database
- **Row Level Security** - Data protection

### Blockchain
- **Solidity** - Smart contract language
- **Hardhat** - Development framework
- **Polygon Amoy** - Test network
- **MetaMask** - Wallet integration

## 🔧 Configuration

### Supabase Setup
1. Create a Supabase project
2. Update credentials in `frontend/src/lib/supabase.js`
3. Run database migrations

### Smart Contract Deployment
1. Configure network settings in `hardhat.config.js`
2. Deploy contracts: `npx hardhat run scripts/deploy.js --network amoy`
3. Update contract addresses in frontend

## 📱 User Roles

### Farmer
- Apply for loans
- Manage agricultural land NFTs
- Track supply chain
- Update farm details

### Lender
- Review loan applications
- Set lending terms
- Manage loan portfolio
- Assess credit scores

### Buyer
- Purchase agricultural products
- Track supply chain
- Verify product authenticity
- Manage purchase history

### Admin
- Manage all users
- Approve NFT transactions
- System configuration
- Platform analytics

## 🔐 Security Features

- **Row Level Security** - Database-level access control
- **JWT Authentication** - Secure session management
- **Input Validation** - Comprehensive form validation
- **SQL Injection Protection** - Parameterized queries
- **XSS Protection** - Content sanitization

## 🚀 Deployment

### Frontend Deployment
- Build: `npm run build`
- Deploy to Vercel/Netlify

### Smart Contract Deployment
- Deploy to mainnet: `npx hardhat run scripts/deploy.js --network polygon`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team

---

**Built with ❤️ for the agricultural community**