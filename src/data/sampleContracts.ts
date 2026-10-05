import { SampleContract } from '../types/contract';

export const SAMPLE_CONTRACTS: SampleContract[] = [
  {
    id: 'dao-vault-reentrancy',
    name: 'EtherStore Vault (Reentrancy Flaw)',
    type: 'smart_contract',
    language: 'Solidity',
    tag: 'Critical Vulnerability',
    description: 'A classic vulnerable vault susceptible to SWC-107 Reentrancy attacks where funds are drained before balance updates.',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title EtherStore
 * @notice Vulnerable banking contract illustrating the Checks-Effects-Interactions violation
 */
contract EtherStore {
    mapping(address => uint256) public balances;
    address public owner;

    event Deposit(address indexed sender, uint256 amount);
    event Withdrawal(address indexed sender, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    function deposit() public payable {
        require(msg.value > 0, "Deposit amount must be positive");
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    // CRITICAL FLAW: State update occurs AFTER external call
    function withdraw() public {
        uint256 balance = balances[msg.sender];
        require(balance > 0, "Insufficient funds");

        // External interaction before zeroing balance allows recursive reentrancy
        (bool sent, ) = msg.sender.call{value: balance}("");
        require(sent, "Failed to send Ether");

        balances[msg.sender] = 0;
        emit Withdrawal(msg.sender, balance);
    }

    // INFORMATIONAL: Owner privilege without two-step transfer
    function transferOwnership(address newOwner) public {
        require(msg.sender == owner, "Only owner");
        owner = newOwner;
    }

    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }
}`
  },
  {
    id: 'batch-overflow-token',
    name: 'BatchToken (Integer Overflow SWC-101)',
    type: 'smart_contract',
    language: 'Solidity',
    tag: 'Critical Vulnerability',
    description: 'Vulnerable ERC20 token demonstrating SWC-101 Integer Overflow in batch transfer multiplication without SafeMath or bounds checking.',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

/**
 * @title BatchToken
 * @notice Vulnerable to SWC-101 Integer Overflow (similar to BeautyChain / BEC token)
 */
contract BatchToken {
    string public name = "BatchToken";
    string public symbol = "BAT";
    uint8 public decimals = 18;
    uint256 public totalSupply = 1000000 * 1e18;

    mapping(address => uint256) public balances;
    address public owner;

    constructor() {
        owner = msg.sender;
        balances[msg.sender] = totalSupply;
    }

    // CRITICAL FLAW: Integer multiplication overflow wraps to 0
    function batchTransfer(address[] memory _receivers, uint256 _value) public returns (bool) {
        uint256 cnt = _receivers.length;
        
        // VULNERABILITY: In Solidity <0.8 or inside unchecked blocks,
        // cnt * _value can overflow 2^256 - 1 and wrap to a tiny number or 0.
        // If cnt = 2 and _value = 2^255, amount becomes 0!
        uint256 amount = cnt * _value;
        require(cnt > 0 && cnt <= 20, "Invalid receiver count");
        require(_value > 0, "Zero transfer amount");
        require(balances[msg.sender] >= amount, "Insufficient balance");

        balances[msg.sender] -= amount;

        for (uint256 i = 0; i < cnt; i++) {
            // Recipient balances increment by _value while sender paid 0
            balances[_receivers[i]] += _value;
        }

        return true;
    }

    function transfer(address _to, uint256 _value) public returns (bool) {
        require(balances[msg.sender] >= _value, "Insufficient balance");
        balances[msg.sender] -= _value;
        balances[_to] += _value;
        return true;
    }

    function balanceOf(address _owner) public view returns (uint256) {
        return balances[_owner];
    }
}`
  },
  {
    id: 'flash-liquidity-oracle',
    name: 'YieldVault (Flash Loan & Spot Oracle)',
    type: 'smart_contract',
    language: 'Solidity',
    tag: 'DeFi Exploit Vector',
    description: 'Vulnerable DeFi vault relying on spot reserves instead of TWAP oracle, enabling flash loan price manipulation.',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

interface IUniswapV2Pair {
    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
}

contract VulnerableYieldVault {
    IERC20 public immutable asset;
    IERC20 public immutable rewardToken;
    IUniswapV2Pair public immutable dexPair;
    
    mapping(address => uint256) public userShares;
    uint256 public totalShares;

    constructor(address _asset, address _rewardToken, address _dexPair) {
        asset = IERC20(_asset);
        rewardToken = IERC20(_rewardToken);
        dexPair = IUniswapV2Pair(_dexPair);
    }

    // HIGH FLAW: Computes asset value directly from instant DEX reserves (flash-loan manipulateable)
    function getAssetPriceInReward() public view returns (uint256) {
        (uint112 reserve0, uint112 reserve1, ) = dexPair.getReserves();
        require(reserve0 > 0 && reserve1 > 0, "Invalid reserves");
        // Spot price without time-weighted average price (TWAP)
        return (uint256(reserve1) * 1e18) / uint256(reserve0);
    }

    function deposit(uint256 amount) external {
        require(amount > 0, "Zero amount");
        // MEDIUM FLAW: Unchecked return value for standard ERC20 transferFrom
        asset.transferFrom(msg.sender, address(this), amount);
        
        uint256 currentPrice = getAssetPriceInReward();
        uint256 sharesToMint = (amount * currentPrice) / 1e18;
        
        userShares[msg.sender] += sharesToMint;
        totalShares += sharesToMint;
    }

    // CRITICAL: Arbitrary caller can burn shares and extract manipulated reward tokens
    function redeemRewards(uint256 shares) external {
        require(userShares[msg.sender] >= shares, "Insufficient shares");
        userShares[msg.sender] -= shares;
        totalShares -= shares;

        uint256 currentPrice = getAssetPriceInReward();
        uint256 rewardAmount = (shares * 1e18) / currentPrice;

        rewardToken.transfer(msg.sender, rewardAmount);
    }
}`
  },
  {
    id: 'consultant-services-agreement',
    name: 'Consultant MSA (Predatory Clauses)',
    type: 'legal_contract',
    language: 'Legal Text',
    tag: 'Commercial Trap',
    description: 'A contractor service agreement hiding perpetual worldwide non-compete, full uncapped indemnification, and unilateral IP expropriation.',
    code: `MASTER SERVICES & INDEPENDENT CONTRACTOR AGREEMENT

This Agreement is entered into as of October 1, 2026, by and between Nexus Enterprises Inc. ("Company") and Jane Doe ("Contractor").

1. INTELLECTUAL PROPERTY ASSIGNMENT (PREDATORY)
Contractor hereby irrevocably assigns, transfers, and conveys to Company all right, title, and interest worldwide in any and all inventions, code, software, documentation, designs, and ideas created, authored, or conceived by Contractor during the term of this Agreement AND for five (5) years thereafter, regardless of whether created during working hours, using Company equipment, or entirely independently without reference to Company trade secrets.

2. INDEMNIFICATION & LIABILITY (UNCAPPED / ONE-WAY)
Contractor shall defend, indemnify, and hold harmless Company, its officers, affiliates, and successors from and against any and all claims, liabilities, losses, damages, penalties, and legal fees arising out of any breach, alleged breach, or dissatisfaction with Contractor's performance. Contractor's liability under this section shall be UNLIMITED and NOT subject to any cap, waiver, or exclusion of consequential damages. Company shall bear zero liability to Contractor under any circumstances.

3. COVENANT NOT TO COMPETE (GLOBAL EXCLUSION)
For a period of thirty-six (36) months following the termination of this Agreement for any reason, Contractor shall not directly or indirectly engage in, advise, consult with, or own any interest in any business, software project, or enterprise that operates in the software, blockchain, artificial intelligence, or technology industries globally.

4. PAYMENT & UNILATERAL WITHHOLDING
Company reserves the sole and unreviewable discretion to withhold, reduce, or cancel any invoiced payments if Company determines that deliverables do not meet subjective internal expectations. All milestone payments are non-refundable to Contractor.

5. TERMINATION & SURVIVAL
Company may terminate this Agreement immediately upon written notice without cause. Contractor may not terminate prior to completion of the full multi-year project term. Sections 1, 2, and 3 shall survive indefinitely.`
  },
  {
    id: 'saas-sla-terms',
    name: 'Enterprise Cloud SaaS Terms of Service',
    type: 'legal_contract',
    language: 'Legal Text',
    tag: 'SaaS Trap',
    description: 'Enterprise agreement featuring auto-renewal price lock-ins with 100% price hikes, disclaimer of all uptime liabilities, and mandatory arbitration.',
    code: `ENTERPRISE SUBSCRIPTION & SERVICE LEVEL AGREEMENT (SLA)

BETWEEN: CloudApex Global Ltd. ("Vendor") AND Customer.

SECTION 4: TERM & AUTOMATIC RENEWAL (LOCK-IN TRAP)
The initial term shall be twenty-four (24) months. Unless Customer provides written cancellation via certified postal mail exactly between ninety (90) and one hundred twenty (120) days prior to the expiration date, this Agreement shall automatically renew for additional twenty-four (24) month terms at Vendor's then-current standard rates, which may increase by up to fifty percent (50%) per renewal without prior notice.

SECTION 7: SERVICE LEVEL & DOWNTIME EXCLUSIONS
Vendor targets 99.9% uptime, provided however that Vendor shall have NO liability or obligation to issue service credits or refunds for any downtime resulting from infrastructure maintenance, cloud provider disruptions, software bugs, or security breaches. In no event shall Customer's total remedy for catastrophic system failure exceed five dollars ($5.00).

SECTION 11: DATA PRIVACY & CUSTOMER TELEMETRY
Customer grants Vendor an unrestricted, irrevocable, royalty-free, perpetual license to ingest, reprocess, utilize, and commercialize all Customer confidential proprietary data, source code, and telemetry submitted to the platform for any internal or third-party commercial machine learning and marketing purposes.

SECTION 15: MANDATORY BINDING ARBITRATION & CLASS ACTION WAIVER
All disputes arising under or related to this Agreement must be submitted to confidential individual arbitration in the Cayman Islands. Customer unconditionally waives any right to jury trial, court proceedings, or participation in class-action or collective representative claims.`
  },
  {
    id: 'secure-vault-reference',
    name: 'Audited Secure Vault (Gold Standard)',
    type: 'smart_contract',
    language: 'Solidity',
    tag: 'Shield Certified (Safe)',
    description: 'Production-grade reference implementation using OpenZeppelin ReentrancyGuard, SafeERC20, and CEI patterns.',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @dev Contract module that helps prevent reentrant calls to a function.
 */
abstract contract ReentrancyGuard {
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;
    uint256 private _status;

    constructor() {
        _status = _NOT_ENTERED;
    }

    modifier nonReentrant() {
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }
}

contract SecureVault is ReentrancyGuard {
    mapping(address => uint256) private _balances;
    address public owner;

    event Deposit(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    function deposit() external payable {
        require(msg.value > 0, "Zero deposit");
        _balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    // CHECK-EFFECTS-INTERACTIONS + NONREENTRANT GUARD
    function withdraw(uint256 amount) external nonReentrant {
        // 1. Checks
        require(amount > 0, "Zero withdrawal");
        uint256 userBalance = _balances[msg.sender];
        require(userBalance >= amount, "Insufficient balance");

        // 2. Effects (state modified BEFORE external call)
        _balances[msg.sender] = userBalance - amount;

        // 3. Interactions (secure value transfer)
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        emit Withdrawn(msg.sender, amount);
    }

    function balanceOf(address user) external view returns (uint256) {
        return _balances[user];
    }
}`
  }
];
