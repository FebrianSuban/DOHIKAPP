# Setup Guide - DOHIKAPP

Panduan lengkap untuk setup dan menjalankan DOHIKAPP di mesin lokal Anda.

## 🖥️ Setup Development Environment

### 1. Prerequisites

#### Windows
```bash
# Install Node.js dari https://nodejs.org/ (v18+)
# Pastikan npm tersedia
node --version
npm --version

# Install Expo CLI globally
npm install -g expo-cli

# Untuk Android development, install:
# - Java Development Kit (JDK) 17 atau lebih baru
# - Android SDK (melalui Android Studio)
# - Set environment variables:
#   JAVA_HOME -> path ke JDK
#   ANDROID_HOME -> path ke Android SDK
```

#### macOS
```bash
# Install Homebrew jika belum
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node

# Install Expo CLI
npm install -g expo-cli

# Untuk iOS development
xcode-select --install

# Untuk Android development
brew install openjdk@17
```

#### Linux
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install nodejs npm

# Install Expo CLI
npm install -g expo-cli

# Untuk Android development
sudo apt-get install openjdk-17-jdk android-sdk
```

### 2. Clone Repository

```bash
# Clone from GitHub
git clone https://github.com/FebrianSuban/DOHIKAPP.git
cd DOHIKAPP

# Jika menggunakan SSH
git clone git@github.com:FebrianSuban/DOHIKAPP.git
cd DOHIKAPP
```

### 3. Install Dependencies

```bash
# Install dependencies dari npm
npm install

# Jika ada issue dengan dependencies, coba:
npm ci  # Clean install berdasarkan package-lock.json
```

### 4. Verify Installation

```bash
# Check Expo CLI
expo --version

# Check project setup
npm run lint  # Seharusnya tidak ada error kritis

# Check TypeScript
npx tsc --noEmit  # Seharusnya compile successfully
```

## 🌐 Running on Web

### Start Development Server

```bash
# Terminal 1: Start Expo
npm run dev

# atau
npx expo start --web

# Browser akan otomatis membuka di http://localhost:19006
```

### What to Expect

- Metro bundler akan start mengompilasi kode
- Browser terbuka dengan aplikasi DOHIKAPP
- Hot reload enabled - perubahan code otomatis refresh
- DevTools available di browser console

### Debugging Web

```javascript
// Di browser console (F12 -> Console tab)
// Check localStorage
localStorage.getItem('userId')

// Check IndexedDB (untuk database)
// DevTools -> Application -> IndexedDB -> expo-sqlite
```

## 📱 Running on Android

### Prerequisites

```bash
# Pastikan Android SDK terinstall
# Lihat Android Studio -> SDK Manager

# Required:
# - Android API 33 (atau sesuai compileSdk di build.gradle)
# - Android Build Tools 33.0.2
# - Android Emulator atau Physical Device

# Set environment variable
# Windows: setx ANDROID_HOME "C:\Users\YourUsername\AppData\Local\Android\Sdk"
# macOS/Linux: export ANDROID_HOME ~/Library/Android/sdk
```

### Option 1: Using Emulator

```bash
# 1. Buka Android Studio
# 2. Buka AVD Manager (Virtual devices)
# 3. Buat atau pilih emulator
# 4. Jalankan emulator

# 5. Di project root, jalankan:
npm run android

# atau
npx expo run:android
```

### Option 2: Physical Device

```bash
# 1. Connect device via USB
# 2. Enable Developer Mode di device:
#    Settings -> About Phone -> Tap Build Number 7 times

# 3. Enable USB Debugging:
#    Settings -> Developer Options -> USB Debugging -> ON

# 4. Check device detected
adb devices

# 5. Build and install
npm run android
```

### Debugging Android

```bash
# View console logs
adb logcat

# Lihat logs dari Expo
expo start --android

# React Native debugger
# Shake device atau run: adb shell input keyevent 82
# Pilih "Debug Remote JS"
```

## 🍎 Running on iOS

### Prerequisites (macOS only)

```bash
# Install development tools
xcode-select --install

# Install CocoaPods
sudo gem install cocoapods

# Verify Xcode
xcode-select --print-path
```

### Running on Simulator

```bash
# Build and run pada iOS Simulator
npm run ios

# atau
npx expo run:ios

# Simulator akan otomatis launch
```

### Running on Physical Device

```bash
# 1. Connect iPhone via USB
# 2. Jalankan
npm run ios

