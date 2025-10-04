const hre = require("hardhat");

async function main() {
  console.log("🌐 Setting up Polygon Mumbai Testnet for AgriFinance...");
  
  // Mumbai testnet configuration
  const mumbaiConfig = {
    chainId: 80001,
    chainName: "Polygon Mumbai Testnet",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
    rpcUrls: [
      "https://rpc-mumbai.maticvigil.com",
      "https://polygon-mumbai.g.alchemy.com/v2/demo",
      "https://rpc.ankr.com/polygon_mumbai"
    ],
    blockExplorerUrls: ["https://mumbai.polygonscan.com"],
  };

  console.log("\n📋 Mumbai Testnet Configuration:");
  console.log("Chain ID:", mumbaiConfig.chainId);
  console.log("Chain Name:", mumbaiConfig.chainName);
  console.log("Currency:", mumbaiConfig.nativeCurrency.symbol);
  console.log("RPC URL:", mumbaiConfig.rpcUrls[0]);
  console.log("Explorer:", mumbaiConfig.blockExplorerUrls[0]);

  console.log("\n🔗 Getting Mumbai MATIC:");
  console.log("1. Visit: https://faucet.polygon.technology/");
  console.log("2. Select 'Mumbai' network");
  console.log("3. Enter your wallet address");
  console.log("4. Request MATIC tokens");
  console.log("5. You'll receive test MATIC for gas fees");

  console.log("\n📱 MetaMask Setup:");
  console.log("1. Open MetaMask");
  console.log("2. Click 'Add Network'");
  console.log("3. Add Mumbai testnet with these details:");
  console.log("   - Network Name: Mumbai Testnet");
  console.log("   - RPC URL: https://rpc-mumbai.maticvigil.com");
  console.log("   - Chain ID: 80001");
  console.log("   - Currency Symbol: MATIC");
  console.log("   - Block Explorer: https://mumbai.polygonscan.com");

  console.log("\n🚀 Ready to Deploy!");
  console.log("Run: npx hardhat run scripts/deploy.js --network mumbai");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
