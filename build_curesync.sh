#!/usr/bin/env bash
set -euo pipefail

echo "🏥 CureSync — Medication Reminder & Interaction Checker"
echo "========================================================"

# ── 1. Scaffold Expo project ──────────────────────────────
npx -y create-expo-app@latest ./ --template blank-typescript
echo "✅ Expo project scaffolded"

# ── 2. Install production dependencies ────────────────────
npx expo install expo-router expo-linking expo-constants expo-status-bar expo-splash-screen \
  expo-sqlite expo-notifications expo-haptics expo-blur expo-font expo-device \
  react-native-reanimated react-native-gesture-handler react-native-screens \
  react-native-safe-area-context react-native-svg \
  @shopify/flash-list nativewind tailwindcss \
  drizzle-orm @tanstack/react-query zustand \
  react-hook-form @hookform/resolvers zod \
  lucide-react-native clsx tailwind-merge \
  expo-network

# ── 3. Install dev dependencies ──────────────────────────
npm install -D drizzle-kit @types/react @types/react-native \
  tailwindcss@3.3.2 postcss autoprefixer

echo "✅ All dependencies installed"

# ── 4. Create directory structure ────────────────────────
mkdir -p app/\(tabs\)
mkdir -p components
mkdir -p db
mkdir -p services
mkdir -p hooks
mkdir -p store
mkdir -p assets
mkdir -p drizzle

echo "✅ Directory structure created"
echo ""
echo "📂 Now copy the source files from the curesync directory."
echo "   All source files have been pre-generated for you."
echo ""
echo "🚀 To start: npx expo start"
