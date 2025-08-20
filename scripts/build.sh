#!/bin/bash

# Build script for OneCoupon Move package
set -e

echo "🔨 Building OneCoupon Move package..."

cd move

# Run tests first
echo "🧪 Running tests..."
sui move test

# Build the package
echo "📦 Building package..."
sui move build

echo "✅ Build completed successfully!"
echo ""
echo "📄 To publish the package:"
echo "   ./scripts/publish.sh"
