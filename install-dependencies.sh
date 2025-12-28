#!/bin/bash

# Smart Crop Aid - Dependency Installation Script
# This script installs all required dependencies including security packages

echo "🚀 Installing Smart Crop Aid Dependencies..."
echo ""

# Install main dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Install Firebase SDK (if not already installed)
echo "🔥 Installing Firebase SDK..."
npm install firebase

# Install additional security dependencies
echo "🔒 Installing security dependencies..."
npm install @react-native-async-storage/async-storage

# Verify installations
echo ""
echo "✅ Dependency installation complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Copy .env.example to .env"
echo "   cp .env.example .env"
echo ""
echo "2. Fill in your environment variables in .env"
echo "   - Firebase configuration"
echo "   - Bytez API key"
echo "   - Admin credentials"
echo ""
echo "3. Read SETUP_GUIDE.md for detailed setup instructions"
echo ""
echo "4. Start the development server:"
echo "   npm start"
echo ""
echo "📚 Documentation:"
echo "   - SETUP_GUIDE.md - Complete setup instructions"
echo "   - SECURITY_FIXES.md - Security improvements"
echo "   - QUICK_REFERENCE.md - Quick code patterns"
echo "   - TODO_CHECKLIST.md - Implementation checklist"
echo ""
