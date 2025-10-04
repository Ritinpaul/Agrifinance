const fs = require('fs');
const path = require('path');

async function updateFrontendContracts() {
  console.log("🔧 Updating frontend with deployed contract addresses...");

  try {
    // Read deployment info
    const deploymentPath = path.join(__dirname, '..', 'deployments', 'mumbai.json');
    
    if (!fs.existsSync(deploymentPath)) {
      console.log("❌ No deployment found. Please run deployment first.");
      return;
    }

    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    const contracts = deploymentInfo.contracts;

    console.log("📄 Found deployment info:");
    console.log(`   KrishiToken: ${contracts.KrishiToken}`);
    console.log(`   LoanContract: ${contracts.LoanContract}`);
    console.log(`   SupplyChain: ${contracts.SupplyChain}`);
    console.log(`   NFTLand: ${contracts.NFTLand}`);

    // Update Web3Context.jsx
    const web3ContextPath = path.join(__dirname, '..', 'frontend', 'src', 'context', 'Web3Context.jsx');
    
    if (fs.existsSync(web3ContextPath)) {
      let web3ContextContent = fs.readFileSync(web3ContextPath, 'utf8');
      
      // Replace contract addresses
      web3ContextContent = web3ContextContent.replace(
        /krishiToken: "0x\.\.\."/g,
        `krishiToken: "${contracts.KrishiToken}"`
      );
      web3ContextContent = web3ContextContent.replace(
        /loanContract: "0x\.\.\."/g,
        `loanContract: "${contracts.LoanContract}"`
      );
      web3ContextContent = web3ContextContent.replace(
        /supplyChain: "0x\.\.\."/g,
        `supplyChain: "${contracts.SupplyChain}"`
      );
      web3ContextContent = web3ContextContent.replace(
        /nftLand: "0x\.\.\."/g,
        `nftLand: "${contracts.NFTLand}"`
      );

      fs.writeFileSync(web3ContextPath, web3ContextContent);
      console.log("✅ Updated Web3Context.jsx with contract addresses");
    } else {
      console.log("⚠️  Web3Context.jsx not found, skipping update");
    }

    // Create contract addresses file for easy reference
    const contractAddressesPath = path.join(__dirname, '..', 'CONTRACT_ADDRESSES.md');
    const contractAddressesContent = `# 📄 AgriFinance Contract Addresses

## 🌐 Mumbai Testnet Deployment

**Deployment Date**: ${deploymentInfo.timestamp}
**Network**: ${deploymentInfo.network}

## 📋 Contract Addresses

| Contract | Address | Explorer |
|----------|---------|----------|
| **KrishiToken** | \`${contracts.KrishiToken}\` | [View on PolygonScan](https://mumbai.polygonscan.com/address/${contracts.KrishiToken}) |
| **LoanContract** | \`${contracts.LoanContract}\` | [View on PolygonScan](https://mumbai.polygonscan.com/address/${contracts.LoanContract}) |
| **SupplyChain** | \`${contracts.SupplyChain}\` | [View on PolygonScan](https://mumbai.polygonscan.com/address/${contracts.SupplyChain}) |
| **NFTLand** | \`${contracts.NFTLand}\` | [View on PolygonScan](https://mumbai.polygonscan.com/address/${contracts.NFTLand}) |

## 🔧 Frontend Configuration

Update your frontend with these addresses in \`Web3Context.jsx\`:

\`\`\`javascript
const contractAddresses = {
  krishiToken: "${contracts.KrishiToken}",
  loanContract: "${contracts.LoanContract}",
  supplyChain: "${contracts.SupplyChain}",
  nftLand: "${contracts.NFTLand}"
};
\`\`\`

## 🧪 Testing

1. **Get Mumbai MATIC**: https://faucet.polygon.technology/
2. **Add Mumbai Network** to MetaMask
3. **Start Frontend**: \`cd frontend && npm run dev\`
4. **Test Features**: Token Faucet, QR Scanner, etc.

---

*Generated automatically by AgriFinance deployment script*
`;

    fs.writeFileSync(contractAddressesPath, contractAddressesContent);
    console.log("✅ Created CONTRACT_ADDRESSES.md for reference");

    console.log("\n🎉 Frontend updated successfully!");
    console.log("📝 Contract addresses saved to CONTRACT_ADDRESSES.md");
    console.log("🚀 Ready to test your application!");

  } catch (error) {
    console.log("❌ Error updating frontend:", error.message);
  }
}

updateFrontendContracts();
