# Ethereum Lending Contract - LendX

## Overview
This contract implements a **cross-chain lending protocol** for Ethereum, allowing users to:
- **Deposit ERC-20 tokens as collateral**
- **Borrow against their collateral**
- **Repay loans**
- **Trigger liquidation when collateral falls below required levels**

## Features
- Uses **ERC-20 standard** ([EIP-20](https://eips.ethereum.org/EIPS/eip-20))
- Supports **cross-chain messaging** via **LayerZero**
- Implements **security best practices** based on **EIP-2535** ([Diamond Standard](https://eips.ethereum.org/EIPS/eip-2535))
- Uses **OpenZeppelin’s contract security model**

## Smart Contract Implementation
The contract is designed to be **modular** and **upgradable** with:
- **Safe Math Operations** ([EIP-602](https://eips.ethereum.org/EIPS/eip-602))
- **ERC-4626 Vault Compatibility** ([EIP-4626](https://eips.ethereum.org/EIPS/eip-4626))
- **Customizable Interest Rate Models**

## Best Practices Followed
- **Access Control** using OpenZeppelin’s `Ownable` contract
- **Reentrancy Protection** using `ReentrancyGuard`
- **Gas Optimization** via `unchecked {}` blocks
- **Upgradable contract architecture** to prevent redeployment issues

## Deployment Steps
1. **Compile the Contract**
   ```bash
   pnpm --filter contracts/ethereum hardhat compile
   ```
2. **Deploy on Ethereum Testnet**
   ```bash
   pnpm --filter contracts/ethereum hardhat deploy --network goerli
   ```
3. **Verify on Etherscan**
   ```bash
   pnpm --filter contracts/ethereum hardhat verify --network goerli <CONTRACT_ADDRESS>
   ```

## Security Considerations
- **Preventing Oracle Manipulation**
  - Uses **Chainlink Oracles** for price feeds ([EIP-2362](https://eips.ethereum.org/EIPS/eip-2362))
- **Preventing Flash Loan Attacks**
  - Implements **anti-flash loan borrowing rules**
- **Ensuring Safe Liquidations**
  - Liquidation process follows **Aave’s Safety Module** ([Reference](https://docs.aave.com/risk/liquidations))

## Testing the Contract
```bash
pnpm --filter contracts/ethereum hardhat test
```

## Future Enhancements
- **ZK-Proofs for Private Solvency Checks**
- **Cross-Chain Lending via LayerZero**
- **Integration with Ethereum L2s (Optimism, Arbitrum)**

## License
This project is licensed under the **MIT License**.

---

### 📌 Need help or want to contribute?
Feel free to open an issue or submit a pull request on GitHub!

## 📄 [Ethereum Lending Contract README.md](./contracts/ethereum/README.md)
