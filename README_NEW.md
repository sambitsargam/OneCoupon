# OneCoupon - Tokenized Retail Coupons on OneChain

OneCoupon is a full-stack decentralized application (dApp) for tokenized retail coupons built on OneChain blockchain. Merchants can issue on-chain coupons, and users can hold them in their wallets and redeem them through smart contract calls.

## 🌟 Features

- **Merchant Coupon Issuance**: Create tokenized coupons with customizable discount values, usage limits, and expiry dates
- **User Coupon Management**: View, manage, and redeem owned coupons
- **Smart Contract Integration**: Secure on-chain coupon logic with Move programming language
- **OneChain Wallet Integration**: Seamless wallet connection and transaction handling
- **Testnet Faucet**: Built-in faucet for getting test OCT tokens
- **Transaction Activity**: Real-time transaction monitoring and history
- **Responsive UI**: Clean, accessible interface built with React and TypeScript

## 🏗️ Architecture

### Smart Contracts (Move)
- **Coupon Struct**: Core coupon data structure with metadata and usage tracking
- **Merchant System**: Optional merchant registry for whitelisting
- **Issue Function**: Create new coupons with validation
- **Redeem Function**: Process coupon redemption with discount calculation
- **Transfer Functions**: Handle coupon ownership transfers

### Frontend (React + TypeScript)
- **Wallet Integration**: OneChain wallet connectivity via @mysten/dapp-kit
- **State Management**: React Query for efficient data fetching and caching
- **Network Support**: Testnet and mainnet configuration
- **PTB Support**: Programmable Transaction Blocks for complex operations

## 🚀 Quick Start

### Prerequisites

