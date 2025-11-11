# Quick Start Guide - DOHIKAPP

Mulai develop DOHIKAPP dalam 5 menit!

## ⚡ 5-Minute Setup

### 1. Prerequisites Check
```bash
# Pastikan sudah terinstall:
node --version    # v18 or higher
npm --version     # v9 or higher
```

### 2. Clone & Install
```bash
git clone https://github.com/FebrianSuban/DOHIKAPP.git
cd DOHIKAPP
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

Browser akan otomatis membuka aplikasi di `http://localhost:19006`

### 4. Test Features
- ✅ Klik "Daftar" dan buat akun baru
- ✅ Login dengan akun yang baru dibuat
- ✅ Klik tab "Tambah" dan input transaksi
- ✅ Lihat transaksi di halaman utama
- ✅ Cek laporan di tab "Ringkasan"

---

## 📱 Run on Mobile

### Android
```bash
# Pastikan Android SDK/Emulator ready
npm run android

# atau
npx expo run:android
```

### iOS (macOS only)
```bash
npm run ios

# atau
npx expo run:ios
```

---

## 🏗️ Project Structure

```
DOHIKAPP/
├── app/                      # Pages & Routes
│   ├── (tabs)/              # Main app screens
│   ├── auth.tsx             # Login/Register
│   └── _layout.tsx          # Root layout
├── context/                  # State management
│   ├── AuthContext.tsx      # User auth
│   ├── DatabaseContext.tsx  # SQLite db
│   └── NotificationContext.tsx
├── assets/                   # Images, fonts
└── android/                  # Android native
```

---

## 🎯 Key Features

| Feature | Status | Location |
|---------|--------|----------|
| Login/Register | ✅ Done | `app/auth.tsx` |
| Add Transaction | ✅ Done | `app/(tabs)/add.tsx` |
| View Summary | ✅ Done | `app/(tabs)/summary.tsx` |
| User Profile | ✅ Done | `app/(tabs)/profile.tsx` |
| Reminders | 🚧 WIP | `context/NotificationContext.tsx` |

---

## 💻 Common Commands

```bash
# Development
npm run dev              # Start web dev server
npm run android          # Build + run Android
npm run ios             # Build + run iOS

# Production
npm run build:web       # Build for web deployment

# Maintenance
npm run lint            # Check code style
npm update              # Update dependencies
npm audit               # Check security vulnerabilities
npm audit fix           # Fix security issues
```

---

## 🔐 Important Notes

✅ **What Works:**
- User authentication with local SQLite
- Transaction management (income/expense)
- Reporting with charts
- Multi-platform support (web, Android, iOS)

⚠️ **Limitations:**
- No cloud sync (local database only)
- No offline support yet
- No user-to-user features
- No push notifications in production

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| "npm not found" | Install Node.js from nodejs.org |
| Blank screen | Clear cache: `npm start -- --clear` |
| Database error | Clear app data and restart |
| Build fails | Check console error, fix dependencies |
| Port already in use | Kill node: `pkill node` |

---

## 📚 Documentation

- **README.md** - Complete documentation
- **SETUP.md** - Detailed setup guide
- **ARCHITECTURE.md** - API reference
- **FAQ.md** - Troubleshooting & FAQs

---

## 🚀 Next Steps

1. ✅ Setup development environment (SETUP.md)
2. ✅ Understand project structure (README.md)
3. ✅ Read API reference (ARCHITECTURE.md)
4. ✅ Check FAQ for troubleshooting (FAQ.md)
5. 🚀 Start coding!

---

## 💡 Example: Add New Feature

### Create a new page
```typescript
// app/(tabs)/settings.tsx
import { useAuth } from '@/context/AuthContext';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  
  return (
    // Your UI here
  );
}
```

### Access database
```typescript
import { useDatabase } from '@/context/DatabaseContext';

export default function MyComponent() {
  const { db, isReady } = useDatabase();
  
  if (!isReady) return null;
  
  // Use db.runAsync, db.getFirstAsync, etc.
}
```

### Use authentication
```typescript
import { useAuth } from '@/context/AuthContext';

export default function MyComponent() {
  const { user, login, register, logout } = useAuth();
  
  // Use auth methods
}
```

---

## 📞 Get Help

- 📖 Read documentation files
- 🔍 Check GitHub issues
- 💬 Open new issue with error details
- 📧 Contact developer

---

**Happy Coding! 🎉**

For detailed information, see:
- [README.md](./README.md) - Full documentation
- [SETUP.md](./SETUP.md) - Setup instructions
- [ARCHITECTURE.md](./ARCHITECTURE.md) - API reference
- [FAQ.md](./FAQ.md) - Troubleshooting

Last Updated: November 11, 2025
