const { expect } = require("chai");
// const { ethers } = require("hardhat");
const { hre } = require("hardhat");
const { parseEther } = require("viem");

describe("LendX Lending Contract (Viem Test)", function () {
    let lendX, deployer, borrower;
    let collateralToken;
    const depositAmount = parseEther("10");

    before(async function () {
        // Set up Hardhat accounts
        [deployer, borrower] = await ethers.getSigners();

        // Deploy Mock ERC20 Token
        const ERC20Mock = await hre.ethers.getContractFactory("ERC20Mock");
        collateralToken = await ERC20Mock.deploy("Collateral Token", "COL", deployer.address, parseEther("1000"));
        await collateralToken.deployed();

        // Deploy Lending Contract
        const LendX = await hre.ethers.getContractFactory("LendX");
        lendX = await LendX.deploy();
        await lendX.deployed();
    });

    it("Should allow users to deposit collateral", async function () {
        await collateralToken.connect(deployer).transfer(borrower.address, depositAmount);
        await collateralToken.connect(borrower).approve(lendX.address, depositAmount);

        const tx = await lendX.connect(borrower).depositCollateral(collateralToken.address, depositAmount);
        expect(tx).to.exist;
    });

    it("Should allow users to borrow against collateral", async function () {
        const borrowAmount = parseEther("5");

        const tx = await lendX.connect(borrower).borrow(borrowAmount);
        expect(tx).to.exist;
    });

    it("Should allow users to repay loans", async function () {
        const tx = await lendX.connect(borrower).repayLoan();
        expect(tx).to.exist;
    });

    it("Should allow liquidation of undercollateralized loans", async function () {
        const tx = await lendX.connect(deployer).liquidate(borrower.address);
        expect(tx).to.exist;
    });
});