1. **Node.js 18+** - [Download here](https://nodejs.org/)
2. **OneChain CLI** - Required for building and deploying Move contracts
3. **OneChain Wallet** - Browser extension for wallet connectivity

### Install OneChain CLI

```bash
# Install Rust (required for OneChain CLI)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# Install OneChain CLI
cargo install --locked --git https://github.com/one-chain-labs/onechain.git one_chain --features tracing

# Move binary to PATH (optional)
mv ~/.cargo/bin/one_chain ~/.cargo/bin/one

# Verify installation
one --version
```

### Setup Development Environment

```bash
# Clone the repository
git clone <repository-url>
cd OneCoupon

# Install frontend dependencies
npm install

# Configure network connection
one client new-env --alias testnet --rpc https://rpc-testnet.onelabs.cc:443
one client switch --env testnet

# Create wallet address
one client new-address ed25519

# Get test tokens
one client faucet
```

### Build and Deploy Smart Contracts

```bash
# Build Move package
./scripts/build.sh

# Deploy to testnet (generates package ID)
./scripts/publish.sh

# Update environment with package ID
# Copy the package ID from publish output to .env file
echo "VITE_PACKAGE_ID=<your-package-id>" >> .env
```

### Run the Frontend

```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

## 📁 Project Structure

```
OneCoupon/
├── move/                          # Move smart contracts
│   ├── Move.toml                 # Package configuration
│   ├── sources/
│   │   └── coupon.move           # Main coupon contract
│   └── tests/
│       └── coupon_tests.move     # Unit tests
├── src/                          # React frontend
│   ├── components/               # React components
│   │   ├── Header.tsx           # Navigation and wallet
│   │   ├── MerchantTab.tsx      # Coupon issuance
│   │   ├── MyCouponsTab.tsx     # Coupon management
│   │   ├── FaucetTab.tsx        # Testnet faucet
│   │   └── ActivityTab.tsx      # Transaction history
│   ├── config/
│   │   └── network.ts           # Network configuration
│   ├── App.tsx                  # Main application
│   ├── App.css                  # Styling
│   └── main.tsx                 # Application entry
├── scripts/                      # Build and deploy scripts
│   ├── build.sh                 # Build Move package
│   └── publish.sh               # Deploy to blockchain
├── .env                         # Environment variables
└── package.json                 # Dependencies and scripts
```

## 🔧 Configuration

### Environment Variables (.env)

```env
# OneChain Network URLs
VITE_TESTNET_RPC_URL=https://rpc-testnet.onelabs.cc/v1
VITE_MAINNET_RPC_URL=https://rpc-mainnet.onelabs.cc/v1

# Package ID (set after deployment)
VITE_PACKAGE_ID=

# Default network
VITE_DEFAULT_NETWORK=testnet

# Faucet URL
VITE_FAUCET_URL=https://faucet-testnet.onelabs.cc/v1/gas
```

### Network Configuration

The app supports both testnet and mainnet networks. By default, it connects to OneChain testnet for development and testing.

## 💡 Smart Contract Design

### Coupon Structure

```move
struct Coupon has key, store {
    id: UID,
    merchant: address,
    owner: address,
    code: vector<u8>,
    value_bps: u16,          // Discount in basis points (1-10000)
    max_uses: u8,            // Maximum number of uses
    used: u8,                // Current usage count
    expires_at_ms: u64       // Expiry timestamp in milliseconds
}
```

### Key Functions

1. **Issue Coupon**: `issue(merchant, to, code, value_bps, max_uses, expires_at_ms)`
2. **Redeem Coupon**: `redeem(coupon, order_total_oct)` → returns discount amount
3. **Transfer Coupon**: `transfer_to(coupon, new_owner)`

### Validation Rules

- Discount value: 1-10,000 basis points (0.01% - 100%)
- Expiry: Must be in the future
- Usage: Cannot exceed max_uses
- Owner: Only coupon owner can redeem

## 🧪 Testing

### Unit Tests

```bash
# Run Move contract tests
cd move
one move test

# Run with verbose output
one move test --verbose
```

### Frontend Testing

```bash
# Run React component tests (when added)
npm test

# Build production bundle
npm run build
```

### Integration Testing

1. Deploy contracts to testnet
2. Connect wallet to testnet
3. Issue test coupon
4. Verify coupon appears in "My Coupons"
5. Redeem coupon with test order
6. Verify discount calculation and state updates

## 🚀 Deployment

### Testnet Deployment

```bash
# Ensure you're on testnet
one client active-env

# Deploy package
./scripts/publish.sh

# Update frontend with package ID
# Copy package ID to .env file
```

### Mainnet Deployment

```bash
# Switch to mainnet
one client new-env --alias mainnet --rpc https://rpc-mainnet.onelabs.cc:443
one client switch --env mainnet

# Deploy package (requires mainnet OCT)
./scripts/publish.sh

# Update environment
export VITE_DEFAULT_NETWORK=mainnet
export VITE_PACKAGE_ID=<mainnet-package-id>
```

## 🛠️ Development

### Adding New Features

1. **Smart Contract Changes**: Modify `move/sources/coupon.move`
2. **Frontend Integration**: Update React components to use new functions
3. **Testing**: Add unit tests and integration tests
4. **Documentation**: Update README and code comments

### Debugging

- **Move Contracts**: Use `one move test --verbose` for detailed output
- **Frontend**: Browser DevTools for React debugging
- **Transactions**: Check OneChain explorer for transaction details
- **Network**: Verify RPC endpoints and network configuration

## 📚 Resources

### OneChain Documentation
- [Development Guide](https://docs.onelabs.cc/DevelopmentDocument)
- [API Documentation](https://docs.onelabs.cc/API)
- [TypeScript SDK](https://doc-testnet.onelabs.cc/typescript)
- [Move Programming](https://docs.onelabs.cc/Blogs)

### Community
- [OneChain Discord](https://discord.gg/onechain)
- [GitHub Issues](https://github.com/your-repo/issues)
- [OneChain Explorer](https://onescan.cc)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write unit tests for new features
- Update documentation for API changes
- Test on testnet before mainnet deployment

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OneChain team for the blockchain platform
- Move programming language community
- React and TypeScript communities

---

**Built with ❤️ for the OneChain ecosystem**

For questions or support, please open an issue or contact the development team.
