#!/bin/bash

# Evaluation System Version Switcher
# This script helps you switch between localStorage and Firestore versions

ADMIN_DIR="src/app/admin/evaluation"
CURRENT_PAGE="$ADMIN_DIR/page.tsx"
FIRESTORE_PAGE="$ADMIN_DIR/page-firestore.tsx"
LOCALSTORAGE_PAGE="$ADMIN_DIR/page-localstorage.tsx"

echo "🔄 Evaluation System Version Switcher"
echo "======================================"

# Check if files exist
if [ ! -f "$CURRENT_PAGE" ]; then
    echo "❌ Error: $CURRENT_PAGE not found"
    exit 1
fi

if [ ! -f "$FIRESTORE_PAGE" ]; then
    echo "❌ Error: $FIRESTORE_PAGE not found"
    exit 1
fi

# Backup current version if localStorage backup doesn't exist
if [ ! -f "$LOCALSTORAGE_PAGE" ]; then
    echo "📁 Creating localStorage backup..."
    cp "$CURRENT_PAGE" "$LOCALSTORAGE_PAGE"
    echo "✅ Backup created: $LOCALSTORAGE_PAGE"
fi

# Check current version
if grep -q "localStorage" "$CURRENT_PAGE"; then
    CURRENT_VERSION="localStorage"
else
    CURRENT_VERSION="Firestore"
fi

echo "📊 Current version: $CURRENT_VERSION"
echo ""
echo "Available options:"
echo "1. Switch to Firestore version (requires deployed Firestore rules)"
echo "2. Switch to localStorage version (works without Firebase setup)"
echo "3. Show deployment status"
echo "4. Exit"
echo ""

read -p "Choose an option (1-4): " choice

case $choice in
    1)
        echo "🔄 Switching to Firestore version..."
        cp "$FIRESTORE_PAGE" "$CURRENT_PAGE"
        echo "✅ Switched to Firestore version"
        echo ""
        echo "⚠️  IMPORTANT: Make sure your Firestore rules are deployed!"
        echo "   1. Go to: https://console.firebase.google.com"
        echo "   2. Select your project"
        echo "   3. Go to Firestore Database → Rules"
        echo "   4. Click 'Publish' to deploy rules"
        ;;
    2)
        echo "🔄 Switching to localStorage version..."
        cp "$LOCALSTORAGE_PAGE" "$CURRENT_PAGE"
        echo "✅ Switched to localStorage version"
        echo ""
        echo "ℹ️  This version works completely offline and doesn't require Firebase setup"
        ;;
    3)
        echo "📋 Deployment Status Check"
        echo "=========================="
        echo ""
        echo "Firestore Rules File: firestore.rules"
        if [ -f "firestore.rules" ]; then
            echo "✅ Found firestore.rules"
            echo "📄 Rules preview:"
            echo "---"
            grep -A 5 "evaluation_rounds" firestore.rules || echo "No evaluation_rounds rules found"
            echo "---"
        else
            echo "❌ firestore.rules not found"
        fi
        echo ""
        echo "🔗 To deploy rules manually:"
        echo "   1. Open: https://console.firebase.google.com"
        echo "   2. Go to your project → Firestore Database → Rules"
        echo "   3. Copy the contents of firestore.rules"
        echo "   4. Paste into the rules editor"
        echo "   5. Click 'Publish'"
        ;;
    4)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "🚀 Changes applied! Restart your development server if needed."
