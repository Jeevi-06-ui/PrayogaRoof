# PrayogaProof — Mobile Native Application (Android & iOS)

This directory (`app/`) contains the complete native packaging configuration, native platform projects, build scripts, and packaged distribution outputs for **PrayogaProof** on Android and iOS using **Capacitor**.

---

## 1. Native Application Architecture

```
PrayogaRoof-Final/
├── src/                          # Shared React, TypeScript & Tailwind source code
├── public/                       # Static assets & Mathematics offline bundle
├── dist/                         # Compiled Vite production web distribution
├── package.json                  # Root npm scripts (`app:sync`, `app:build:apk`, etc.)
│
└── app/                          # Mobile native application root
    ├── package.json              # Capacitor dependencies & mobile scripts
    ├── capacitor.config.ts       # Native configuration (appId: com.prayogaproof.mobile, webDir: ../dist)
    ├── android/                  # Native Android Studio / Gradle project
    ├── ios/                      # Native Xcode / Swift Package Manager project
    ├── builds/
    │   ├── android/              # Generated APKs (PrayogaProof-debug.apk)
    │   └── ios/                  # Exported IPAs (when signing certificate available)
    ├── scripts/
    │   ├── build-apk.mjs         # Cross-platform automated APK build script
    │   ├── sync.mjs              # Cross-platform build & sync script
    │   ├── build-apk.sh          # Unix/macOS shell helper
    │   └── build-apk.bat         # Windows batch helper
    └── README_APP.md             # This comprehensive packaging guide
```

### Key Architectural Tenets
- **Single Source of Truth:** Both Android and iOS run the compiled production output from `../dist`. No duplicated React code is maintained.
- **Offline-First:** All assets, scripts, scientific engines, fonts, and the Mathematics module are embedded into the native app's local asset directory (`assets/public/`). No external internet connection or local dev server is required.
- **Native Webview Bridges:**
  - **Android:** Android System WebView (`androidx.webkit:webkit`) wrapped in `BridgeActivity` with hardware back-button interception.
  - **iOS:** `WKWebView` with edge-to-edge layout, automatic notch/home-indicator safe area handling (`viewport-fit=cover`), and hardware-accelerated SVG/canvas rendering.

---

## 2. Rebuilding the React Website

Whenever you edit experiments, components, or styles in `src/`:

```bash
# From project root
npm run build
```

This compiles TypeScript (`tsc -b`) and bundles assets via Vite into `dist/`.

---

## 3. Synchronizing Web Changes into Android & iOS Apps

To copy the updated `dist/` web assets into the native Android and iOS wrapper projects:

```bash
# From project root
npm run app:sync
```

Or from inside `app/`:
```bash
cd app
npx cap sync
```

---

## 4. How to Generate the Android APK

Run the automated one-step APK build pipeline:

```bash
# From project root
npm run app:build:apk
```

This script:
1. Builds the React web app (`npm run build`).
2. Synchronizes assets into `app/android/` via Capacitor.
3. Runs Gradle (`./gradlew assembleDebug` or `gradlew.bat assembleDebug`).
4. Verifies the APK and copies it into `app/builds/android/PrayogaProof-debug.apk`.

Alternatively, via Gradle directly:
```bash
cd app/android
./gradlew assembleDebug       # macOS / Linux
gradlew.bat assembleDebug     # Windows
```

---

## 5. Where to Find the Generated APK

The verified Android debug APK is placed at:
```
app/builds/android/PrayogaProof-debug.apk
```
- **Package ID:** `com.prayogaproof.mobile`
- **Application Name:** `PrayogaProof`
- **Size:** ~4.7 MB (includes entire STEM lab & Mathematics module)

---

## 6. How to Install the APK on an Android Phone

### Method A: Direct Transfer via USB Cable (Recommended)
1. Connect your Android phone to your computer via USB.
2. On your phone, select **File Transfer / Android Auto** in the USB notification.
3. Copy `PrayogaProof-debug.apk` to your phone's **Downloads** folder.
4. On your phone, open the **Files** or **File Manager** app, tap `PrayogaProof-debug.apk`, and tap **Install**.
   *(If prompted, toggle "Allow installation from unknown sources" for your file manager).*

### Method B: Install via ADB (Android Debug Bridge)
If USB debugging is enabled on your Android device:
```bash
# Verify phone is detected
adb devices

# Install APK
adb install -r app/builds/android/PrayogaProof-debug.apk
```

### Method C: Cloud / Email / WhatsApp Transfer
1. Upload `PrayogaProof-debug.apk` to Google Drive or send it via Telegram/WhatsApp to yourself.
2. Download and tap the APK to install on your phone.

---

## 7. How to Open the Project in Android Studio

