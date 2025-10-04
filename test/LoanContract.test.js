const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LoanContract", function () {
  let loanContract;
  let token;
  let owner;
  let farmer;
  let lender;
  let addrs;

  beforeEach(async function () {
    [owner, farmer, lender, ...addrs] = await ethers.getSigners();

    // Deploy mock ERC20 token
    const Token = await ethers.getContractFactory("MockERC20");
    token = await Token.deploy("AgriToken", "AGT", ethers.parseEther("1000000"));
    await token.waitForDeployment();

    // Deploy LoanContract
    const LoanContract = await ethers.getContractFactory("LoanContract");
    loanContract = await LoanContract.deploy(await token.getAddress());
    await loanContract.waitForDeployment();

    // Transfer tokens to farmer and lender
    await token.transfer(farmer.address, ethers.parseEther("10000"));
    await token.transfer(lender.address, ethers.parseEther("10000"));
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await loanContract.owner()).to.equal(owner.address);
    });

    it("Should set the right token address", async function () {
      expect(await loanContract.token()).to.equal(await token.getAddress());
    });
  });

  describe("Lender Registration", function () {
    it("Should allow lender registration", async function () {
      await loanContract.connect(lender).registerLender();
      
      const lenderInfo = await loanContract.lenders(lender.address);
      expect(lenderInfo.isActive).to.be.true;
      expect(lenderInfo.lenderAddress).to.equal(lender.address);
    });

    it("Should prevent duplicate lender registration", async function () {
      await loanContract.connect(lender).registerLender();
      
      await expect(
        loanContract.connect(lender).registerLender()
      ).to.be.revertedWith("Lender already registered");
    });
  });

  describe("Loan Creation", function () {
    beforeEach(async function () {
      await loanContract.connect(lender).registerLender();
    });

    it("Should create a loan successfully", async function () {
      const amount = ethers.parseEther("1000");
      const interestRate = 10;
      const duration = 90;
      const creditScore = 700;
      const purpose = "Seeds Purchase";

      await expect(
        loanContract.connect(farmer).createLoan(
          amount,
          interestRate,
          duration,
          creditScore,
          purpose
        )
      ).to.emit(loanContract, "LoanCreated")
        .withArgs(1, farmer.address, amount, interestRate, duration);

      const loan = await loanContract.loans(1);
      expect(loan.borrower).to.equal(farmer.address);
      expect(loan.amount).to.equal(amount);
      expect(loan.interestRate).to.equal(interestRate);
      expect(loan.duration).to.equal(duration);
      expect(loan.creditScore).to.equal(creditScore);
      expect(loan.purpose).to.equal(purpose);
    });

    it("Should reject loan with low credit score", async function () {
      const amount = ethers.parseEther("1000");
      const interestRate = 10;
      const duration = 90;
      const creditScore = 500; // Below minimum
      const purpose = "Seeds Purchase";

      await expect(
        loanContract.connect(farmer).createLoan(
          amount,
          interestRate,
          duration,
          creditScore,
          purpose
        )
      ).to.be.revertedWith("Credit score too low");
    });

    it("Should reject loan with invalid amount", async function () {
      const amount = ethers.parseEther("50"); // Below minimum
      const interestRate = 10;
      const duration = 90;
      const creditScore = 700;
      const purpose = "Seeds Purchase";

      await expect(
        loanContract.connect(farmer).createLoan(
          amount,
          interestRate,
          duration,
          creditScore,
          purpose
        )
      ).to.be.revertedWith("Invalid loan amount");
    });
  });

  describe("Loan Funding", function () {
    beforeEach(async function () {
      await loanContract.connect(lender).registerLender();
      
      const amount = ethers.parseEther("1000");
      const interestRate = 10;
      const duration = 90;
      const creditScore = 700;
      const purpose = "Seeds Purchase";

      await loanContract.connect(farmer).createLoan(
        amount,
        interestRate,
        duration,
        creditScore,
        purpose
      );
    });

    it("Should allow lender to fund loan", async function () {
      const loanId = 1;
      const amount = ethers.parseEther("1000");

      // Approve tokens
      await token.connect(lender).approve(await loanContract.getAddress(), amount);

      await expect(
        loanContract.connect(lender).fundLoan(loanId)
      ).to.emit(loanContract, "LoanFunded")
        .withArgs(loanId, lender.address, amount);

      const loan = await loanContract.loans(loanId);
      expect(loan.isActive).to.be.true;
    });

    it("Should reject funding with insufficient balance", async function () {
      const loanId = 1;
      const amount = ethers.parseEther("1000");

      // Transfer all tokens away
      await token.connect(lender).transfer(owner.address, ethers.parseEther("10000"));

      await expect(
        loanContract.connect(lender).fundLoan(loanId)
      ).to.be.revertedWith("Insufficient token balance");
    });
  });

  describe("Loan Repayment", function () {
    beforeEach(async function () {
      await loanContract.connect(lender).registerLender();
      
      const amount = ethers.parseEther("1000");
      const interestRate = 10;
      const duration = 90;
      const creditScore = 700;
      const purpose = "Seeds Purchase";

      await loanContract.connect(farmer).createLoan(
        amount,
        interestRate,
        duration,
        creditScore,
        purpose
      );

      // Fund the loan
      await token.connect(lender).approve(await loanContract.getAddress(), amount);
      await loanContract.connect(lender).fundLoan(1);
    });

    it("Should allow borrower to repay loan", async function () {
      const loanId = 1;
      const repaymentAmount = await loanContract.calculateRepayment(loanId);

      // Approve repayment
      await token.connect(farmer).approve(await loanContract.getAddress(), repaymentAmount);

      await expect(
        loanContract.connect(farmer).repayLoan(loanId)
      ).to.emit(loanContract, "LoanRepaid")
        .withArgs(loanId, farmer.address, repaymentAmount);

      const loan = await loanContract.loans(loanId);
      expect(loan.isRepaid).to.be.true;
      expect(loan.isActive).to.be.false;
    });
  });

  describe("Repayment Calculation", function () {
    it("Should calculate repayment correctly", async function () {
      const amount = ethers.parseEther("1000");
      const interestRate = 10; // 10%
      const duration = 90; // 90 days

      await loanContract.connect(lender).registerLender();
      
      await loanContract.connect(farmer).createLoan(
        amount,
        interestRate,
        duration,
        700,
        "Test Purpose"
      );

      // Fund the loan to make it active
      await token.connect(lender).approve(loanContract.target, amount);
      await loanContract.connect(lender).fundLoan(1);

      const repaymentAmount = await loanContract.calculateRepayment(1);
      
      // Check that repayment includes interest (should be greater than principal)
      expect(repaymentAmount).to.be.greaterThan(amount);
      
      // Check that it's reasonable (should be less than 2x the principal for 10% annual rate)
      expect(repaymentAmount).to.be.lessThan(amount * BigInt(2));
    });
  });
});
