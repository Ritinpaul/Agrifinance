const hre = require("hardhat");

async function main() {
  console.log("Deploying AgriFinance contracts...");

  // Deploy KrishiToken
  console.log("Deploying KrishiToken...");
  const KrishiToken = await hre.ethers.getContractFactory("KrishiToken");
  const krishiToken = await KrishiToken.deploy();
  await krishiToken.waitForDeployment();
  console.log("KrishiToken deployed to:", await krishiToken.getAddress());

  // Deploy LoanContract
  console.log("Deploying LoanContract...");
  const LoanContract = await hre.ethers.getContractFactory("LoanContract");
  const loanContract = await LoanContract.deploy(await krishiToken.getAddress());
  await loanContract.waitForDeployment();
  console.log("LoanContract deployed to:", await loanContract.getAddress());

  // Deploy SupplyChain
  console.log("Deploying SupplyChain...");
  const SupplyChain = await hre.ethers.getContractFactory("SupplyChain");
  const supplyChain = await SupplyChain.deploy();
  await supplyChain.waitForDeployment();
  console.log("SupplyChain deployed to:", await supplyChain.getAddress());

  // Deploy NFTLand
  console.log("Deploying NFTLand...");
  const NFTLand = await hre.ethers.getContractFactory("NFTLand");
  const nftLand = await NFTLand.deploy();
  await nftLand.waitForDeployment();
  console.log("NFTLand deployed to:", await nftLand.getAddress());

  console.log("\n=== Deployment Summary ===");
  console.log("KrishiToken:", await krishiToken.getAddress());
  console.log("LoanContract:", await loanContract.getAddress());
  console.log("SupplyChain:", await supplyChain.getAddress());
  console.log("NFTLand:", await nftLand.getAddress());

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    timestamp: new Date().toISOString(),
    contracts: {
      KrishiToken: await krishiToken.getAddress(),
      LoanContract: await loanContract.getAddress(),
      SupplyChain: await supplyChain.getAddress(),
      NFTLand: await nftLand.getAddress()
    }
  };

  const fs = require('fs');
  const path = require('path');
  const deploymentPath = path.join(__dirname, '..', 'deployments', `${hre.network.name}.json`);
  
  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.dirname(deploymentPath);
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\nDeployment info saved to: ${deploymentPath}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