```bash
# From project root
npm run app:android

# Or manually:
# Open Android Studio -> Open -> Select "app/android" directory
```

From Android Studio, you can:
- Run directly on a connected physical phone or Android Virtual Device (AVD).
- Inspect Logcat for webview console messages and performance logs.
- Generate signed Release AAB/APK via **Build > Generate Signed Bundle / APK**.

---

## 8. How to Open the Project in Xcode

```bash
# From project root
npm run app:ios

# Or manually:
# Open Xcode -> Open -> Select "app/ios/App/App.xcodeproj"
```

---

## 9. How to Test on the iOS Simulator

1. Open the project in Xcode (`open app/ios/App/App.xcodeproj`).
2. Select any iPhone simulator from the run destination toolbar (e.g., **iPhone 16 Pro**).
3. Press **Cmd + R** (Product > Run) to build and launch PrayogaProof in the simulator.

> [!NOTE]
> On macOS machines where Xcode is updated but the system `CoreSimulator` framework requires a macOS host update, launch Xcode directly or update macOS so `CoreSimulator` matches Xcode's build version.

---

## 10. How to Test on a Physical iPhone

1. Connect your iPhone to your Mac using a USB-C or Lightning cable.
2. In Xcode, select your connected iPhone in the device selector.
3. Open the **App** project settings &rarr; **Signing & Capabilities**.
4. Check **Automatically manage signing** and choose your personal Apple ID under **Team**.
5. Press **Cmd + R** to compile and install on your phone.
6. On your iPhone: go to **Settings > General > VPN & Device Management** and trust your Developer App certificate.
7. Open **PrayogaProof** from your home screen.

---

## 11. How to Generate a Signed IPA for Distribution

Apple requires all iOS applications installed outside of a development Xcode connection to be cryptographically signed by an authorized Apple Developer Certificate and linked to a Provisioning Profile.

### Steps to Export a Signed IPA:
1. In Xcode, configure a paid or organizational **Apple Developer Account** under `Signing & Capabilities`.
2. Set Scheme destination to **Any iOS Device (arm64)**.
3. Select **Product > Archive**.
4. In the Xcode Organizer window that appears, click **Distribute App**.
5. Select distribution method:
   - **App Store Connect / TestFlight** (for beta testing or App Store release).
   - **Ad Hoc** (for testing on registered device UDIDs).
   - **Enterprise** (for internal distribution).
   - **Development** (for team testing).
6. Complete signing and export the `.ipa` file.
7. Save the verified signed `.ipa` file into `app/builds/ios/PrayogaProof.ipa`.

> [!IMPORTANT]
> Unsigned `.ipa` files cannot be installed directly on iOS devices due to Apple's mandatory code-signing and gatekeeper policies. Never attempt to install an un-provisioned package without Xcode or TestFlight.

---

## 12. Apple Signing & Developer Account Requirements

| Item | Requirement | Purpose |
| :--- | :--- | :--- |
| **Apple ID** | Free personal account | Testing on personal device via Xcode for 7 days. |
| **Apple Developer Program** | \$99/year membership | Required for TestFlight distribution, Ad Hoc IPAs, push notifications, and App Store releases. |
| **Signing Certificate** | Apple Distribution / Apple Development | Cryptographically signs the iOS binary. |
| **Provisioning Profile** | Development / Ad Hoc / App Store | Ties the App ID (`com.prayogaproof.mobile`) to developer certificates and authorized device UDIDs. |

---

## 13. Rebuilding after Modifying Experiments

When you update scientific engines, viva questions, or audio narration:

```bash
# 1. Rebuild web bundle and update native assets
npm run app:sync

# 2. Recompile Android APK
npm run app:build:apk
```

The new build will be immediately reflected in `app/builds/android/PrayogaProof-debug.apk`.

---

## 14. Mobile Device Verification & Known Behaviors

- **Voice Narration:**
  - Browser SpeechSynthesis utilizes native device voices (Google TTS on Android, Apple Samantha/Daniel on iOS).
  - Explicit user gesture ("Play Simulation with Voice" button) ensures compliance with mobile autoplay audio policies.
- **Touch & Gesture Handling:**
  - Interactive laboratory canvases (Konva.js / React-Konva) bind standard pointer events (`pointerdown`, `pointermove`, `pointerup`) ensuring responsive touch drag-and-drop on mobile touchscreens.
- **Screen Sizing & Orientation:**
  - Works in portrait and landscape modes.
  - Safe-area CSS insets (`env(safe-area-inset-*)`) prevent notch or rounded-corner clipping.
- **Offline State:**
  - 100% of application code, offline IndexedDB storage, and mathematics assets are pre-packaged into the application bundle. Airplane mode testing verifies full laboratory access without Wi-Fi or mobile data.
