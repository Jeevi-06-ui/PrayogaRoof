#!/usr/bin/env node
/**
 * PrayogaProof - iOS Native Application Automated Build Pipeline
 * Target: macOS with Xcode toolchain
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appDir = path.resolve(__dirname, '..');
const projectRootDir = path.resolve(appDir, '..');
const iosDir = path.resolve(appDir, 'ios', 'App');
const outputDir = path.resolve(appDir, 'builds', 'ios');

console.log('====================================================');
console.log('🍎 PrayogaProof - Native iOS Build Pipeline');
console.log('====================================================\n');

try {
  if (process.platform !== 'darwin') {
    console.warn('⚠️ Native iOS builds require macOS with Xcode.');
    console.log('iOS Xcode project files are prepared in app/ios/App/App.xcodeproj.');
    process.exit(0);
  }

  // 1. Build React web application
  console.log('📦 Step 1: Building React Vite Web Application...');
  execSync('npm run build', { cwd: projectRootDir, stdio: 'inherit' });

  // 2. Synchronize web assets with Capacitor iOS
  console.log('\n📲 Step 2: Synchronizing Capacitor iOS Assets...');
  execSync('npx cap sync ios', { cwd: appDir, stdio: 'inherit' });

  // Patch SPM dependency requirement for Capacitor iOS if Cap CLI set unreleased tag 6.2.3
  const packageSwift = path.join(appDir, 'ios', 'App', 'CapApp-SPM', 'Package.swift');
  if (fs.existsSync(packageSwift)) {
    let content = fs.readFileSync(packageSwift, 'utf-8');
    if (content.includes('exact: "6.2.3"')) {
      content = content.replace('exact: "6.2.3"', '"6.2.0"..<"7.0.0"');
      fs.writeFileSync(packageSwift, content);
    }
  }

  // 3. Compile Native iOS App with xcodebuild
  console.log('\n⚙️ Step 3: Compiling iOS App with Xcode...');
  const xcodeCmd =
    'xcodebuild -project App.xcodeproj -scheme App -configuration Debug CODE_SIGNING_ALLOWED=NO CODE_SIGNING_REQUIRED=NO CODE_SIGN_IDENTITY="" -destination "generic/platform=iOS" build';
  execSync(xcodeCmd, { cwd: iosDir, stdio: 'inherit' });

  // 4. Locate DerivedData and copy built bundle
  const derivedDataApp = path.join(
    process.env.HOME || '',
    'Library/Developer/Xcode/DerivedData'
  );

  let sourceAppPath = '';
  if (fs.existsSync(derivedDataApp)) {
    const derivedDirs = fs.readdirSync(derivedDataApp).filter((d) => d.startsWith('App-'));
    for (const d of derivedDirs) {
      const candidate = path.join(derivedDataApp, d, 'Build/Products/Debug-iphoneos/App.app');
      if (fs.existsSync(candidate)) {
        sourceAppPath = candidate;
        break;
      }
    }
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  if (sourceAppPath && fs.existsSync(sourceAppPath)) {
    const targetApp = path.join(outputDir, 'App.app');
    execSync(`cp -R "${sourceAppPath}" "${outputDir}/"`);
    console.log('\n====================================================');
    console.log('✅ iOS Native App Built Successfully!');
    console.log(`📁 Location: ${targetApp}`);
    console.log('📱 Ready for inspection or deployment to test devices.');
    console.log('====================================================\n');
  } else {
    console.log('Build completed. Project ready in app/ios/App/App.xcodeproj.');
  }
} catch (error) {
  console.error('\n❌ iOS Build Failed:');
  console.error(error.message || error);
  process.exit(1);
}
