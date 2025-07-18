#!/bin/bash

# Medical Debt Collection Frontend Setup Script

echo "🏥 Medical Debt Collection System - Frontend Setup"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (version 16 or higher):"
    echo "   - Visit: https://nodejs.org/"
    echo "   - Or use Homebrew: brew install node"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version)
echo "✅ Node.js version: $NODE_VERSION"

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not available"
    exit 1
fi

NPM_VERSION=$(npm --version)
echo "✅ npm version: $NPM_VERSION"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
    echo ""
    echo "🚀 Ready to start! Run the following commands:"
    echo "   cd frontend"
    echo "   npm start"
    echo ""
    echo "📱 The application will open at: http://localhost:3000"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi
