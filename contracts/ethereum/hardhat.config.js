require("@nomicfoundation/hardhat-verify");

module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      chainId: 31337,
    },
  },
  paths: {
    sources: "./contracts", // Default path for Solidity contracts
    tests: "./test", // Path for test files
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
