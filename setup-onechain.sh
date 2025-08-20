#!/bin/bash

# OneChain CLI Installation and Setup Script
set -e

echo "🚀 Setting up OneChain CLI and development environment..."

# Check if Rust is installed
if ! command -v cargo &> /dev/null; then
    echo "❌ Rust not found. Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source ~/.cargo/env
    echo "✅ Rust installed successfully!"
else
    echo "✅ Rust is already installed: $(rustc --version)"
fi

# Install OneChain CLI
echo "📦 Installing OneChain CLI..."
if command -v one &> /dev/null; then
    echo "✅ OneChain CLI is already installed: $(one --version)"
else
    echo "Installing OneChain CLI from GitHub..."
    cargo install --locked --git https://github.com/one-chain-labs/onechain.git one_chain --features tracing
    
    # Add to PATH if needed
    if ! command -v one &> /dev/null; then
        echo "🔧 Adding OneChain CLI to PATH..."
        if [ -f ~/.cargo/bin/one_chain ]; then
            ln -sf ~/.cargo/bin/one_chain ~/.cargo/bin/one
        fi
        
        # Add cargo bin to PATH
        echo 'export PATH="$HOME/.cargo/bin:$PATH"' >> ~/.zshrc
        echo 'export PATH="$HOME/.cargo/bin:$PATH"' >> ~/.bashrc
        
        export PATH="$HOME/.cargo/bin:$PATH"
    fi
fi

echo "🌐 Setting up OneChain network configuration..."

# Configure testnet environment
one client new-env --alias testnet --rpc https://rpc-testnet.onelabs.cc:443 || echo "Testnet environment may already exist"
one client switch --env testnet

# Show current environment
echo "📍 Current environment:"
one client active-env

# Check if we have addresses
if ! one client addresses &> /dev/null || [ -z "$(one client addresses 2>/dev/null)" ]; then
    echo "🔑 Creating new address..."
    one client new-address ed25519
else
    echo "✅ Address already exists:"
    one client active-address
fi

# Check balance and offer to get testnet tokens
echo "💰 Checking balance..."
BALANCE=$(one client gas --json 2>/dev/null | jq -r '.[0].gasCoinId // empty' || echo "")

if [ -z "$BALANCE" ]; then
    echo "💧 No gas objects found. Getting testnet tokens..."
    echo "Requesting from faucet..."
    one client faucet
    
    echo "⏳ Waiting for faucet transaction to complete..."
    sleep 3
    
    echo "💰 New balance:"
    one client gas
else
    echo "✅ Gas objects found:"
    one client gas
fi

echo ""
echo "🎉 OneChain CLI setup completed!"
echo ""
echo "📋 Summary:"
echo "   ✅ OneChain CLI: $(one --version 2>/dev/null || echo 'Installation may still be in progress')"
echo "   ✅ Network: $(one client active-env)"
echo "   ✅ Address: $(one client active-address)"
echo ""
echo "🚀 Next steps:"
echo "   1. Build the Move package: ./scripts/build.sh"
echo "   2. Deploy to testnet: ./scripts/publish.sh"
echo "   3. Start the frontend: npm run dev"
echo ""
echo "💡 If the CLI is not found, restart your terminal or run:"
echo "   source ~/.zshrc"
