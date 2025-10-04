const hre = require("hardhat");
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function main() {
  console.log("🌾 AgriFinance Complete Setup & Deployment");
  console.log("==========================================\n");

  // Step 1: Check environment
  console.log("1️⃣ Checking environment setup...");
  
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    console.log("📝 Creating .env file...");
    const envContent = `# AgriFinance Environment Configuration
# Add your private key here (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Optional: Alchemy API key for better RPC
ALCHEMY_API_KEY=your_alchemy_key_here
`;
    fs.writeFileSync(envPath, envContent);
    console.log("✅ .env file created!");
    console.log("⚠️  Please add your private key to .env file and run this script again");
    console.log("🔑 Get private key from MetaMask: Account Details > Export Private Key");
    return;
  }

  // Load environment variables
  require('dotenv').config();
  
  if (!process.env.PRIVATE_KEY || process.env.PRIVATE_KEY === 'your_private_key_here') {
    console.log("❌ Please add your private key to .env file");
    console.log("📝 Open .env file and replace 'your_private_key_here' with your actual private key");
    console.log("🔑 Get private key from MetaMask: Account Details > Export Private Key");
    return;
  }

  console.log("✅ Environment configured");

  // Step 2: Check Amoy connection
  console.log("\n2️⃣ Checking Amoy testnet connection...");
  
  try {
    const provider = new hre.ethers.JsonRpcProvider("https://rpc-amoy.polygon.technology/");
    const network = await provider.getNetwork();
    console.log(`✅ Connected to Amoy testnet (Chain ID: ${network.chainId})`);
  } catch (error) {
    console.log("❌ Failed to connect to Amoy testnet");
    console.log("🌐 Please check your internet connection");
    return;
  }

  // Step 3: Compile contracts
  console.log("\n3️⃣ Compiling contracts...");
  try {
    execSync('npx hardhat compile', { stdio: 'inherit' });
    console.log("✅ Contracts compiled successfully");
  } catch (error) {
    console.log("❌ Contract compilation failed");
    return;
  }

  // Step 4: Deploy contracts
  console.log("\n4️⃣ Deploying contracts to Amoy testnet...");
  console.log("⏳ This may take a few minutes...\n");

  try {
    // Deploy KrishiToken
    console.log("   Deploying KrishiToken...");
    const KrishiToken = await hre.ethers.getContractFactory("KrishiToken");
    const krishiToken = await KrishiToken.deploy();
    await krishiToken.waitForDeployment();
    const krishiTokenAddress = await krishiToken.getAddress();
    console.log(`   ✅ KrishiToken: ${krishiTokenAddress}`);

    // Deploy LoanContract
    console.log("   Deploying LoanContract...");
    const LoanContract = await hre.ethers.getContractFactory("LoanContract");
    const loanContract = await LoanContract.deploy(krishiTokenAddress);
    await loanContract.waitForDeployment();
    const loanContractAddress = await loanContract.getAddress();
    console.log(`   ✅ LoanContract: ${loanContractAddress}`);

    // Deploy SupplyChain
    console.log("   Deploying SupplyChain...");
    const SupplyChain = await hre.ethers.getContractFactory("SupplyChain");
    const supplyChain = await SupplyChain.deploy();
    await supplyChain.waitForDeployment();
    const supplyChainAddress = await supplyChain.getAddress();
    console.log(`   ✅ SupplyChain: ${supplyChainAddress}`);

    // Deploy NFTLand
    console.log("   Deploying NFTLand...");
    const NFTLand = await hre.ethers.getContractFactory("NFTLand");
    const nftLand = await NFTLand.deploy();
    await nftLand.waitForDeployment();
    const nftLandAddress = await nftLand.getAddress();
    console.log(`   ✅ NFTLand: ${nftLandAddress}`);

    // Save deployment info
    const deploymentInfo = {
      network: "amoy",
      timestamp: new Date().toISOString(),
      contracts: {
        KrishiToken: krishiTokenAddress,
        LoanContract: loanContractAddress,
        SupplyChain: supplyChainAddress,
        NFTLand: nftLandAddress
      }
    };

    const deploymentPath = path.join(__dirname, '..', 'deployments', 'amoy.json');
    const deploymentsDir = path.dirname(deploymentPath);
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));

    console.log("\n✅ All contracts deployed successfully!");

    // Step 5: Update frontend
    console.log("\n5️⃣ Updating frontend configuration...");
    
    const web3ContextPath = path.join(__dirname, '..', 'frontend', 'src', 'context', 'Web3Context.jsx');
    
    if (fs.existsSync(web3ContextPath)) {
      let web3ContextContent = fs.readFileSync(web3ContextPath, 'utf8');
      
      // Replace contract addresses
      web3ContextContent = web3ContextContent.replace(
        /krishiToken: "0x\.\.\."/g,
        `krishiToken: "${krishiTokenAddress}"`
      );
      web3ContextContent = web3ContextContent.replace(
        /loanContract: "0x\.\.\."/g,
        `loanContract: "${loanContractAddress}"`
      );
      web3ContextContent = web3ContextContent.replace(
        /supplyChain: "0x\.\.\."/g,
        `supplyChain: "${supplyChainAddress}"`
      );
      web3ContextContent = web3ContextContent.replace(
        /nftLand: "0x\.\.\."/g,
        `nftLand: "${nftLandAddress}"`
      );

      fs.writeFileSync(web3ContextPath, web3ContextContent);
      console.log("✅ Frontend updated with contract addresses");
    }

    // Create contract addresses file
    const contractAddressesPath = path.join(__dirname, '..', 'CONTRACT_ADDRESSES.md');
    const contractAddressesContent = `# 📄 AgriFinance Contract Addresses

## 🌐 Mumbai Testnet Deployment

**Deployment Date**: ${deploymentInfo.timestamp}
**Network**: ${deploymentInfo.network}

## 📋 Contract Addresses

| Contract | Address | Explorer |
|----------|---------|----------|
| **KrishiToken** | \`${krishiTokenAddress}\` | [View on PolygonScan](https://mumbai.polygonscan.com/address/${krishiTokenAddress}) |
| **LoanContract** | \`${loanContractAddress}\` | [View on PolygonScan](https://mumbai.polygonscan.com/address/${loanContractAddress}) |
| **SupplyChain** | \`${supplyChainAddress}\` | [View on PolygonScan](https://mumbai.polygonscan.com/address/${supplyChainAddress}) |
| **NFTLand** | \`${nftLandAddress}\` | [View on PolygonScan](https://mumbai.polygonscan.com/address/${nftLandAddress}) |

## 🧪 Next Steps

1. **Get Mumbai MATIC**: https://faucet.polygon.technology/
2. **Add Mumbai Network** to MetaMask:
   - Network Name: Mumbai Testnet
   - RPC URL: https://rpc-mumbai.maticvigil.com
   - Chain ID: 80001
   - Currency: MATIC
   - Explorer: https://mumbai.polygonscan.com
3. **Start Frontend**: \`cd frontend && npm run dev\`
4. **Test Features**: Token Faucet, QR Scanner, etc.

---

*Generated automatically by AgriFinance deployment script*
`;

    fs.writeFileSync(contractAddressesPath, contractAddressesContent);
    console.log("✅ Contract addresses saved to CONTRACT_ADDRESSES.md");

    // Final summary
    console.log("\n🎉 AgriFinance Setup Complete!");
    console.log("==============================");
    console.log(`KrishiToken: ${krishiTokenAddress}`);
    console.log(`LoanContract: ${loanContractAddress}`);
    console.log(`SupplyChain: ${supplyChainAddress}`);
    console.log(`NFTLand: ${nftLandAddress}`);

    console.log("\n🔧 Next Steps:");
    console.log("1. Get Amoy MATIC: https://faucet.polygon.technology/");
    console.log("2. Add Amoy network to MetaMask");
    console.log("3. Start frontend: cd frontend && npm run dev");
    console.log("4. Test your application!");

    console.log("\n🌐 Amoy Network Details:");
    console.log("Network Name: Polygon Amoy Testnet");
    console.log("RPC URL: https://rpc-amoy.polygon.technology/");
    console.log("Chain ID: 80002");
    console.log("Currency: MATIC");
    console.log("Explorer: https://amoy.polygonscan.com");

  } catch (error) {
    console.log("\n❌ Deployment failed!");
    console.log("Error:", error.message);
    
    if (error.message.includes("insufficient funds")) {
      console.log("\n💰 Solution: Get Amoy MATIC from faucet");
      console.log("Visit: https://faucet.polygon.technology/");
      console.log("Select Amoy network and request MATIC tokens");
    } else if (error.message.includes("network")) {
      console.log("\n🌐 Solution: Check internet connection");
      console.log("Amoy testnet might be temporarily unavailable");
    } else {
      console.log("\n🔍 Check the error message above for details");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
