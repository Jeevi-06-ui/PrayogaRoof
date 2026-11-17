#!/usr/bin/env bash
set -e

# PrayogaProof Android APK Build Script (macOS / Linux)
cd "$(dirname "$0")/../.."
npm run app:build:apk
