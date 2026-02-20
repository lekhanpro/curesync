# 💊 CureSync

**[Visit the Live Website](https://lekhanpro.github.io/curesync/)**

**Smart Medication Reminder & Drug Interaction Checker**

> Never miss a dose. Stay safe with real-time FDA interaction alerts.

CureSync is a production-grade, offline-first medication management app built with Expo (React Native). It combines smart reminders, real-time FDA drug interaction checks, and beautiful design into one trustworthy companion.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🕐 **Smart Reminders** | Daily, weekly, or interval-based push notifications |
| ⚠️ **Drug Interaction Alerts** | Real-time FDA openAPI checks before adding medications |
| 📊 **Adherence Tracking** | Progress rings and statistics to visualize consistency |
| 📶 **Offline-First** | Local SQLite database — works without internet |
| 💊 **Inventory Management** | Track pill counts with low-stock alerts |
| 📳 **Haptic Feedback** | Satisfying tactile responses on every action |

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Expo SDK 50+** | Managed React Native workflow |
| **Expo Router v3** | File-based navigation |
| **Drizzle ORM** | Type-safe SQLite with `expo-sqlite/next` |
| **TanStack Query v5** | Async state management |
| **Zustand** | Lightweight global state |
| **NativeWind v4** | Tailwind CSS for React Native |
| **React Native Reanimated 3** | 60fps spring animations |
| **React Hook Form + Zod** | Performant form validation |
| **FlashList** | Butter-smooth list rendering |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)

### Installation
```bash
git clone https://github.com/lekhanpro/curesync.git
cd curesync
npm install
npx expo start
```

### Run on Device
- Scan the QR code with **Expo Go** (iOS/Android)
- Or press `i` for iOS Simulator / `a` for Android Emulator

---

## 📁 Project Structure

```
curesync/
├── app/                    # Expo Router screens
│   ├── (tabs)/             # Tab navigation
│   │   ├── index.tsx       # Dashboard
│   │   ├── stats.tsx       # Statistics
│   │   └── settings.tsx    # Settings
│   ├── add-medication.tsx  # Add medication modal
│   └── _layout.tsx         # Root layout
├── components/             # Reusable UI components
│   ├── med-card.tsx        # Medication timeline card
│   ├── progress-ring.tsx   # Animated SVG ring
│   └── interaction-warning.tsx
├── db/                     # Database layer
│   ├── schema.ts           # Drizzle schema
│   └── client.ts           # SQLite client + provider
├── hooks/                  # Custom React hooks
│   └── use-medications.ts  # CRUD + notification hooks
├── services/               # Business logic
│   ├── fda.ts              # FDA API interaction checker
│   └── scheduler.ts        # Notification scheduling
├── store/                  # Zustand stores
│   └── ui-store.ts         # Global UI state
└── docs/                   # GitHub Pages website
    ├── index.html
    ├── styles.css
    └── script.js
```

---

## 🛡️ Safety

CureSync queries the FDA's openAPI to scan for dangerous drug interactions in real-time. The app parses warning labels and interaction sections, alerting you to potential risks before you even add a medication. It handles offline scenarios gracefully — never blocking you from managing your health.

---

## 📱 Screenshots

_Coming soon — build the app to see the beautiful UI in action!_

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 👤 Author

Built by [@lekhanpro](https://github.com/lekhanpro)
