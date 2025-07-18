#!/bin/bash
echo "Starting Medical Debt Collection Frontend..."
cd /Users/qratul/research_and_dev/debt_collector_vapi_2/frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start the development server
echo "Starting development server..."
npm start
