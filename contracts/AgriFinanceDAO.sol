// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title AgriFinanceDAO
 * @dev Decentralized Autonomous Organization for AgriFinance platform
 * @notice Enables community governance for agricultural finance decisions
 */
contract AgriFinanceDAO is ERC20, Ownable, ReentrancyGuard {
    
    // ============ STRUCTS ============
    
    struct Proposal {
        uint256 id;
        string title;
        string description;
        address proposer;
        uint256 startTime;
        uint256 endTime;
        uint256 forVotes;
        uint256 againstVotes;
        bool executed;
        ProposalType proposalType;
        mapping(address => bool) hasVoted;
        mapping(address => uint256) votesCast;
    }
    
    struct UserProfile {
        uint256 farmingActivity;      // Crop production score
        uint256 platformParticipation; // Transaction count
        uint256 governanceParticipation; // Voting participation
        bool isVerifiedFarmer;
        string region;
        string[] cropsGrown;
    }
    
    // ============ ENUMS ============
    
    enum ProposalType {
        PLATFORM_POLICY,    // Platform rules and policies
        CROP_PRICING,       // Crop price adjustments
        LOAN_TERMS,         // Interest rates and terms
        FEATURE_REQUEST,    // New platform features
        FUND_ALLOCATION,    // Community fund distribution
        EMERGENCY_ACTION    // Emergency platform actions
    }
    
    enum ProposalStatus {
        PENDING,
        ACTIVE,
        EXECUTED,
        REJECTED,
        EXPIRED
    }
    
    // ============ STATE VARIABLES ============
    
    mapping(uint256 => Proposal) public proposals;
    mapping(address => UserProfile) public userProfiles;
    mapping(address => uint256) public lastVoteTime;
    
    uint256 public proposalCount;
    uint256 public totalSupply;
    
    // Voting thresholds
    uint256 public constant PLATFORM_POLICY_THRESHOLD = 60;
    uint256 public constant CROP_PRICING_THRESHOLD = 70;
    uint256 public constant LOAN_TERMS_THRESHOLD = 75;
    uint256 public constant EMERGENCY_THRESHOLD = 80;
    
    // Quorum requirements
    uint256 public constant PLATFORM_POLICY_QUORUM = 30;
    uint256 public constant CROP_PRICING_QUORUM = 40;
    uint256 public constant LOAN_TERMS_QUORUM = 50;
    uint256 public constant EMERGENCY_QUORUM = 60;
    
    // Voting periods
    uint256 public constant STANDARD_VOTING_PERIOD = 7 days;
    uint256 public constant URGENT_VOTING_PERIOD = 3 days;
    uint256 public constant EMERGENCY_VOTING_PERIOD = 1 days;
    
    // ============ EVENTS ============
    
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string title,
        ProposalType proposalType
    );
    
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        bool support,
        uint256 votes
    );
    
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalRejected(uint256 indexed proposalId);
    
    event UserProfileUpdated(
        address indexed user,
        uint256 farmingActivity,
        uint256 platformParticipation
    );
    
    // ============ CONSTRUCTOR ============
    
    constructor() ERC20("AgriFinance Governance Token", "AFG") {
        // Initial supply will be distributed through farming and platform participation
        _mint(msg.sender, 1000000 * 10**18); // 1M tokens for initial distribution
    }
    
    // ============ MODIFIERS ============
    
    modifier onlyActiveProposal(uint256 proposalId) {
        require(proposalId < proposalCount, "Proposal does not exist");
        Proposal storage proposal = proposals[proposalId];
        require(
            block.timestamp >= proposal.startTime && 
            block.timestamp <= proposal.endTime,
            "Proposal not active"
        );
        require(!proposal.executed, "Proposal already executed");
        _;
    }
    
    modifier onlyVerifiedFarmer() {
        require(userProfiles[msg.sender].isVerifiedFarmer, "Not a verified farmer");
        _;
    }
    
    // ============ GOVERNANCE FUNCTIONS ============
    
    /**
     * @dev Create a new governance proposal
     * @param title Short title of the proposal
     * @param description Detailed description of the proposal
     * @param proposalType Type of proposal (affects voting requirements)
     */
    function createProposal(
        string memory title,
        string memory description,
        ProposalType proposalType
    ) external onlyVerifiedFarmer returns (uint256) {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        
        uint256 proposalId = proposalCount;
        Proposal storage proposal = proposals[proposalId];
        
        proposal.id = proposalId;
        proposal.title = title;
        proposal.description = description;
        proposal.proposer = msg.sender;
        proposal.proposalType = proposalType;
        proposal.startTime = block.timestamp;
        
        // Set voting period based on proposal type
        if (proposalType == ProposalType.EMERGENCY_ACTION) {
            proposal.endTime = block.timestamp + EMERGENCY_VOTING_PERIOD;
        } else if (proposalType == ProposalType.LOAN_TERMS) {
            proposal.endTime = block.timestamp + URGENT_VOTING_PERIOD;
        } else {
            proposal.endTime = block.timestamp + STANDARD_VOTING_PERIOD;
        }
        
        proposalCount++;
        
        emit ProposalCreated(proposalId, msg.sender, title, proposalType);
        
        return proposalId;
    }
    
    /**
     * @dev Vote on a proposal
     * @param proposalId ID of the proposal to vote on
     * @param support true for support, false for opposition
     */
    function vote(uint256 proposalId, bool support) 
        external 
        onlyActiveProposal(proposalId) 
        nonReentrant 
    {
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.hasVoted[msg.sender], "Already voted");
        
        uint256 votingPower = calculateVotingPower(msg.sender);
        require(votingPower > 0, "No voting power");
        
        proposal.hasVoted[msg.sender] = true;
        proposal.votesCast[msg.sender] = votingPower;
        
        if (support) {
            proposal.forVotes += votingPower;
        } else {
            proposal.againstVotes += votingPower;
        }
        
        lastVoteTime[msg.sender] = block.timestamp;
        
        emit VoteCast(proposalId, msg.sender, support, votingPower);
    }
    
    /**
     * @dev Execute a proposal if it meets the requirements
     * @param proposalId ID of the proposal to execute
     */
    function executeProposal(uint256 proposalId) external {
        require(proposalId < proposalCount, "Proposal does not exist");
        Proposal storage proposal = proposals[proposalId];
        
        require(block.timestamp > proposal.endTime, "Voting period not ended");
        require(!proposal.executed, "Proposal already executed");
        
        uint256 totalVotes = proposal.forVotes + proposal.againstVotes;
        uint256 threshold = getThreshold(proposal.proposalType);
        uint256 quorum = getQuorum(proposal.proposalType);
        
        // Check quorum
        require(totalVotes >= (totalSupply * quorum / 100), "Quorum not met");
        
        // Check threshold
        if (proposal.forVotes >= (totalVotes * threshold / 100)) {
            proposal.executed = true;
            emit ProposalExecuted(proposalId);
            
            // Execute proposal logic based on type
            _executeProposalLogic(proposalId, proposal.proposalType);
        } else {
            emit ProposalRejected(proposalId);
        }
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Calculate voting power for a user
     * @param user Address of the user
     * @return Voting power as a number
     */
    function calculateVotingPower(address user) public view returns (uint256) {
        uint256 power = 0;
        
        // Base power from token holdings
        power += balanceOf(user);
        
        // Farming activity bonus
        power += userProfiles[user].farmingActivity * 10**16; // 0.01 tokens per activity point
        
        // Platform participation bonus
        power += userProfiles[user].platformParticipation * 10**15; // 0.001 tokens per transaction
        
        // Governance participation bonus
        power += userProfiles[user].governanceParticipation * 10**17; // 0.1 tokens per vote
        
        return power;
    }
    
    /**
     * @dev Get proposal status
     * @param proposalId ID of the proposal
     * @return Status of the proposal
     */
    function getProposalStatus(uint256 proposalId) external view returns (ProposalStatus) {
        require(proposalId < proposalCount, "Proposal does not exist");
        Proposal storage proposal = proposals[proposalId];
        
        if (proposal.executed) return ProposalStatus.EXECUTED;
        if (block.timestamp < proposal.startTime) return ProposalStatus.PENDING;
        if (block.timestamp > proposal.endTime) return ProposalStatus.EXPIRED;
        return ProposalStatus.ACTIVE;
    }
    
    /**
     * @dev Get voting requirements for a proposal type
     * @param proposalType Type of proposal
     * @return threshold Required percentage for approval
     * @return quorum Required percentage for quorum
     */
    function getVotingRequirements(ProposalType proposalType) 
        external 
        pure 
        returns (uint256 threshold, uint256 quorum) 
    {
        if (proposalType == ProposalType.PLATFORM_POLICY) {
            return (PLATFORM_POLICY_THRESHOLD, PLATFORM_POLICY_QUORUM);
        } else if (proposalType == ProposalType.CROP_PRICING) {
            return (CROP_PRICING_THRESHOLD, CROP_PRICING_QUORUM);
        } else if (proposalType == ProposalType.LOAN_TERMS) {
            return (LOAN_TERMS_THRESHOLD, LOAN_TERMS_QUORUM);
        } else if (proposalType == ProposalType.EMERGENCY_ACTION) {
            return (EMERGENCY_THRESHOLD, EMERGENCY_QUORUM);
        } else {
            return (PLATFORM_POLICY_THRESHOLD, PLATFORM_POLICY_QUORUM);
        }
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    function getThreshold(ProposalType proposalType) internal pure returns (uint256) {
        if (proposalType == ProposalType.PLATFORM_POLICY) return PLATFORM_POLICY_THRESHOLD;
        if (proposalType == ProposalType.CROP_PRICING) return CROP_PRICING_THRESHOLD;
        if (proposalType == ProposalType.LOAN_TERMS) return LOAN_TERMS_THRESHOLD;
        if (proposalType == ProposalType.EMERGENCY_ACTION) return EMERGENCY_THRESHOLD;
        return PLATFORM_POLICY_THRESHOLD;
    }
    
    function getQuorum(ProposalType proposalType) internal pure returns (uint256) {
        if (proposalType == ProposalType.PLATFORM_POLICY) return PLATFORM_POLICY_QUORUM;
        if (proposalType == ProposalType.CROP_PRICING) return CROP_PRICING_QUORUM;
        if (proposalType == ProposalType.LOAN_TERMS) return LOAN_TERMS_QUORUM;
        if (proposalType == ProposalType.EMERGENCY_ACTION) return EMERGENCY_QUORUM;
        return PLATFORM_POLICY_QUORUM;
    }
    
    function _executeProposalLogic(uint256 proposalId, ProposalType proposalType) internal {
        // This function would contain the actual execution logic
        // For now, it's a placeholder for different proposal types
        
        if (proposalType == ProposalType.PLATFORM_POLICY) {
            // Execute platform policy changes
        } else if (proposalType == ProposalType.CROP_PRICING) {
            // Execute crop pricing changes
        } else if (proposalType == ProposalType.LOAN_TERMS) {
            // Execute loan terms changes
        } else if (proposalType == ProposalType.FEATURE_REQUEST) {
            // Execute feature implementation
        } else if (proposalType == ProposalType.FUND_ALLOCATION) {
            // Execute fund distribution
        } else if (proposalType == ProposalType.EMERGENCY_ACTION) {
            // Execute emergency actions
        }
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Update user profile (called by platform)
     * @param user Address of the user
     * @param farmingActivity Farming activity score
     * @param platformParticipation Platform participation score
     * @param isVerifiedFarmer Whether user is verified farmer
     * @param region User's region
     * @param cropsGrown Array of crops grown by user
     */
    function updateUserProfile(
        address user,
        uint256 farmingActivity,
        uint256 platformParticipation,
        bool isVerifiedFarmer,
        string memory region,
        string[] memory cropsGrown
    ) external onlyOwner {
        userProfiles[user].farmingActivity = farmingActivity;
        userProfiles[user].platformParticipation = platformParticipation;
        userProfiles[user].isVerifiedFarmer = isVerifiedFarmer;
        userProfiles[user].region = region;
        userProfiles[user].cropsGrown = cropsGrown;
        
        emit UserProfileUpdated(user, farmingActivity, platformParticipation);
    }
    
    /**
     * @dev Distribute governance tokens to users
     * @param recipients Array of recipient addresses
     * @param amounts Array of token amounts to distribute
     */
    function distributeTokens(address[] memory recipients, uint256[] memory amounts) 
        external 
        onlyOwner 
    {
        require(recipients.length == amounts.length, "Arrays length mismatch");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            _mint(recipients[i], amounts[i]);
        }
    }
}
