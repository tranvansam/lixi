## Development Setup

1. Install dependencies
   ```bash
   npm install
   ```

2. Start the mock API (json-server)
   ```bash
   npm run mock:server
   ```
   - Runs on `http://localhost:4000` by default.
   - Available test accounts are printed in the terminal when the server boots.

3. (Optional) point the app to the mock API by creating a `.env`:
   ```env
   # API Base URL
   VITE_API_BASE_URL=http://localhost:4000
   ```
   
   **Lưu ý:** Chỉ cần config base URL (domain). Các endpoints được hardcode trong code.

4. In a separate terminal, launch the Ionic/Vite app
   ```bash
   npm run dev
   ```

The app will use the mock API to perform login, refresh tokens, and fetch profile/system data.

---

## Build & Deploy Native Apps

### Prerequisites

**Android:**
- Java JDK 17 or higher (Java 21 recommended for Capacitor 7)
- Android Studio (latest stable version)
- Android SDK (API level 33+)

**iOS:**
- macOS only
- Xcode 14+ 
- CocoaPods
- Valid Apple Developer account (for device deployment)

### Add Native Platforms

#### Android
```bash
# Add Android platform (first time only)
npx ionic capacitor add android

# Or using npx cap
npx cap add android
```

#### iOS
```bash
# Add iOS platform (first time only - macOS only)
npx ionic capacitor add ios

# Or using npx cap
npx cap add ios
```

### Build & Sync Workflow

#### Step 1: Build Web Assets
```bash
# Build production web assets
npm run build

# Or development build (faster, no minification)
npx vite build
```

This creates the `dist/` folder with optimized web assets.

#### Step 2: Sync to Native Platforms

**Sync to Android:**
```bash
# Copy web assets + sync native config
npx cap sync android

# Or just copy web assets (no config changes)
npx cap copy android
```

**Sync to iOS:**
```bash
# Copy web assets + sync native config
npx cap sync ios

# Or just copy web assets (no config changes)
npx cap copy ios
```

#### Step 3: Build Native Apps

**Android - Debug APK:**
```bash
# Method 1: Using Ionic CLI (opens Android Studio)
npx ionic capacitor build android

# Method 2: Direct Gradle build
cd android
./gradlew assembleDebug
# APK output: android/app/build/outputs/apk/debug/app-debug.apk
```

**Android - Release APK/AAB:**
```bash
cd android
# Build release APK
./gradlew assembleRelease

# Build release AAB (for Google Play)
./gradlew bundleRelease

# Output:
# - APK: android/app/build/outputs/apk/release/app-release-unsigned.apk
# - AAB: android/app/build/outputs/bundle/release/app-release.aab
```

**iOS - Build:**
```bash
# Open in Xcode
npx ionic capacitor open ios

# Then in Xcode:
# 1. Select your device/simulator
# 2. Product > Build (⌘B)
# 3. Product > Archive (for App Store)
```

### Quick Development Commands

**Android - Live Reload:**
```bash
# Run on connected device with live reload
npx ionic capacitor run android -l --external

# Or just open in Android Studio
npx cap open android
```

**iOS - Live Reload:**
```bash
# Run on connected device with live reload
npx ionic capacitor run ios -l --external

# Or just open in Xcode
npx cap open ios
```

### Troubleshooting

#### Java Version Issues (Android)
If you get `error: invalid source release: 21`:

1. **Check Java version:**
   ```bash
   java -version
   ```

2. **Install Java 21 (if needed):**
   - Download from [Oracle](https://www.oracle.com/java/technologies/downloads/) or [OpenJDK](https://adoptium.net/)

3. **Set JAVA_HOME (Windows):**
   ```cmd
   setx JAVA_HOME "C:\Program Files\Java\jdk-21"
   ```

4. **Or downgrade Capacitor Android requirement:**
   Edit `android/variables.gradle`:
   ```gradle
   jvmTarget = '17'  // Change from 21 to 17
   ```

#### Gradle Build Issues
```bash
# Clean Gradle cache
cd android
./gradlew clean

# Rebuild
./gradlew assembleDebug --refresh-dependencies
```

#### Capacitor Sync Issues
```bash
# Remove and re-add platform
npx cap rm android
npm run build
npx cap add android
npx cap sync android
```

#### iOS Pod Install Issues
```bash
cd ios/App
pod deintegrate
pod install --repo-update
```

### Complete Build Script (One Command)

**Android:**
```bash
# Build web + sync + open Android Studio
npm run build && npx cap sync android && npx cap open android
```

**iOS:**
```bash
# Build web + sync + open Xcode
npm run build && npx cap sync ios && npx cap open ios
```

### CI/CD Build Commands

```bash
# Full production build for Android
npm ci
npm run build
npx cap sync android
cd android && ./gradlew assembleRelease

# Full production build for iOS
npm ci
npm run build
npx cap sync ios
cd ios/App && xcodebuild -workspace App.xcworkspace -scheme App -configuration Release archive
```

### Environment Variables for Native Builds

Create `.env.production` for production builds:
```env
VITE_API_BASE_URL=https://api.production.com
```

Then build will automatically use production config:
```bash
npm run build  # Uses .env.production
```

---

