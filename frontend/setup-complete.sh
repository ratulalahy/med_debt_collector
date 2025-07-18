#!/bin/bash

echo "=========================================================="
echo "  Medical Debt Collection Frontend - Complete Setup Tool"
echo "=========================================================="
echo ""

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo "Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
    eval "$(/opt/homebrew/bin/brew shellenv)"
    echo "Homebrew installed successfully!"
else
    echo "✓ Homebrew already installed"
fi

# Install Node.js if not available
if ! command -v node &> /dev/null; then
    echo "Installing Node.js using Homebrew..."
    brew install node@18
    echo 'export PATH="/opt/homebrew/opt/node@18/bin:$PATH"' >> ~/.zshrc
    export PATH="/opt/homebrew/opt/node@18/bin:$PATH"
    echo "Node.js installed successfully!"
else
    echo "✓ Node.js already installed: $(node -v)"
fi

# Check npm
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm not found even after installing Node.js."
    echo "Try sourcing your profile: source ~/.zshrc"
    exit 1
else
    echo "✓ npm already installed: $(npm -v)"
fi

# Create nvm directory if it doesn't exist
if [ ! -d "$HOME/.nvm" ]; then
    echo "Setting up nvm directory..."
    mkdir -p $HOME/.nvm
fi

# Install nvm as a backup option
if ! command -v nvm &> /dev/null; then
    echo "Installing nvm as a backup option..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    echo "nvm installed successfully!"
fi

# Navigate to the frontend directory
cd "$(dirname "$0")" || exit

echo ""
echo "=== Project Dependencies ==="

# Install project dependencies
echo "Installing React project dependencies..."
npm install --legacy-peer-deps

echo ""
echo "=== Building Project ==="
echo "Building the React application..."
npm run build

echo ""
echo "=== Setup Complete ==="
echo "Your Medical Debt Collection Frontend is now ready!"
echo ""
echo "To start the development server, run:"
echo "cd $(pwd) && npm start"
echo ""
echo "To create a production build, run:"
echo "cd $(pwd) && npm run build"
echo ""
echo "Thank you for using our setup tool!"
