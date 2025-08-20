# OneChain CLI Installation Guide

This guide will help you install the OneChain CLI required for building and deploying Move smart contracts.

## Prerequisites

- **Rust** toolchain (latest stable version)
- **Git** version control
- **macOS, Linux, or Windows with WSL**

## Installation Steps

### 1. Install Rust (if not already installed)

```bash
# Install Rust using rustup
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Source the environment
source ~/.cargo/env

# Verify Rust installation
rustc --version
cargo --version
```

### 2. Install OneChain CLI

```bash
# Clone OneChain repository and build CLI
git clone https://github.com/one-chain-labs/onechain.git
cd onechain

# Build and install the CLI
cargo install --path crates/one --locked --features tracing

# Verify installation
~/.cargo/bin/one --version
```

### 3. Setup PATH (optional but recommended)

```bash
# Add cargo bin to PATH if not already done
echo 'export PATH="$HOME/.cargo/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# For zsh users (macOS default)
echo 'export PATH="$HOME/.cargo/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Verify CLI is accessible
one --version
```

### 4. Configure OneChain Network

```bash
# Create testnet environment
one client new-env --alias testnet --rpc https://rpc-testnet.onelabs.cc:443

# Switch to testnet
one client switch --env testnet

# Verify connection
one client active-env
```

### 5. Create Wallet and Get Test Tokens

```bash
# Generate new address
one client new-address ed25519

# Get your address
one client active-address

# Request test tokens from faucet
one client faucet

# Check balance
one client gas
```

## Troubleshooting

### Common Issues

1. **Rust not found**: Make sure Rust is installed and `~/.cargo/bin` is in your PATH
2. **Build errors**: Ensure you have the latest Rust version with `rustup update`
3. **Network errors**: Check your internet connection and try different RPC endpoints
4. **Permission errors**: You might need to run with `sudo` on some systems

### Alternative Installation Methods

If the above doesn't work, try these alternatives:

#### Option 1: Pre-built Binaries (when available)
```bash
# Download from releases page (check OneChain GitHub)
curl -L https://github.com/one-chain-labs/onechain/releases/latest/download/one-macos -o one
chmod +x one
mv one ~/.cargo/bin/
```

#### Option 2: Docker Installation
```bash
# Use Docker if local installation fails
docker pull onelabs/onechain:latest
alias one='docker run --rm -v $(pwd):/workspace onelabs/onechain:latest'
```

## Verification

After installation, verify everything works:

```bash
# Check CLI version
one --version

# Test network connection
one client active-env

# List available commands
one --help

# Test Move compilation
cd /path/to/onecoupon/move
one move build
```

## Next Steps

Once the CLI is installed:

1. Return to the main OneCoupon README
2. Follow the "Build and Deploy Smart Contracts" section
3. Continue with frontend development

## Need Help?

- [OneChain Documentation](https://docs.onelabs.cc/DevelopmentDocument)
- [OneChain Discord](https://discord.gg/onechain)
- [GitHub Issues](https://github.com/one-chain-labs/onechain/issues)

---

**Note**: OneChain is under active development. Installation steps may change as the project evolves. Always refer to the official documentation for the latest instructions.
