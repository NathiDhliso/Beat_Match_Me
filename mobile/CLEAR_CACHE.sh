#!/bin/bash
# Complete cache clear for Expo

echo "🧹 Clearing ALL Expo caches..."

# Stop any running Metro bundler
echo "Stopping Metro bundler..."
pkill -f "react-native" || true
pkill -f "metro" || true

# Clear Expo cache
echo "Clearing Expo cache..."
rm -rf .expo
rm -rf node_modules/.cache

# Clear Metro cache
echo "Clearing Metro cache..."
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/react-*
rm -rf $TMPDIR/haste-*

# Clear watchman
echo "Clearing Watchman..."
watchman watch-del-all 2>/dev/null || true

echo "✅ All caches cleared!"
echo ""
echo "Now run: npm start -- --clear"
