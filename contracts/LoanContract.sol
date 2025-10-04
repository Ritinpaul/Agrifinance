// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./KrishiToken.sol";

contract LoanContract is ReentrancyGuard, Ownable {
    struct Loan {
        uint256 id;
        address borrower;
        uint256 amount;
        uint256 interestRate;
        uint256 duration;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        bool isRepaid;
        uint256 creditScore;
        string purpose;
    }

    struct Lender {
        address lenderAddress;
        uint256 totalLent;
        uint256 totalEarned;
        bool isActive;
    }

    mapping(uint256 => Loan) public loans;
    mapping(address => Lender) public lenders;
    mapping(address => uint256[]) public borrowerLoans;
    mapping(address => uint256[]) public lenderLoans;

    uint256 public nextLoanId = 1;
    uint256 public totalLent = 0;
    uint256 public totalEarned = 0;
    uint256 public constant MIN_CREDIT_SCORE = 600;
    uint256 public constant MAX_LOAN_AMOUNT = 10000 * 10**18; // 10,000 tokens
    uint256 public constant MIN_LOAN_AMOUNT = 100 * 10**18; // 100 tokens

    KrishiToken public krishiToken;

    event LoanCreated(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 amount,
        uint256 interestRate,
        uint256 duration
    );

    event LoanFunded(
        uint256 indexed loanId,
        address indexed lender,
        uint256 amount
    );

    event LoanRepaid(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 amount
    );

    event LenderRegistered(address indexed lender);

    constructor(address _krishiToken) Ownable(msg.sender) {
        krishiToken = KrishiToken(_krishiToken);
    }

    function registerLender() external {
        require(!lenders[msg.sender].isActive, "Lender already registered");
        
        lenders[msg.sender] = Lender({
            lenderAddress: msg.sender,
            totalLent: 0,
            totalEarned: 0,
            isActive: true
        });

        emit LenderRegistered(msg.sender);
    }

    function createLoan(
        uint256 _amount,
        uint256 _interestRate,
        uint256 _duration,
        uint256 _creditScore,
        string memory _purpose
    ) external returns (uint256) {
        require(_amount >= MIN_LOAN_AMOUNT && _amount <= MAX_LOAN_AMOUNT, "Invalid loan amount");
        require(_creditScore >= MIN_CREDIT_SCORE, "Credit score too low");
        require(_duration > 0, "Invalid duration");
        require(_interestRate > 0 && _interestRate <= 50, "Invalid interest rate"); // Max 50%

        uint256 loanId = nextLoanId++;
        
        loans[loanId] = Loan({
            id: loanId,
            borrower: msg.sender,
            amount: _amount,
            interestRate: _interestRate,
            duration: _duration,
            startTime: block.timestamp,
            endTime: block.timestamp + _duration,
            isActive: false,
            isRepaid: false,
            creditScore: _creditScore,
            purpose: _purpose
        });

        borrowerLoans[msg.sender].push(loanId);

        emit LoanCreated(loanId, msg.sender, _amount, _interestRate, _duration);
        
        return loanId;
    }

    function fundLoan(uint256 _loanId) external nonReentrant {
        require(lenders[msg.sender].isActive, "Not a registered lender");
        
        Loan storage loan = loans[_loanId];
        require(loan.borrower != address(0), "Loan does not exist");
        require(!loan.isActive, "Loan already funded");
        require(block.timestamp <= loan.endTime, "Loan expired");

        uint256 fundingAmount = loan.amount;
        require(krishiToken.balanceOf(msg.sender) >= fundingAmount, "Insufficient token balance");
        require(krishiToken.allowance(msg.sender, address(this)) >= fundingAmount, "Insufficient allowance");

        // Transfer tokens from lender to contract
        krishiToken.transferFrom(msg.sender, address(this), fundingAmount);

        // Update loan status
        loan.isActive = true;

        // Update lender stats
        lenders[msg.sender].totalLent += fundingAmount;
        lenderLoans[msg.sender].push(_loanId);
        totalLent += fundingAmount;

        emit LoanFunded(_loanId, msg.sender, fundingAmount);
    }

    function repayLoan(uint256 _loanId) external nonReentrant {
        Loan storage loan = loans[_loanId];
        require(loan.borrower == msg.sender, "Not the borrower");
        require(loan.isActive, "Loan not active");
        require(!loan.isRepaid, "Loan already repaid");

        uint256 totalRepayment = calculateRepayment(_loanId);
        require(krishiToken.balanceOf(msg.sender) >= totalRepayment, "Insufficient balance for repayment");
        require(krishiToken.allowance(msg.sender, address(this)) >= totalRepayment, "Insufficient allowance");

        // Transfer repayment from borrower to contract
        krishiToken.transferFrom(msg.sender, address(this), totalRepayment);

        // Mark loan as repaid
        loan.isRepaid = true;
        loan.isActive = false;

        // Calculate interest earned
        uint256 interestEarned = totalRepayment - loan.amount;
        totalEarned += interestEarned;

        emit LoanRepaid(_loanId, msg.sender, totalRepayment);
    }

    function calculateRepayment(uint256 _loanId) public view returns (uint256) {
        Loan memory loan = loans[_loanId];
        if (!loan.isActive) return 0;

        uint256 interest = (loan.amount * loan.interestRate * loan.duration) / (365 days * 100);
        return loan.amount + interest;
    }

    function getBorrowerLoans(address _borrower) external view returns (uint256[] memory) {
        return borrowerLoans[_borrower];
    }

    function getLenderLoans(address _lender) external view returns (uint256[] memory) {
        return lenderLoans[_lender];
    }

    function getLoanDetails(uint256 _loanId) external view returns (Loan memory) {
        return loans[_loanId];
    }

    function withdrawEarnings() external {
        require(lenders[msg.sender].isActive, "Not a registered lender");
        
        uint256 earnings = lenders[msg.sender].totalEarned;
        require(earnings > 0, "No earnings to withdraw");
        require(krishiToken.balanceOf(address(this)) >= earnings, "Insufficient contract balance");

        lenders[msg.sender].totalEarned = 0;
        krishiToken.transfer(msg.sender, earnings);
    }
}
