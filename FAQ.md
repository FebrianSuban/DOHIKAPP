# FAQ & Troubleshooting - DOHIKAPP

Panduan FAQ dan solusi untuk masalah umum yang mungkin dihadapi.

## ❓ Frequently Asked Questions

### General

#### Q: Aplikasi ini gratis?
A: Ya, DOHIKAPP adalah aplikasi open-source dan gratis untuk digunakan. Data pribadi Anda disimpan secara lokal di perangkat, tidak di cloud.

#### Q: Apakah data saya aman?
A: Ya. Database SQLite disimpan lokal di perangkat Anda. Tidak ada data yang dikirim ke server eksternal. Password di-hash menggunakan SHA256 sebelum disimpan.

#### Q: Bisa backup data?
A: Saat ini belum ada fitur backup bawaan. Untuk production use, sebaiknya:
- Export data manual ke CSV/PDF
- Hubungi developer untuk fitur cloud backup

#### Q: Bisa sinkronisasi antar device?
A: Belum tersedia. Setiap device memiliki database lokal terpisah.

---

### Installation & Setup

#### Q: Apakah saya harus install Android Studio untuk development?
A: Hanya jika ingin test di Android emulator atau device. Untuk web development, cukup install Node.js dan Expo CLI.

#### Q: Error: "Node.js not found"
**Solusi:**
1. Download dan install Node.js dari https://nodejs.org/
2. Restart terminal/command prompt
3. Verify: `node --version`

#### Q: Error: "npm: command not found"
**Solusi:**
1. Node.js belum terinstall dengan benar
2. Re-install Node.js dari nodejs.org
3. Pastikan npm terinstall: `npm --version`

#### Q: Bagaimana cara update dependencies?
```bash
# Check outdated packages
npm outdated

# Update specific package
npm update package-name

# Update all packages
npm update

# Check untuk security vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

---

### Development & Running App

#### Q: Aplikasi tidak start di web
**Gejala:** Metro error atau blank screen

**Solusi:**
```bash
# 1. Clear cache
npm start -- --clear

# 2. Kill semua process expo
# Windows: taskkill /F /IM node.exe
# macOS/Linux: pkill node

# 3. Install ulang dependencies
rm -rf node_modules package-lock.json
npm install

# 4. Start kembali
npm run dev
```

#### Q: Tombol tidak responsif di web
**Gejala:** Klik tombol tidak ada reaksi

**Solusi:**
1. Periksa console browser (F12 -> Console tab)
2. Cari error messages
3. Clear browser cache: Ctrl+Shift+Del
4. Buka di incognito mode
5. Test di browser lain (Chrome, Firefox, Safari)

#### Q: Hot reload tidak bekerja
**Gejala:** Perubahan code tidak otomatis update

**Solusi:**
```bash
# 1. Disable fast refresh
# iOS: Shake device -> Disable Fast Refresh
# Android: adb shell input keyevent 82 -> Disable Fast Refresh

# 2. Re-enable
# Repeat step 1

# 3. Jika masih tidak bekerja:
npm start -- --clear
```

#### Q: Build terlalu lambat
**Solusi:**
```bash
# Gunakan --dev flag
expo start --dev

# Untuk production build, gunakan EAS Build:
npm install -g eas-cli
eas build --platform android
```

---

### Authentication Issues

#### Q: "Gagal mendaftar. Email mungkin sudah terdaftar"
**Gejala:** Registrasi gagal padahal belum pernah daftar

**Solusi:**
1. Periksa apakah email sudah digunakan di akun lain
2. Coba dengan email berbeda
3. Clear data aplikasi:
   - Mobile: Settings -> Apps -> DOHIK -> Clear Data
   - Web: DevTools -> Application -> Clear Site Data

#### Q: "Email atau kata sandi salah" pada login
**Gejala:** Tidak bisa login meski password benar

**Solusi:**
1. Pastikan Caps Lock OFF
2. Cek apakah akun pernah terdaftar (bisa reset dari registrasi)
3. Password case-sensitive (huruf kecil/besar berbeda)
4. Minimal password 6 karakter

#### Q: Lupa password, bagaimana?
**Saat ini:** Belum ada fitur forgot password

**Workaround:**
1. Hapus akun lama:
   - Mobile: Settings -> Apps -> DOHIK -> Clear Data
   - Web: DevTools -> Application -> Clear Site Data
2. Registrasi ulang dengan email yang sama

**Untuk production:**
- Hubungi developer untuk reset manual
- Atau implementasi email verification + forgot password flow

#### Q: Aplikasi tidak ingat login saya
**Gejala:** Logout saat refresh halaman atau restart app

**Solusi:**
1. Periksa browser settings - jangan auto-clear cookies
2. Pastikan AsyncStorage working:
   ```javascript
   // Di browser console
   localStorage.getItem('userId')  // Harus ada value
   ```
3. Clear dan login ulang

---

### Database & Data

#### Q: "Database initialization error"
**Gejala:** Aplikasi crash di startup

**Solusi:**
1. Periksa console log detail
2. Pastikan storage tersedia di device
3. Clear aplikasi dan re-install:
   ```bash
   npm start -- --clear
   ```
4. Jika di Android:
   ```bash
   adb shell pm clear com.anonymous.boltexponativewind
   ```

#### Q: Data transaksi hilang setelah install ulang
**Ini normal.** Database SQLite lokal akan dihapus saat uninstall.

**Solusi untuk development:**
1. Export data sebelum uninstall
2. Gunakan cloud backup (future feature)
3. Jangan uninstall development build

#### Q: Bagaimana query database manual?
**Web:**
```javascript
// Di browser DevTools
// Applications -> IndexedDB -> expo-sqlite
// Bisa browse dan lihat data
```

**Android:**
```bash
# Pull database dari device
adb pull /data/data/com.anonymous.boltexponativewind/databases/sakuperantau.db ./

