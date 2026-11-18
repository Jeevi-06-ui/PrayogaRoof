#!/usr/bin/env node
/**
 * PrayogaProof - Capacitor Sync Script
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

console.log('🔄 Building Web Assets & Synchronizing with Native Platforms...');
execSync('npm run build', { cwd: projectRootDir, stdio: 'inherit' });
execSync('npx cap sync', { cwd: appDir, stdio: 'inherit' });

// Patch SPM dependency requirement for Capacitor iOS if Cap CLI set unreleased tag 6.2.3
const packageSwift = path.join(appDir, 'ios', 'App', 'CapApp-SPM', 'Package.swift');
if (fs.existsSync(packageSwift)) {
  let content = fs.readFileSync(packageSwift, 'utf-8');
  if (content.includes('exact: "6.2.3"')) {
    content = content.replace('exact: "6.2.3"', '"6.2.0"..<"7.0.0"');
    fs.writeFileSync(packageSwift, content);
  }
}

console.log('✅ Synchronization Complete for Android and iOS!');
