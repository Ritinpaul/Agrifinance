const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🌾 AgriFinance Setup & Deployment Script");
  console.log("=====================================\n");

  // Check if .env exists
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
    console.log("⚠️  Please add your private key to .env file before continuing\n");
    return;
  }

  // Check if private key is set
  require('dotenv').config();
  if (!process.env.PRIVATE_KEY || process.env.PRIVATE_KEY === 'your_private_key_here') {
    console.log("❌ Please add your private key to .env file");
    console.log("📝 Open .env file and replace 'your_private_key_here' with your actual private key");
    console.log("🔑 Get private key from MetaMask: Account Details > Export Private Key");
    return;
  }

  console.log("🔍 Checking Mumbai testnet connection...");
  
  try {
    // Test connection to Mumbai
    const provider = new hre.ethers.JsonRpcProvider("https://rpc-mumbai.maticvigil.com");
    const network = await provider.getNetwork();
    console.log(`✅ Connected to Mumbai testnet (Chain ID: ${network.chainId})`);
  } catch (error) {
    console.log("❌ Failed to connect to Mumbai testnet");
    console.log("🌐 Please check your internet connection");
    return;
  }

  console.log("\n🚀 Starting deployment to Mumbai testnet...");
  console.log("⏳ This may take a few minutes...\n");

  try {
    // Deploy KrishiToken
    console.log("1️⃣ Deploying KrishiToken...");
    const KrishiToken = await hre.ethers.getContractFactory("KrishiToken");
    const krishiToken = await KrishiToken.deploy();
    await krishiToken.waitForDeployment();
    const krishiTokenAddress = await krishiToken.getAddress();
    console.log(`   ✅ KrishiToken deployed to: ${krishiTokenAddress}`);

    // Deploy LoanContract
    console.log("2️⃣ Deploying LoanContract...");
    const LoanContract = await hre.ethers.getContractFactory("LoanContract");
    const loanContract = await LoanContract.deploy(krishiTokenAddress);
    await loanContract.waitForDeployment();
    const loanContractAddress = await loanContract.getAddress();
    console.log(`   ✅ LoanContract deployed to: ${loanContractAddress}`);

    // Deploy SupplyChain
    console.log("3️⃣ Deploying SupplyChain...");
    const SupplyChain = await hre.ethers.getContractFactory("SupplyChain");
    const supplyChain = await SupplyChain.deploy();
    await supplyChain.waitForDeployment();
    const supplyChainAddress = await supplyChain.getAddress();
    console.log(`   ✅ SupplyChain deployed to: ${supplyChainAddress}`);

    // Deploy NFTLand
    console.log("4️⃣ Deploying NFTLand...");
    const NFTLand = await hre.ethers.getContractFactory("NFTLand");
    const nftLand = await NFTLand.deploy();
    await nftLand.waitForDeployment();
    const nftLandAddress = await nftLand.getAddress();
    console.log(`   ✅ NFTLand deployed to: ${nftLandAddress}`);

    // Save deployment info
    const deploymentInfo = {
      network: "mumbai",
      timestamp: new Date().toISOString(),
      contracts: {
        KrishiToken: krishiTokenAddress,
        LoanContract: loanContractAddress,
        SupplyChain: supplyChainAddress,
        NFTLand: nftLandAddress
      }
    };

    const deploymentPath = path.join(__dirname, '..', 'deployments', 'mumbai.json');
    const deploymentsDir = path.dirname(deploymentPath);
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));

    console.log("\n🎉 Deployment Successful!");
    console.log("==========================");
    console.log(`KrishiToken: ${krishiTokenAddress}`);
    console.log(`LoanContract: ${loanContractAddress}`);
    console.log(`SupplyChain: ${supplyChainAddress}`);
    console.log(`NFTLand: ${nftLandAddress}`);
    console.log(`\n📄 Deployment info saved to: ${deploymentPath}`);

    console.log("\n🔧 Next Steps:");
    console.log("1. Update frontend/src/context/Web3Context.jsx with these addresses");
    console.log("2. Get Mumbai MATIC from: https://faucet.polygon.technology/");
    console.log("3. Add Mumbai network to MetaMask");
    console.log("4. Test your application!");

    console.log("\n🌐 Mumbai Network Details:");
    console.log("Network Name: Mumbai Testnet");
    console.log("RPC URL: https://rpc-mumbai.maticvigil.com");
    console.log("Chain ID: 80001");
    console.log("Currency: MATIC");
    console.log("Explorer: https://mumbai.polygonscan.com");

  } catch (error) {
    console.log("\n❌ Deployment failed!");
    console.log("Error:", error.message);
    
    if (error.message.includes("insufficient funds")) {
      console.log("\n💰 Solution: Get Mumbai MATIC from faucet");
      console.log("Visit: https://faucet.polygon.technology/");
      console.log("Select Mumbai network and request MATIC tokens");
    } else if (error.message.includes("network")) {
      console.log("\n🌐 Solution: Check internet connection");
      console.log("Mumbai testnet might be temporarily unavailable");
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