# Buka dengan DB Browser for SQLite
# Download dari: https://sqlitebrowser.org/
```

#### Q: Transaksi tidak muncul setelah input
**Gejala:** Form submit tapi data tidak ada di list

**Solusi:**
1. Refresh halaman (F5)
2. Periksa console log untuk error
3. Cek database langsung (lihat cara query di atas)
4. Pastikan kategori dipilih (tidak null)

---

### Performance & Optimization

#### Q: Aplikasi lambat saat banyak data
**Gejala:** Lag saat scroll transaksi, UI freeze

**Solusi:**
1. Gunakan pagination/infinite scroll (di code, add limit):
   ```typescript
   // Ambil 10 terakhir dulu
   SELECT * FROM records LIMIT 10
   // Kalo scroll, load 10 lebih
   ```
2. Optimize query - gunakan INDEX pada kolom yang sering di-filter
3. Kurangi re-render - gunakan React.memo
4. Implement virtualization untuk FlatList

#### Q: Storage penuh, bagaimana?
**Solusi:**
1. Hapus transaksi lama yang tidak perlu
2. Clear cache aplikasi
3. Export data yang penting kemudian hapus
4. Implementasi data archiving

---

### Mobile-Specific Issues

#### Q: Android: "compileSdkVersion" error
**Gejala:** Gradle build error dengan "compileSdkVersion"

**Solusi:**
1. Pastikan Android SDK API 33 terinstall
2. Set environment variable:
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   ```
3. Rebuild:
   ```bash
   cd android
   ./gradlew clean
   cd ..
   npm run android
   ```

#### Q: iOS: Cocoapods error
**Gejala:** "pod install" gagal

**Solusi:**
```bash
# Update CocoaPods
sudo gem install cocoapods

# Clean dan reinstall
cd ios
rm -rf Pods
pod install
cd ..

npm run ios
```

#### Q: Aplikasi crash saat ambil foto
**Gejala:** Crash saat click profile picture

**Solusi:**
1. Pastikan permission camera sudah diberikan
2. Cek console untuk error detail
3. Update `react-native-image-picker`:
   ```bash
   npm update react-native-image-picker
   ```

---

### Web-Specific Issues

#### Q: "CORS error" saat fetch data
**Gejala:** Network error di browser

**Solusi:**
- Aplikasi ini tidak fetch dari external API
- Jika ada custom API integration, setup CORS di backend
- Gunakan proxy jika develop

#### Q: IndexedDB quota exceeded
**Gejala:** Tidak bisa save data, quota error

**Solusi:**
```javascript
// Di browser console
// Cek storage usage
navigator.storage.estimate().then(estimate => {
  console.log(`Quota: ${estimate.quota}`);
  console.log(`Usage: ${estimate.usage}`);
});

// Bersihkan cache/data yang tidak perlu
// DevTools -> Application -> Clear Site Data
```

#### Q: Aplikasi tidak bekerja offline
**Catatan:** Aplikasi ini tidak support offline mode saat ini.

**Untuk add offline support (future):**
1. Implement Service Worker
2. Cache API responses
3. Sync saat online kembali

---

### Debugging Tips

#### Enable Debug Mode
```bash
# Expose debug info
npm run dev

# Browser console (F12)
// Lihat semua logs
console.log('data:', data);

# React Native DevTools
// Shake device / adb shell input keyevent 82
// Pilih "Show Element Inspector"
```

#### Console Logging Best Practices
```typescript
// Gunakan ini di development
console.log('User registered:', user);
console.error('Database error:', error);
console.warn('Deprecated API usage');

// Jangan di production
console.table(largeArray);  // Performance issue
console.log(credentials);   // Security risk
```

#### Check Network Activity
```javascript
// Browser DevTools -> Network tab
// Lihat semua request/response
// Cek status code, headers, payload
```

---

## 🔧 Common Solutions

### "Module not found" Error
```bash
# Solution 1: Clear node_modules
rm -rf node_modules
npm install

# Solution 2: Check import path
// Wrong
import { useAuth } from './AuthContext';
// Correct
import { useAuth } from '@/context/AuthContext';
```

### TypeScript Compilation Error
```bash
# Check tsconfig.json
npx tsc --noEmit

# Fix: Usually path alias issue
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### StyleSheet Error
```typescript
// Wrong: Variable style
const styles = { color: 'red' };

// Correct: StyleSheet.create
const styles = StyleSheet.create({
  text: { color: 'red' }
});
```

### State Not Updating
```typescript
// Wrong: Mutate state
user.name = 'New Name';

// Correct: Create new object
setUser({ ...user, name: 'New Name' });
```

---

## 📞 Getting More Help

1. **Check Console Logs** (F12 -> Console)
   - Lihat error message
   - Search error message di docs/GitHub

2. **Read Documentation**
   - Expo docs: https://docs.expo.dev/
   - React Native: https://reactnative.dev/
   - SQLite: https://github.com/expo/expo/tree/main/packages/expo-sqlite

3. **Search GitHub Issues**
   - https://github.com/FebrianSuban/DOHIKAPP/issues
   - Cari issue yang sama

4. **Create New Issue**
   - Berikan detail:
     - OS dan version
     - Node.js version
     - Full error message
     - Steps to reproduce
     - Expected vs actual behavior

5. **Contact Developer**
   - GitHub: @FebrianSuban
   - Email: (lihat GitHub profile)

---

**Last Updated:** November 11, 2025  
**Version:** 1.0.0
