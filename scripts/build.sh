#!/bin/bash

# Build script for OneCoupon Move package
set -e

echo "🔨 Building OneCoupon Move package..."

cd move

# Check if OneChain CLI is installed
if ! command -v one &> /dev/null; then
    echo "❌ OneChain CLI not found. Please install it first:"
    echo "   cargo install --locked --git https://github.com/one-chain-labs/onechain.git one_chain --features tracing"
    exit 1
fi

# Run tests first
echo "🧪 Running tests..."
one move test

# Build the package
echo "📦 Building package..."
one move build

echo "✅ Build completed successfully!"
echo ""
echo "📄 To publish the package:"
echo "   ./scripts/publish.sh"
