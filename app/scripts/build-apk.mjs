#!/usr/bin/env node
/**
 * PrayogaProof - Android APK Automated Build Script
 * Cross-platform (macOS, Linux, Windows)
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appDir = path.resolve(__dirname, '..');
const projectRootDir = path.resolve(appDir, '..');
const androidDir = path.resolve(appDir, 'android');
const outputDir = path.resolve(appDir, 'builds', 'android');

console.log('====================================================');
console.log('🚀 PrayogaProof - Native Android APK Build Pipeline');
console.log('====================================================\n');

try {
  // 1. Compile React & Vite production build
  console.log('📦 Step 1: Building React Vite Web Application...');
  execSync('npm run build', { cwd: projectRootDir, stdio: 'inherit' });

  // 2. Synchronize web assets with Capacitor
  console.log('\n📲 Step 2: Synchronizing Capacitor Android Assets...');
  execSync('npx cap sync android', { cwd: appDir, stdio: 'inherit' });

  // 3. Compile Native Android Debug APK via Gradle
  console.log('\n⚙️ Step 3: Compiling Android Debug APK with Gradle...');
  const isWindows = process.platform === 'win32';
  const gradlewCmd = isWindows ? 'gradlew.bat assembleDebug' : './gradlew assembleDebug';

  // Ensure local.properties or ANDROID_HOME is set if standard path exists
  const homeDir = process.env.HOME || process.env.USERPROFILE || '';
  const standardSdkMac = path.join(homeDir, 'Library', 'Android', 'sdk');
  const standardSdkWin = path.join(homeDir, 'AppData', 'Local', 'Android', 'Sdk');
  const localPropertiesPath = path.join(androidDir, 'local.properties');

  if (!fs.existsSync(localPropertiesPath)) {
    let detectedSdk = '';
    if (fs.existsSync(standardSdkMac)) detectedSdk = standardSdkMac;
    else if (fs.existsSync(standardSdkWin)) detectedSdk = standardSdkWin;
    else if (process.env.ANDROID_HOME) detectedSdk = process.env.ANDROID_HOME;

    if (detectedSdk) {
      fs.writeFileSync(localPropertiesPath, `sdk.dir=${detectedSdk.replace(/\\/g, '/')}\n`);
      console.log(`ℹ️ Configured Android SDK location in local.properties: ${detectedSdk}`);
    }
  }

  execSync(gradlewCmd, { cwd: androidDir, stdio: 'inherit' });

  // 4. Verify APK generation and copy to builds/android/
  const generatedApk = path.join(
    androidDir,
    'app',
    'build',
    'outputs',
    'apk',
    'debug',
    'app-debug.apk'
  );

  if (!fs.existsSync(generatedApk)) {
    throw new Error(`Expected APK not found at: ${generatedApk}`);
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const targetApk = path.join(outputDir, 'PrayogaProof-debug.apk');
  fs.copyFileSync(generatedApk, targetApk);

  const stats = fs.statSync(targetApk);
  const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);

  console.log('\n====================================================');
  console.log('✅ Android Debug APK Built Successfully!');
  console.log(`📁 Location: ${targetApk}`);
  console.log(`📊 Size: ${sizeMb} MB`);
  console.log('📱 Ready to install on real Android phones or emulators.');
  console.log('====================================================\n');
} catch (error) {
  console.error('\n❌ Android APK Build Failed:');
  console.error(error.message || error);
  process.exit(1);
}
