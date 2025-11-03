# 📱 Mobile App Installation Guide

## Quick Install

```bash
cd mobile

# Clean install
rm -rf node_modules package-lock.json
npm install

# Start Expo
npm start
```

## If you get dependency errors:

The app uses the latest React Navigation v7 which requires:
- `react-native-safe-area-context` ~4.17.0
- `react-native-screens` ~4.6.0
- `react-native-gesture-handler` ~2.22.1
- `react-native-reanimated` ~4.0.0

All versions are compatible with Expo SDK 54.

## Test the App

After `npm start`:
- Scan QR code with Expo Go app
- Or press 'w' for web
- Or press 'a' for Android emulator
- Or press 'i' for iOS simulator

## Troubleshooting

If install fails, try:
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

The app will work! All dependencies are compatible.
