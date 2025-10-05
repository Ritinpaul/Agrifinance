import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { gaslessClient } from '../utils/gasless';

const Web3Context = createContext();

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export const Web3Provider = ({ children }) => {
  console.log('🌐 Web3Provider initializing...');
  
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [contracts, setContracts] = useState({
    krishiToken: null,
    loanContract: null,
    supplyChain: null,
    nftLand: null
  });

  // Contract addresses (these would be loaded from deployment)
  const contractAddresses = {
    krishiToken: "0x5FbDB2315678afecb367f032d93F642f64180aa3", // Will be updated after deployment
    loanContract: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512", // Will be updated after deployment
    supplyChain: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0", // Will be updated after deployment
    nftLand: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9" // Will be updated after deployment
  };

  // Contract ABIs (simplified for demo)
  const contractABIs = {
    krishiToken: [
      "function balanceOf(address owner) view returns (uint256)",
      "function faucetDistribute(address recipient, uint256 amount) external",
      "function transfer(address to, uint256 amount) external returns (bool)",
      "function approve(address spender, uint256 amount) external returns (bool)",
      "function allowance(address owner, address spender) view returns (uint256)",
      // Staking-related
      "function stake(uint256 amount, uint256 lockPeriod) external",
      "function unstake(uint256 stakeIndex) external",
      "function claimRewards() external",
      "function calculateStakingReward(address user, uint256 stakeIndex) view returns (uint256)"
    ],
    nftLand: [
      "function ownerOf(uint256 tokenId) view returns (address)",
      "function transferFrom(address from, address to, uint256 tokenId) external",
      "function approve(address to, uint256 tokenId) external",
      "function getApproved(uint256 tokenId) view returns (address)",
      "function mint(address to, uint256 tokenId, string memory tokenURI) external",
      "function setTokenPrice(uint256 tokenId, uint256 price) external",
      "function buyToken(uint256 tokenId) external payable",
      "function tokenPrice(uint256 tokenId) view returns (uint256)",
      "function isForSale(uint256 tokenId) view returns (bool)"
    ],
    supplyChain: [
      "function verifyBatchByQR(string memory qrCodeHash) external view returns (uint256)",
      "function getBatchDetails(uint256 batchId) external view returns (tuple(uint256 id, address farmer, string productType, uint256 quantity, uint256 pricePerUnit, uint256 totalValue, string location, uint256 harvestDate, string certification, bool isVerified, bool isSold, address buyer, uint256 saleTimestamp, string qrCodeHash))",
      "function getBatchTraceability(uint256 batchId) external view returns (address farmer, string productType, string location, uint256 harvestDate, string certification, bool isVerified, address buyer, uint256 saleTimestamp)"
    ]
  };

  // Initialize contracts
  const initializeContracts = async (signer) => {
    try {
      const newContracts = {};
      
      // Initialize KrishiToken contract
      if (contractAddresses.krishiToken !== "0x...") {
        newContracts.krishiToken = new ethers.Contract(
          contractAddresses.krishiToken,
          contractABIs.krishiToken,
          signer
        );
      }

      // Initialize SupplyChain contract
      if (contractAddresses.supplyChain !== "0x...") {
        newContracts.supplyChain = new ethers.Contract(
          contractAddresses.supplyChain,
          contractABIs.supplyChain,
          signer
        );
      }

      // Initialize NFTLand contract
      if (contractAddresses.nftLand !== "0x...") {
        newContracts.nftLand = new ethers.Contract(
          contractAddresses.nftLand,
          contractABIs.nftLand,
          signer
        );
      }

      setContracts(newContracts);
    } catch (error) {
      console.error("Error initializing contracts:", error);
    }
  };

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  };

  // Connect to MetaMask
  const connectWallet = async () => {
    if (!isMetaMaskInstalled()) {
      setError('MetaMask is not installed. Please install MetaMask to continue.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const account = accounts[0];
      setAccount(account);

      // Create provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();

      setProvider(provider);
      setSigner(signer);
      setChainId(network.chainId.toString());
      setIsConnected(true);

      // Initialize contracts
      await initializeContracts(signer);

      // Listen for account changes
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setIsConnected(false);
    setError(null);

    // Remove event listeners
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    }
  };

  // Send transaction with gasless fallback
  const sendTransaction = async (txRequest) => {
    // Try gasless first if not connected or paymaster is configured
    try {
      if (!isConnected && gaslessClient.isConfigured()) {
        return await gaslessClient.sendTransaction(txRequest);
      }
    } catch (e) {
      console.warn('Gasless failed, falling back:', e?.message || e);
    }

    if (!signer) throw new Error('No signer available');
    const tx = await signer.sendTransaction(txRequest);
    return await tx.wait();
  };

  // Staking helpers
  const stakeTokens = async (amountWei, lockPeriodSeconds) => {
    if (!contracts.krishiToken) throw new Error('Token contract not ready');
    // Ensure allowance is sufficient if staking requires transferFrom in actual contract; current ABI transfers to contract internally
    const tx = await contracts.krishiToken.stake(amountWei, lockPeriodSeconds);
    return await tx.wait();
  };

  const unstakeTokens = async (stakeIndex) => {
    if (!contracts.krishiToken) throw new Error('Token contract not ready');
    const tx = await contracts.krishiToken.unstake(stakeIndex);
    return await tx.wait();
  };

  const claimStakingRewards = async () => {
    if (!contracts.krishiToken) throw new Error('Token contract not ready');
    const tx = await contracts.krishiToken.claimRewards();
    return await tx.wait();
  };

  // NFT Marketplace helpers
  const buyNFT = async (tokenId, price) => {
    if (!contracts.nftLand) throw new Error('NFT contract not ready');
    const tx = await contracts.nftLand.buyToken(tokenId, { value: price });
    return await tx.wait();
  };

  const transferNFT = async (to, tokenId) => {
    if (!contracts.nftLand) throw new Error('NFT contract not ready');
    const tx = await contracts.nftLand.transferFrom(account, to, tokenId);
    return await tx.wait();
  };

  const setNFTPrice = async (tokenId, price) => {
    if (!contracts.nftLand) throw new Error('NFT contract not ready');
    const tx = await contracts.nftLand.setTokenPrice(tokenId, price);
    return await tx.wait();
  };

  // Handle account changes
  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      setAccount(accounts[0]);
    }
  };

  // Handle chain changes
  const handleChainChanged = (chainId) => {
    setChainId(chainId);
    // Optionally reload the page or update contracts
    window.location.reload();
  };

  // Check connection status on mount
  useEffect(() => {
    const checkConnection = async () => {
      // Only run in browser environment
      if (typeof window === 'undefined') return;
      
      if (isMetaMaskInstalled() && window.ethereum.selectedAddress) {
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts',
          });

          if (accounts.length > 0) {
            const account = accounts[0];
            setAccount(account);

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const network = await provider.getNetwork();

            setProvider(provider);
            setSigner(signer);
            setChainId(network.chainId.toString());
            setIsConnected(true);

            // Initialize contracts
            await initializeContracts(signer);

            // Set up event listeners
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('chainChanged', handleChainChanged);
          }
        } catch (err) {
          console.error('Error checking connection:', err);
          setError(err.message);
        }
      }
    };

    checkConnection();
  }, []);

  // Switch to Amoy testnet
  const switchToAmoy = async () => {
    if (!isMetaMaskInstalled()) {
      setError('MetaMask is not installed');
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x13882' }], // Amoy testnet chain ID
      });
    } catch (switchError) {
      // If Amoy is not added, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x13882',
                chainName: 'Polygon Amoy Testnet',
                nativeCurrency: {
                  name: 'MATIC',
                  symbol: 'MATIC',
                  decimals: 18,
                },
                rpcUrls: ['https://rpc-amoy.polygon.technology/'],
                blockExplorerUrls: ['https://amoy.polygonscan.com'],
              },
            ],
          });
        } catch (addError) {
          console.error('Error adding Amoy network:', addError);
          setError('Failed to add Amoy network');
        }
      } else {
        console.error('Error switching to Amoy:', switchError);
        setError('Failed to switch to Amoy network');
      }
    }
  };

  const value = {
    account,
    provider,
    signer,
    chainId,
    isConnected,
    isLoading,
    error: error ? error.message || String(error) : null,
    contracts,
    krishiTokenContract: contracts.krishiToken,
    nftLandContract: contracts.nftLand,
    supplyChainContract: contracts.supplyChain,
    connectWallet,
    disconnectWallet,
    switchToAmoy,
    isMetaMaskInstalled,
    sendTransaction,
    stakeTokens,
    unstakeTokens,
    claimStakingRewards,
    buyNFT,
    transferNFT,
    setNFTPrice,
  };

  console.log('🌐 Web3Provider rendering with value:', { account, isConnected, isLoading, error });
  
  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};
