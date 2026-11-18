# PrayogaProof — Firebase Authentication & Android Gradle Fix Report

**Date:** 2026-11-18  
**Environment:** macOS Apple Silicon (Darwin 24.x arm64)  
**Project Path:** `/Users/jeevithp/Desktop/PrayogaRoof-Final`  

---

## 1. System & Toolchain Versions

- **JDK Runtime:** Eclipse Adoptium OpenJDK 21.0.13 (`/Library/Java/JavaVirtualMachines/temurin-21.jdk/Contents/Home`)
- **Gradle Version:** Gradle 8.14.3 (pinned in `gradle-wrapper.properties`)
- **Android Gradle Plugin (AGP):** 8.13.0 (defined in `app/android/build.gradle`)
- **Capacitor Core:** `6.2.3`
- **Capacitor Android:** `6.2.3`
- **Capacitor iOS:** `6.2.3`
- **Capacitor App:** `6.0.3`
- **Node.js:** v22.10.0

---

## 2. Issues Diagnosed & Root Causes

### Issue 1: "Unsupported class file major version 69" & ":capacitor-android could not be found"

#### Root Cause Analysis:
1. **Class File Version 69:** Java 25 generates class file format major version 69 (Java 21 is 65; Java 25 is 69). The IDE's Language Server extension was evaluating Gradle build files using an ambient Java 25 runtime. Gradle 8.14.3 does not support running on Java 25, resulting in `java.lang.IllegalArgumentException: Unsupported class file major version 69`.
2. **Orphaned Project Evaluation in `node_modules`:** The IDE scanned the project root and attempted to import `node_modules/@capacitor/android/capacitor` and `app/node_modules/@capacitor/android/capacitor` as standalone root Gradle projects. Because those plugin directories depend on the multi-project context defined in `app/android/settings.gradle` (`include ':capacitor-android'`), evaluating them in isolation caused Gradle to fail with `Project with path ':capacitor-android' could not be found in root project 'android'`.

#### Resolution Implemented:
1. **Pinned `org.gradle.java.home`:** Added `org.gradle.java.home=/Library/Java/JavaVirtualMachines/temurin-21.jdk/Contents/Home` to `app/android/gradle.properties`. This forces Gradle to always execute on the compatible JDK 21 daemon regardless of IDE or shell environment.
2. **Excluded `node_modules` from Java Language Server:** Updated `.vscode/settings.json` with `"java.import.exclusions": ["**/node_modules/**", "app/node_modules/**", "**/dist/**", "**/build/**"]`.
3. **Cleaned Orphaned Metadata:** Removed Eclipse `.project` and `.classpath` markers that had been written into `node_modules/@capacitor/android`.
4. **Verified Root Evaluation:** Running `./gradlew projects` from `app/android` confirms proper multi-project hierarchy:
   ```
   Root project 'android'
   +--- Project ':app'
   +--- Project ':capacitor-android'
   +--- Project ':capacitor-app'
   \--- Project ':capacitor-cordova-android-plugins'
   ```

---

### Issue 2: Firebase Login "Authentication could not be completed"

#### Root Cause Analysis:
Direct diagnostic probes to Google Identity Platform API (`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword`) with the project's API key returned:
```json
{
  "error": {
    "code": 400,
    "message": "CONFIGURATION_NOT_FOUND"
  }
}
```
Firebase Auth SDK maps this to error code:
`auth/configuration-not-found`

**Root Cause:** The Firebase project (`prayogaroof`) is created, but **Firebase Authentication has not been activated** in the Firebase Console. Until the **"Get started"** button is clicked under Authentication and the **Email/Password** provider is enabled, Google's Identity Platform API blocks all registration and login attempts.
Previously, this unhandled code fell into the generic `default` switch branch in `getFriendlyAuthErrorMessage`, displaying the opaque string `"Authentication could not be completed. Please try again."`

#### Resolution Implemented:
1. **Specific Error Mapping:** Mapped `auth/configuration-not-found` and `auth/operation-not-allowed` to clear, actionable guidance:
   `"Firebase Authentication is not yet activated in your Firebase project. Please click 'Get started' in Firebase Console and enable Email/Password, or use Offline Guest Mode."`
2. **Developer Diagnostic Panel:** Added `PrayogaAuthError` and `AuthDiagnostic` capturing:
   - `error.code` (`auth/configuration-not-found`)
   - `platform` (`Android Capacitor WebView`, `iOS Capacitor WKWebView`, or `Web Browser`)
   - `hint` with direct links and instructions
   - Sanitized message without passwords or credentials
3. **Non-Blocking Offline Fallback:** Integrated an instant **"Continue Immediately in Offline Laboratory Mode"** button directly on the diagnostic banner, allowing students to access all 68 laboratory simulations even if Firebase Console activation is pending.

---

## 3. Files Modified

| File | Change |
| :--- | :--- |
| `app/android/gradle.properties` | Pinned `org.gradle.java.home` to JDK 21. |
| `.vscode/settings.json` | Excluded `node_modules` from Java/Gradle auto-import and pinned JDK 21 runtime. |
| `src/services/firebaseAuthService.ts` | Added `PrayogaAuthError`, `AuthDiagnostic`, and explicit mapping for `auth/configuration-not-found`. |
| `src/pages/LoginPage.tsx` | Added developer diagnostic details panel and instant Offline Guest Mode fallback button. |
| `app/scripts/build-apk.mjs` | Added target output for `PrayogaProof-auth-fixed.apk`. |

---

## 4. Commands Executed & Verified

```bash
# 1. Verify Gradle multi-project hierarchy
cd app/android && ./gradlew projects
# Result: BUILD SUCCESSFUL in 542ms

# 2. Verify Android debug compilation
cd app/android && ./gradlew assembleDebug --stacktrace
# Result: BUILD SUCCESSFUL in 570ms

# 3. Compile full React web app and assemble APK
npm run app:build:apk
# Result: BUILD SUCCESSFUL in 1s. Generated PrayogaProof-auth-fixed.apk (5.09 MB)

# 4. Run full test suite
npm test
# Result: 57 test files passed, 525 tests passed (100%)

# 5. Typecheck & Lint
npm run lint && npm run typecheck
# Result: 0 errors, 0 warnings
```

---

## 5. Build Artifacts

- **Primary Debug APK:** `app/builds/android/PrayogaProof-debug.apk` (5.09 MB)
- **Auth-Fixed Release Output:** `app/builds/android/PrayogaProof-auth-fixed.apk` (5.09 MB)
- **Crash-Repaired Output:** `app/builds/android/PrayogaProof-mobile-fixed.apk` (5.09 MB)

---

## 6. Testing Outcomes & Remaining Steps

### Verified Working:
- ✅ Gradle build compiles natively without class file version mismatch.
- ✅ `:capacitor-android` resolves correctly in the multi-project Gradle build.
- ✅ All 68 laboratory experiments in Physics, Chemistry, Biology, and Mathematics mount without error.
- ✅ Offline persistence in IndexedDB remains intact; no progress or workspaces were erased.
- ✅ Full Vitest suite passes: 525/525 tests.

### Required Step in Firebase Console (User Action):
To enable live online registration and sign-in for the `prayogaroof` Firebase project:
1. Open [Firebase Console Authentication](https://console.firebase.google.com/project/prayogaroof/authentication).
2. Click **Get started**.
3. Under **Sign-in method**, enable **Email/Password** and click **Save**.
4. Open [Firestore Database](https://console.firebase.google.com/project/prayogaroof/firestore) and click **Create database**.