# 3. Pilih device dari list
# 4. App akan install dan launch
```

## 🐛 Troubleshooting Setup

### "npm: command not found"
```bash
# Node.js belum terinstall
# Download dari https://nodejs.org/ dan install

# Atau jika menggunakan package manager:
brew install node  # macOS
apt-get install nodejs  # Linux
choco install nodejs  # Windows
```

### "expo: command not found"
```bash
# Install Expo CLI globally
npm install -g expo-cli

# Verify
expo --version
```

### Database Error "sakuperantau.db not found"
```bash
# Ini normal di first run, database akan auto-create
# Jika error persist, check:
# 1. Console logs
# 2. Permissions di device
# 3. Storage tersedia

# Clear semua data (development only)
npm start -- --clear
```

### Android Build Fails

#### compileSdkVersion Error
```bash
# Pastikan Android SDK level 33 installed:
# Android Studio -> SDK Manager -> API 33

# Set ANDROID_SDK_ROOT
export ANDROID_SDK_ROOT=$HOME/Library/Android/sdk  # macOS/Linux
setx ANDROID_SDK_ROOT C:\Users\username\AppData\Local\Android\Sdk  # Windows
```

#### Java Version Mismatch
```bash
# Gunakan JDK 17
export JAVA_HOME=$(/usr/libexec/java_home -v 17)  # macOS/Linux

# Windows: Atur di environment variables
# JAVA_HOME -> path ke JDK 17
```

#### Gradle Error
```bash
# Clear gradle cache
cd android
./gradlew clean
cd ..

# Rebuild
npm run android
```

### Metro Bundler Error
```bash
# Reset bundler cache
npm start -- --clear

# Atau manual
rm -rf node_modules
npm install
npm start
```

### Port Already in Use
```bash
# Jika port 8081 sudah terpakai, gunakan port lain
npx expo start --clear --localhost

# Atau specify port
PORT=8082 npx expo start
```

## 📦 Environment Configuration

### .env File (Optional)
```bash
# Jika ada .env requirements, create file:
# .env

# Development settings
ENVIRONMENT=development
DEBUG=true

# API Configuration (future use)
# API_URL=http://localhost:3000
# API_KEY=your_api_key_here
```

### app.json Configuration
```json
{
  "expo": {
    "name": "DOHIK",
    "slug": "bolt-expo-native",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/logo.png",
    // ... other config
  }
}
```

## 🔄 Hot Reload & Fast Refresh

### Web
- Automatic hot reload
- Preserves component state when possible
- Check console untuk React warnings

### Mobile
```bash
# Shake device / emulator untuk developer menu
# Pilih "Enable Fast Refresh"

# Perubahan di JSX otomatis reload
# Perubahan di App.json butuh rebuild
```

## 📊 Development Tools

### Visual Studio Code Extensions (Recommended)

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "dsznajder.es7-react-js-snippets",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss"
  ]
}
```

### Chrome DevTools for React Native

```bash
# Install react-native-debugger
brew install react-native-debugger

# atau download dari:
# https://github.com/jhen0409/react-native-debugger
```

## 🚀 Build Commands Reference

```bash
# Development
npm run dev              # Start web dev server
npm start              # Same as above

# Web Production Build
npm run build:web      # Build untuk deployment web
expo export --platform web

# Mobile
npm run android        # Build + run di Android
npm run ios           # Build + run di iOS

# Lint dan Type Check
npm run lint          # ESLint
npx tsc --noEmit      # TypeScript check

# Clean
npm ci                # Clean install dependencies
npm ci --legacy-peer-deps  # Jika ada peer dependency issue
```

## 📝 First Run Checklist

- [ ] Node.js v18+ terinstall
- [ ] Expo CLI terinstall globally
- [ ] Repository di-clone
- [ ] `npm install` berhasil
- [ ] `npm run lint` tanpa error
- [ ] `npx tsc --noEmit` compile successfully
- [ ] Bisa run di web: `npm run dev`
- [ ] Bisa run di Android/iOS (optional)
- [ ] Database auto-create saat pertama kali run
- [ ] Registrasi user baru berhasil
- [ ] Bisa create transaction

## 🆘 Getting Help

1. Check console logs (F12 -> Console)
2. Read error messages carefully
3. Check Expo documentation: https://docs.expo.dev/
4. Check React Native docs: https://reactnative.dev/
5. Search GitHub issues
6. Open new issue dengan:
   - OS dan Node version
   - Full error message
   - Langkah-langkah reproduce

---

**Last Updated:** November 11, 2025
