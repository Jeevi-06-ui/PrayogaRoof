#!/usr/bin/env node
/**
 * PrayogaProof - Capacitor Sync Script
 * Cross-platform (macOS, Linux, Windows)
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appDir = path.resolve(__dirname, '..');
const projectRootDir = path.resolve(appDir, '..');

console.log('🔄 Building Web Assets & Synchronizing with Native Platforms...');
execSync('npm run build', { cwd: projectRootDir, stdio: 'inherit' });
execSync('npx cap sync', { cwd: appDir, stdio: 'inherit' });
console.log('✅ Synchronization Complete for Android and iOS!');
