import { parseEther, } from "viem";
import { expect } from "chai";
import hre from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { createPublicClient, http } from 'viem'
import { sepolia } from 'viem/chains'

// const publicClient = createPublicClient({
//   chain: sepolia,
//   transport: http('https://sepolia.infura.io/v3/265a03ca1b474030839b5bf8d140f4a6')
// })

describe("LendX Lending Contract (Viem Test)", function () {
  async function deployLendingFixture() {
    // Get wallet clients provided by the Hardhat Viem integration.
    const [deployer, borrower] = await hre.viem.getWalletClients();

    // Deploy the MockPriceOracle contract.
    const mockPriceOracle = await hre.viem.deployContract("MockPriceOracle", []);

    // Deploy the ERC20Mock contract with an initial supply.
    const collateralToken = await hre.viem.deployContract("ERC20Mock", [
      "Collateral Token",
      "COL",
      parseEther("1000"),
    ]);

    // Deploy LendX and pass the mockPriceOracle address as the constructor argument.
    const lendX = await hre.viem.deployContract("LendX", [mockPriceOracle.address]);

    // Instead of manually creating a public client with http(), use the Hardhat Viem integration:
    const publicClient = await hre.viem.getPublicClient();

    return {
      lendX,
      collateralToken,
      mockPriceOracle,
      deployer,
      borrower,
      publicClient,
    };
  }

  it("Should allow users to deposit collateral", async function () {
    const {
      lendX,
      collateralToken,
      deployer,
      borrower,
      publicClient,
    } = await loadFixture(deployLendingFixture);
    const depositAmount = parseEther("10");

    // Deployer transfers tokens to borrower.
    const transferTx = await deployer.writeContract({
      address: collateralToken.address,
      abi: collateralToken.abi,
      functionName: "transfer",
      args: [borrower.account.address, depositAmount],
    });

    await publicClient.waitForTransactionReceipt({ hash: transferTx });

    // Borrower approves LendX contract to spend tokens.
    const approveTx = await borrower.writeContract({
      address: collateralToken.address,
      abi: collateralToken.abi,
      functionName: "approve",
      args: [lendX.address, depositAmount],
    });
    await publicClient.waitForTransactionReceipt({ hash: approveTx });

    // Borrower deposits collateral.
    const depositTx = await borrower.writeContract({
      address: lendX.address,
      abi: lendX.abi,
      functionName: "depositCollateral",
      args: [collateralToken.address, depositAmount],
    });
    const depositReceipt = await publicClient.waitForTransactionReceipt({ hash: depositTx});
    expect(depositReceipt.status).to.equal('success');
  });

  // Additional tests for borrow, repayLoan, and liquidate can be updated similarly.
});
