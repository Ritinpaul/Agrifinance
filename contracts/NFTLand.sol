// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTLand is ERC721, ERC721URIStorage, Ownable {
    struct LandInfo {
        uint256 tokenId;
        address owner;
        string location;
        uint256 area; // in square meters
        string soilType;
        string cropHistory;
        uint256 registrationDate;
        bool isVerified;
        string documentHash; // IPFS hash for land documents
        uint256 creditScore;
    }

    struct FarmerProfile {
        address farmerAddress;
        string name;
        uint256[] ownedLands;
        uint256 totalArea;
        uint256 reputation;
        uint256 totalYield;
        uint256 successfulHarvests;
        uint256 creditScore;
        bool isVerified;
    }

    uint256 private _tokenIdCounter;
    
    mapping(uint256 => LandInfo) public landInfo;
    mapping(address => FarmerProfile) public farmerProfiles;
    mapping(address => bool) public verifiedFarmers;
    mapping(string => bool) public usedDocumentHashes;

    uint256 public constant VERIFICATION_FEE = 50; // 50 tokens for land verification
    uint256 public constant MINTING_FEE = 10; // 10 tokens for minting

    event LandMinted(uint256 indexed tokenId, address indexed owner, string location, uint256 area);
    event LandVerified(uint256 indexed tokenId, address indexed verifier);
    event FarmerVerified(address indexed farmer, string name);
    event LandTransferred(uint256 indexed tokenId, address indexed from, address indexed to);

    constructor() ERC721("AgriLand NFT", "ALNFT") Ownable(msg.sender) {}

    function mintLand(
        string memory _location,
        uint256 _area,
        string memory _soilType,
        string memory _cropHistory,
        string memory _documentHash,
        string memory _tokenURI
    ) external payable returns (uint256) {
        require(msg.value >= MINTING_FEE, "Insufficient minting fee");
        require(bytes(_location).length > 0, "Location required");
        require(_area > 0, "Invalid area");
        require(!usedDocumentHashes[_documentHash], "Document already used");

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, _tokenURI);

        landInfo[tokenId] = LandInfo({
            tokenId: tokenId,
            owner: msg.sender,
            location: _location,
            area: _area,
            soilType: _soilType,
            cropHistory: _cropHistory,
            registrationDate: block.timestamp,
            isVerified: false,
            documentHash: _documentHash,
            creditScore: 0
        });

        usedDocumentHashes[_documentHash] = true;

        // Update farmer profile
        _updateFarmerProfile(msg.sender, tokenId, _area);

        emit LandMinted(tokenId, msg.sender, _location, _area);
        
        return tokenId;
    }

    function verifyLand(uint256 _tokenId) external onlyOwner {
        require(landInfo[_tokenId].owner != address(0), "Token does not exist");
        require(!landInfo[_tokenId].isVerified, "Land already verified");

        landInfo[_tokenId].isVerified = true;
        
        // Increase farmer reputation for verified land
        address farmer = landInfo[_tokenId].owner;
        farmerProfiles[farmer].reputation += 20;
        farmerProfiles[farmer].creditScore += 50;

        emit LandVerified(_tokenId, msg.sender);
    }

    function verifyFarmer(address _farmer, string memory _name) external onlyOwner {
        require(!verifiedFarmers[_farmer], "Farmer already verified");
        
        verifiedFarmers[_farmer] = true;
        farmerProfiles[_farmer].name = _name;
        farmerProfiles[_farmer].isVerified = true;
        farmerProfiles[_farmer].reputation += 30;

        emit FarmerVerified(_farmer, _name);
    }

    function updateCropHistory(uint256 _tokenId, string memory _newCropHistory) external {
        require(landInfo[_tokenId].owner != address(0), "Token does not exist");
        require(ownerOf(_tokenId) == msg.sender, "Not the owner");
        
        landInfo[_tokenId].cropHistory = _newCropHistory;
        
        // Update farmer stats
        farmerProfiles[msg.sender].successfulHarvests++;
        farmerProfiles[msg.sender].reputation += 5;
    }

    function updateYield(uint256 _tokenId, uint256 _yield) external {
        require(landInfo[_tokenId].owner != address(0), "Token does not exist");
        require(ownerOf(_tokenId) == msg.sender, "Not the owner");
        require(_yield > 0, "Invalid yield");
        
        farmerProfiles[msg.sender].totalYield += _yield;
        farmerProfiles[msg.sender].reputation += 10;
        
        // Update credit score based on yield
        farmerProfiles[msg.sender].creditScore += (_yield / 100); // 1 point per 100 units of yield
    }

    function _updateFarmerProfile(address _farmer, uint256 _tokenId, uint256 _area) internal {
        farmerProfiles[_farmer].farmerAddress = _farmer;
        farmerProfiles[_farmer].ownedLands.push(_tokenId);
        farmerProfiles[_farmer].totalArea += _area;
        
        if (farmerProfiles[_farmer].reputation == 0) {
            farmerProfiles[_farmer].reputation = 50; // Starting reputation
        }
    }

    function getLandDetails(uint256 _tokenId) external view returns (LandInfo memory) {
        require(landInfo[_tokenId].owner != address(0), "Token does not exist");
        return landInfo[_tokenId];
    }

    function getFarmerProfile(address _farmer) external view returns (FarmerProfile memory) {
        return farmerProfiles[_farmer];
    }

    function getFarmerLands(address _farmer) external view returns (uint256[] memory) {
        return farmerProfiles[_farmer].ownedLands;
    }

    function calculateCreditScore(address _farmer) external view returns (uint256) {
        FarmerProfile memory profile = farmerProfiles[_farmer];
        
        uint256 baseScore = 300; // Base credit score
        uint256 reputationBonus = profile.reputation;
        uint256 yieldBonus = profile.totalYield / 1000; // 1 point per 1000 units
        uint256 harvestBonus = profile.successfulHarvests * 10;
        uint256 verificationBonus = verifiedFarmers[_farmer] ? 100 : 0;
        
        uint256 totalScore = baseScore + reputationBonus + yieldBonus + harvestBonus + verificationBonus;
        
        // Cap at 850
        return totalScore > 850 ? 850 : totalScore;
    }

    function transferLand(uint256 _tokenId, address _to) external {
        require(landInfo[_tokenId].owner != address(0), "Token does not exist");
        require(ownerOf(_tokenId) == msg.sender, "Not the owner");
        
        address from = msg.sender;
        
        // Update farmer profiles
        _removeFromFarmerProfile(from, _tokenId);
        _updateFarmerProfile(_to, _tokenId, landInfo[_tokenId].area);
        
        // Update land info
        landInfo[_tokenId].owner = _to;
        
        // Transfer NFT
        _transfer(from, _to, _tokenId);
        
        emit LandTransferred(_tokenId, from, _to);
    }

    function _removeFromFarmerProfile(address _farmer, uint256 _tokenId) internal {
        uint256[] storage lands = farmerProfiles[_farmer].ownedLands;
        for (uint256 i = 0; i < lands.length; i++) {
            if (lands[i] == _tokenId) {
                lands[i] = lands[lands.length - 1];
                lands.pop();
                break;
            }
        }
        farmerProfiles[_farmer].totalArea -= landInfo[_tokenId].area;
    }

    function getTotalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }

    function getLandCountByFarmer(address _farmer) external view returns (uint256) {
        return farmerProfiles[_farmer].ownedLands.length;
    }

    // Override required functions
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
