#!/bin/bash

# Publish script for OneCoupon Move package
set -e

echo "🚀 Publishing OneCoupon Move package to OneChain Testnet..."

cd move

# Check if OneChain CLI is installed
if ! command -v one &> /dev/null; then
    echo "❌ OneChain CLI not found. Please install it first:"
    echo "   cargo install --locked --git https://github.com/one-chain-labs/onechain.git one_chain --features tracing"
    exit 1
fi

# Check if we have a gas object
echo "⛽ Checking gas balance..."
one client gas --json > /tmp/gas_check.json || {
    echo "❌ No gas objects found. Please get testnet tokens first:"
    echo "   one client faucet"
    exit 1
}

# Build before publishing
echo "📦 Building package..."
one move build

# Publish to testnet
echo "🌐 Publishing to testnet..."
PUBLISH_OUTPUT=$(one client publish --gas-budget 100000000 --json)

# Extract package ID from output
PACKAGE_ID=$(echo "$PUBLISH_OUTPUT" | jq -r '.objectChanges[] | select(.type == "published") | .packageId')

if [ "$PACKAGE_ID" != "null" ] && [ -n "$PACKAGE_ID" ]; then
    echo "✅ Package published successfully!"
    echo "📦 Package ID: $PACKAGE_ID"
    
    # Save package ID to config file
    cd ..
    mkdir -p config
    echo "{\"packageId\": \"$PACKAGE_ID\", \"network\": \"testnet\"}" > config/published.json
    
    echo "💾 Package ID saved to config/published.json"
    echo ""
    echo "🎯 Next steps:"
    echo "   1. Update your .env file with VITE_PACKAGE_ID=$PACKAGE_ID"
    echo "   2. Start the frontend: npm run dev"
else
    echo "❌ Failed to extract package ID from publish output"
    echo "Raw output:"
    echo "$PUBLISH_OUTPUT"
    exit 1
fi
