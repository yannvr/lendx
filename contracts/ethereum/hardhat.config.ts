import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import path from "path";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  paths: {
    sources: path.join(__dirname, "contracts"), // Resolves to absolute path
    tests: path.join(__dirname, "test"),
    artifacts: path.join(__dirname, "artifacts"),
    cache: path.join(__dirname, "cache"),
  },
};

export default config;
