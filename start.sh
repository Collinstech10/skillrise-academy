#!/bin/bash
echo "Installing Frontend dependencies..."
cd frontend && npm install && cd ..

echo "Installing Backend dependencies..."
cd backend && npm install && cd ..

echo ""
echo "Done! Now run:"
echo "  Terminal 1: cd backend  && npm run dev"
echo "  Terminal 2: cd frontend && npm run dev"
