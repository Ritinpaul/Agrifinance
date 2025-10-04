# 🌾 AgriFinance Admin Panel

A comprehensive administrative interface for managing the AgriFinance blockchain platform.

## 🚀 Features

### 📊 **Dashboard**
- Real-time platform statistics
- User growth metrics
- Financial analytics
- Recent activity monitoring
- Risk assessment alerts

### 👥 **User Management**
- View all registered users (farmers, lenders, buyers)
- Approve/reject user verifications
- Manage credit scores
- Monitor user activity and reputation
- Account suspension capabilities

### 🧾 **NFT Management**
- Review land NFT applications
- Verify land ownership documents
- Approve/reject NFT minting requests
- Monitor NFT marketplace activity

### 💰 **Loan Management**
- Monitor loan applications
- Approve/reject loan requests
- Track active loans and defaults
- Risk assessment and analytics
- Portfolio management

### 🚛 **Supply Chain Management**
- Verify agricultural product batches
- Review certifications and quality standards
- Monitor supply chain integrity
- Track product traceability

### ⚙️ **System Settings**
- Configure platform fees
- Adjust loan parameters
- Manage profit distribution
- System health monitoring

## 🛠️ Technology Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Icons**: Heroicons
- **Charts**: Recharts
- **Routing**: React Router
- **HTTP Client**: Axios
- **Blockchain**: Ethers.js

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- AgriFinance Backend running on port 5000

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Start development server:**
```bash
npm run dev
```

3. **Access admin panel:**
- URL: http://localhost:5175
- Demo credentials:
  - Email: admin@agrifinance.com
  - Password: admin123

## 📁 Project Structure

```
admin-frontend/
├── src/
│   ├── components/
│   │   └── AdminLayout.jsx      # Main layout component
│   ├── pages/
│   │   ├── Login.jsx            # Admin login page
│   │   ├── Dashboard.jsx        # Main dashboard
│   │   ├── UserManagement.jsx   # User management
│   │   ├── NFTManagement.jsx    # NFT management
│   │   ├── LoanManagement.jsx  # Loan management
│   │   ├── SupplyChainManagement.jsx # Supply chain
│   │   └── SystemSettings.jsx  # System settings
│   ├── services/               # API services
│   ├── utils/                  # Utility functions
│   ├── App.jsx                 # Main app component
│   └── index.css               # Global styles
├── package.json
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind configuration
└── README.md
```

## 🔐 Authentication

The admin panel uses a secure authentication system:

- **Mock Authentication**: Currently uses demo credentials
- **JWT Tokens**: Stores authentication tokens in localStorage
- **Role-based Access**: Different admin permission levels
- **Session Management**: Automatic logout on token expiry

### Demo Credentials
- **Email**: admin@agrifinance.com
- **Password**: admin123

## 📊 Dashboard Features

### Statistics Cards
- **Total Users**: Platform user count
- **Active Loans**: Currently active loans
- **Total NFTs**: Minted land NFTs
- **Pending Verifications**: Items awaiting approval
- **Platform Revenue**: Total platform earnings
- **Risk Alerts**: High-risk activities

### Recent Activity Feed
- Real-time activity updates
- User registration events
- Loan application submissions
- NFT verification requests
- Batch verification submissions

## 👥 User Management

### User Types
- **Farmers**: Agricultural producers
- **Lenders**: DeFi liquidity providers
- **Buyers**: Agricultural product purchasers

### Management Actions
- **Verify Users**: Approve user registrations
- **Credit Score Override**: Manually adjust credit scores
- **Account Suspension**: Temporarily disable accounts
- **User Analytics**: View detailed user statistics

### Filters
- All users
- Pending verification
- Verified users
- By user type (farmer/lender/buyer)

## 🧾 NFT Management

### Land NFT Verification
- Review land ownership documents
- Verify location and area data
- Check soil type and crop history
- Approve/reject NFT minting

### NFT Analytics
- Total NFTs minted
- Verification status tracking
- Geographic distribution
- Credit score impact analysis

## 💰 Loan Management

### Loan Monitoring
- Track loan applications
- Monitor approval/rejection rates
- Analyze credit score distributions
- Risk assessment tracking

### Loan Actions
- Approve/reject loan applications
- Monitor active loan performance
- Track repayment schedules
- Default management

## 🚛 Supply Chain Management

### Batch Verification
- Review product certifications
- Verify farmer credentials
- Check quality standards
- Approve/reject batches

### Traceability
- Track product journey
- Monitor supply chain integrity
- Quality assurance management
- Certification validation

## ⚙️ System Settings

### Platform Configuration
- **Platform Fee**: Adjust platform commission
- **Verification Fee**: Set verification costs
- **Minting Fee**: Configure NFT minting costs
- **Loan Parameters**: Set loan limits and requirements

### Profit Distribution
- **Farmer Profit**: Percentage to farmers
- **Platform Profit**: Platform commission
- **Fee Structure**: Transaction fees

### System Status
- Platform health monitoring
- Smart contract status
- AI service status
- Database connectivity

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_ADMIN_TOKEN_KEY=adminToken
```

## 🚀 Deployment

### Production Build

```bash
npm run build
```

### Deployment Options

1. **Static Hosting**: Deploy to Netlify, Vercel, or GitHub Pages
2. **Server Deployment**: Deploy to your own server
3. **Docker**: Containerize the application

### Security Considerations

- Use HTTPS in production
- Implement proper JWT authentication
- Add rate limiting
- Enable CORS properly
- Use environment variables for sensitive data

## 🔒 Security Features

- **Authentication Required**: All routes protected
- **Role-based Access**: Admin-only features
- **Secure Storage**: Encrypted token storage
- **Session Management**: Automatic logout
- **Input Validation**: Form validation and sanitization

## 📱 Responsive Design

The admin panel is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile devices
- Different screen sizes

## 🎨 UI/UX Features

- **Modern Design**: Clean, professional interface
- **Dark/Light Mode**: Theme switching capability
- **Accessibility**: WCAG compliant
- **Loading States**: User feedback during operations
- **Error Handling**: Comprehensive error management
- **Notifications**: Success/error message system

## 🔄 API Integration

The admin panel integrates with the AgriFinance backend API:

- **Base URL**: http://localhost:5000/api/admin
- **Authentication**: Bearer token in headers
- **Endpoints**: RESTful API design
- **Error Handling**: Comprehensive error management

## 📈 Future Enhancements

- **Real-time Updates**: WebSocket integration
- **Advanced Analytics**: More detailed reporting
- **Audit Logging**: Complete action tracking
- **Multi-language Support**: Internationalization
- **Advanced Permissions**: Granular role management
- **Mobile App**: Native mobile application

## 🆘 Troubleshooting

### Common Issues

1. **Login Problems**
   - Check credentials: admin@agrifinance.com / admin123
   - Clear browser cache and localStorage
   - Ensure backend is running

2. **API Connection Issues**
   - Verify backend is running on port 5000
   - Check CORS configuration
   - Verify API endpoints

3. **Build Issues**
   - Clear node_modules and reinstall
   - Check Node.js version (18+)
   - Verify all dependencies

## 📞 Support

For support and questions:
- **Documentation**: Check this README
- **Issues**: Report on GitHub
- **Email**: admin@agrifinance.com

---

**AgriFinance Admin Panel** - Secure, efficient, and user-friendly platform management.