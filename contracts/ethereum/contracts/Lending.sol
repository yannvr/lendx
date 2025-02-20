// filepath: /Users/yannvallery-radot/dev/defi/lendx/contracts/ethereum/contracts/Lending.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

/**
 * @title LendX Ethereum Lending Contract
 * @notice Implements a decentralized lending protocol where users can deposit collateral,
 *         borrow funds, and repay loans, following ERC-20 and cross-chain standards.
 * @dev Uses OpenZeppelin security best practices, Chainlink oracles for pricing,
 *      and LayerZero for cross-chain messaging.
 */
contract LendX is ReentrancyGuard, Ownable {
    AggregatorV3Interface public priceOracle;

    constructor(address _priceOracle) Ownable(msg.sender) {
        priceOracle = AggregatorV3Interface(_priceOracle);
    }

    struct Loan {
        uint256 collateralAmount;
        uint256 borrowedAmount;
        address collateralToken;
    }

    mapping(address => Loan) public loans;
    mapping(address => mapping(address => uint256)) public collateralBalances;

    uint256 public constant LTV_RATIO = 50; // Loan-to-Value ratio (50%)
    uint256 public constant LIQUIDATION_THRESHOLD = 30; // Liquidation if collateral < 30%

    event CollateralDeposited(
        address indexed user,
        address indexed token,
        uint256 amount
    );
    event LoanTaken(address indexed user, uint256 amount);
    event LoanRepaid(address indexed user, uint256 amount);
    event LiquidationExecuted(address indexed user);

    /**
     * @notice Allows users to deposit ERC-20 collateral.
     * @param _token The address of the ERC-20 token being deposited.
     * @param _amount The amount of tokens to deposit.
     */
    function depositCollateral(
        address _token,
        uint256 _amount
    ) external nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        IERC20(_token).transferFrom(msg.sender, address(this), _amount);
        collateralBalances[msg.sender][_token] += _amount;
        emit CollateralDeposited(msg.sender, _token, _amount);
    }

    /**
     * @notice Allows users to borrow against their collateral.
     * @param _amount The amount of funds to borrow.
     */
    function borrow(uint256 _amount) external nonReentrant {
        require(
            loans[msg.sender].borrowedAmount == 0,
            "Existing loan must be repaid first"
        );
        uint256 maxBorrow = (collateralBalances[msg.sender][
            loans[msg.sender].collateralToken
        ] * LTV_RATIO) / 100;
        require(_amount <= maxBorrow, "Borrow amount exceeds allowed limit");
        loans[msg.sender] = Loan(
            maxBorrow,
            _amount,
            loans[msg.sender].collateralToken
        );
        IERC20(loans[msg.sender].collateralToken).transfer(msg.sender, _amount);
        emit LoanTaken(msg.sender, _amount);
    }

    /**
     * @notice Allows users to repay their loans.
     */
    function repayLoan() external nonReentrant {
        require(loans[msg.sender].borrowedAmount > 0, "No active loan");
        uint256 repaymentAmount = loans[msg.sender].borrowedAmount;
        IERC20(loans[msg.sender].collateralToken).transferFrom(
            msg.sender,
            address(this),
            repaymentAmount
        );
        delete loans[msg.sender];
        emit LoanRepaid(msg.sender, repaymentAmount);
    }

    /**
     * @notice Gets the current price of the collateral from the price oracle.
     * @return The price of the collateral.
     */
    function getCollateralPrice() public view returns (uint256) {
        (, int price, , , ) = priceOracle.latestRoundData();
        return uint256(price);
    }

    /**
     * @notice Allows the contract owner to liquidate undercollateralized loans.
     * @param _user The address of the user whose loan is being liquidated.
     */
    function liquidate(address _user) external {
        Loan memory loan = loans[_user];
        require(loan.borrowedAmount > 0, "No active loan to liquidate");

        uint256 collateralValue = collateralBalances[_user][
            loan.collateralToken
        ] * getCollateralPrice();
        uint256 requiredCollateral = (loan.borrowedAmount * 100) /
            LIQUIDATION_THRESHOLD;

        require(
            collateralValue < requiredCollateral,
            "Collateral is sufficient"
        );

        delete loans[_user];
        IERC20(loan.collateralToken).transfer(owner(), collateralValue);
        emit LiquidationExecuted(_user);
    }
}
