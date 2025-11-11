# API Reference - DOHIKAPP

Dokumentasi lengkap mengenai API, Context, dan Services yang tersedia di DOHIKAPP.

## 📚 Table of Contents

- [Authentication API](#authentication-api)
- [Database API](#database-api)
- [Notification API](#notification-api)
- [Data Types](#data-types)
- [Examples](#examples)

---

## 🔐 Authentication API

### Overview
Module autentikasi menangani login, registrasi, dan session management.

### useAuth Hook

#### Import
```typescript
import { useAuth } from '@/context/AuthContext';
```

#### Properties
```typescript
interface AuthContextType {
  user: User | null;              // User saat ini atau null
  loading: boolean;               // Status loading
  login: (email: string, password: string) => Promise<boolean>;
  register: (namaLengkap: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<boolean>;
  updatePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
}
```

### Methods

#### login(email, password)
Melakukan login pengguna.

```typescript
const { login } = useAuth();

const handleLogin = async () => {
  const success = await login('user@example.com', 'password123');
  if (success) {
    console.log('Login berhasil');
    // Navigate ke home
  } else {
    console.log('Login gagal - email atau password salah');
  }
};
```

**Parameters:**
- `email` (string): Email pengguna (required)
- `password` (string): Password pengguna (required, min 6 karakter)

**Returns:** Promise<boolean>
- `true` - Login berhasil
- `false` - Login gagal (email/password salah atau database error)

**Throws:** Tidak throw error, cek return value

---

#### register(namaLengkap, email, password)
Membuat akun pengguna baru.

```typescript
const { register } = useAuth();

const handleRegister = async () => {
  const success = await register(
    'John Doe',
    'john@example.com',
    'password123'
  );
  
  if (success) {
    console.log('Registrasi berhasil');
  } else {
    console.log('Registrasi gagal - email mungkin sudah terdaftar');
  }
};
```

**Parameters:**
- `namaLengkap` (string): Nama lengkap user (required, non-empty)
- `email` (string): Email user (required, unique, valid format)
- `password` (string): Password user (required, min 6 karakter)

**Returns:** Promise<boolean>
- `true` - Registrasi berhasil
- `false` - Email sudah terdaftar atau database error

**Validation:**
- Email harus format valid (xxx@xxx.xxx)
- Password minimal 6 karakter
- Nama tidak boleh kosong

---

#### logout()
Logout pengguna saat ini.

```typescript
const { logout } = useAuth();

const handleLogout = async () => {
  await logout();
  // User akan null dan AsyncStorage cleared
  // Navigate ke auth screen
};
```

**Returns:** Promise<void>

---

#### updateUser(userData)
Update informasi profil pengguna.

```typescript
const { updateUser, user } = useAuth();

const handleUpdateProfile = async () => {
  const updated = await updateUser({
    nama_lengkap: 'Jane Doe',
    foto_profil: 'path/to/image.jpg'
  });
  
  if (updated) {
    console.log('Profil updated');
  }
};
```

**Parameters:**
- `userData` (Partial<User>): Partial user object dengan field yang ingin diupdate
  - `nama_lengkap` (optional)
  - `foto_profil` (optional)
  - `email` (tidak bisa diubah)
  - `id` (tidak bisa diubah)

**Returns:** Promise<boolean>
- `true` - Update berhasil
- `false` - Update gagal

---

#### updatePassword(oldPassword, newPassword)
Mengubah password pengguna.

```typescript
const { updatePassword } = useAuth();

const handleChangePassword = async () => {
  const success = await updatePassword(
    'oldPassword123',
    'newPassword456'
  );
  
  if (success) {
    console.log('Password changed successfully');
  } else {
    console.log('Old password is incorrect');
  }
};
```

**Parameters:**
- `oldPassword` (string): Password lama (harus benar)
- `newPassword` (string): Password baru (min 6 karakter, tidak boleh sama dengan old)

**Returns:** Promise<boolean>
- `true` - Password berhasil diubah
- `false` - Old password salah

---

## 🗄️ Database API

### Overview
Database management menggunakan SQLite melalui expo-sqlite.

### useDatabase Hook

#### Import
```typescript
import { useDatabase } from '@/context/DatabaseContext';
```

#### Properties
```typescript
interface DatabaseContextType {
  db: SQLite.SQLiteDatabase | null;
  isReady: boolean;
}
```

### Usage Pattern

```typescript
import { useDatabase } from '@/context/DatabaseContext';

export default function MyComponent() {
  const { db, isReady } = useDatabase();
  
  // Always check isReady sebelum menggunakan db
  if (!isReady || !db) {
    return <Text>Loading database...</Text>;
  }
  
  // Sekarang aman menggunakan db
  // ...
}
```

### Database Methods

#### db.execAsync(sql)
Menjalankan SQL statements (multiple).

```typescript
const { db } = useDatabase();

await db.execAsync(`
  DELETE FROM records WHERE tanggal < '2025-01-01';
  DELETE FROM reminders WHERE is_active = 0;
`);
```

#### db.runAsync(sql, params)
Menjalankan INSERT, UPDATE, DELETE.

```typescript
const { db } = useDatabase();

// INSERT
const result = await db.runAsync(
  'INSERT INTO categories (nama, type) VALUES (?, ?)',
  ['Bonus', 'income']
);

console.log(result.lastInsertRowId);  // ID kategori baru
console.log(result.changes);           // Jumlah row yang diubah

// UPDATE
await db.runAsync(
  'UPDATE users SET nama_lengkap = ? WHERE id = ?',
  ['New Name', userId]
);

// DELETE
await db.runAsync(
  'DELETE FROM records WHERE id = ?',
  [recordId]
);
```

**Parameters:**
- `sql` (string): SQL statement
- `params` (array): Parameter values (gunakan ? untuk placeholder)

**Returns:** Object dengan properties:
- `lastInsertRowId` - ID dari row yang di-insert (untuk INSERT)
- `changes` - Jumlah row yang dimodifikasi

#### db.getFirstAsync(sql, params)
Mengambil satu row pertama.

```typescript
const { db } = useDatabase();

// Get user by email
const user = await db.getFirstAsync(
  'SELECT id, nama_lengkap, email FROM users WHERE email = ?',
  [email]
) as User | null;

if (user) {
  console.log('User found:', user.nama_lengkap);
} else {
  console.log('User not found');
}
```

**Returns:** Object atau null

#### db.getAllAsync(sql, params)
Mengambil semua rows yang match.

```typescript
const { db } = useDatabase();

// Get all transactions for user
const records = await db.getAllAsync(
  `SELECT r.*, c.nama as category_name 
   FROM records r 
   JOIN categories c ON r.category_id = c.id 
   WHERE r.user_id = ? 
   ORDER BY r.tanggal DESC`,
  [userId]
) as Record[];

console.log(`Found ${records.length} transactions`);
```

**Returns:** Array of objects

### Common Queries

#### Get User by ID
```typescript
const user = await db?.getFirstAsync(
  'SELECT * FROM users WHERE id = ?',
  [userId]
);
```

#### Get All Transactions for User
```typescript
const records = await db?.getAllAsync(
  `SELECT r.*, c.nama as category_name 
   FROM records r 
   JOIN categories c ON r.category_id = c.id 
   WHERE r.user_id = ? AND r.tanggal >= date(?)
   ORDER BY r.tanggal DESC`,
  [userId, startDate]
);
```

#### Get Summary (Total Income/Expense)
```typescript
const summary = await db?.getFirstAsync(
  `SELECT 
    COALESCE(SUM(CASE WHEN type='income' THEN amount ELSE 0 END), 0) as totalIncome,
    COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END), 0) as totalExpense
   FROM records 
   WHERE user_id = ? AND strftime('%Y-%m', tanggal) = ?`,
  [userId, '2025-11']
);
```

---

## 🔔 Notification API

### Overview
Push notifications dan local reminders untuk tagihan.

### useNotification (Conceptual)

```typescript
// NotificationContext berisi:
- requestPermissions()
- scheduleReminder(title, date)
- cancelNotification(id)
```

### Common Patterns

#### Schedule Reminder
```typescript
import * as Notifications from 'expo-notifications';

// Setup handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Schedule
const notificationId = await Notifications.scheduleNotificationAsync({
  content: {
    title: 'Tagihan Jatuh Tempo',
    body: 'Tagihan Internet akan jatuh tempo besok',
  },
  trigger: {
    type: 'date',
    date: new Date(2025, 10, 20, 9, 0, 0), // 20 Nov 2025 pukul 09:00
  },
});
```

---

## 📊 Data Types

### User
```typescript
interface User {
  id: number;                    // Primary key
  nama_lengkap: string;         // Full name
  email: string;                // Email (unique)
  foto_profil?: string;         // Profile photo path/URL (optional)
  created_at?: string;          // ISO timestamp
}
```

### Category
```typescript
interface Category {
  id: number;
  nama: string;                 // Category name
  type: 'income' | 'expense';  // Type
  is_default: number;           // 1 = default, 0 = custom
  created_at?: string;
}
```

### Record (Transaction)
```typescript
interface Record {
  id: number;
  user_id: number;              // Foreign key to users
  category_id: number;          // Foreign key to categories
  amount: number;               // Amount (positive)
  type: 'income' | 'expense';  // Type
  catatan?: string;             // Notes/description
  tanggal: string;              // Date (YYYY-MM-DD)
  created_at?: string;          // ISO timestamp
}
```

### Reminder
```typescript
interface Reminder {
  id: number;
  user_id: number;              // Foreign key to users
  nama_tagihan: string;         // Bill name
  tanggal_jatuh_tempo: string; // Due date (YYYY-MM-DD)
  is_active: number;            // 1 = active, 0 = inactive
  created_at?: string;
}
```

### Auth Context Type
```typescript
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (namaLengkap: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<boolean>;
  updatePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
}
```

---

## 💡 Examples

### Complete Login Flow
```typescript
import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert } from 'react-native';
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Email dan password harus diisi');
      return;
    }
    
    setLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        // Navigate ke home (router.replace('/(tabs)'))
        Alert.alert('Success', 'Login berhasil');
      } else {
        Alert.alert('Error', 'Email atau password salah');
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <View>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button
        title={loading ? 'Loading...' : 'Login'}
        onPress={handleLogin}
        disabled={loading}
      />
    </View>
  );
}
```

### Get and Display User Transactions
```typescript
import { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useDatabase } from '@/context/DatabaseContext';

export default function TransactionsList() {
  const { user } = useAuth();
  const { db, isReady } = useDatabase();
  const [transactions, setTransactions] = useState([]);
  
  useEffect(() => {
    if (!isReady || !db || !user) return;
    
    const loadTransactions = async () => {
      const result = await db.getAllAsync(
        `SELECT r.*, c.nama as category_name
         FROM records r
         JOIN categories c ON r.category_id = c.id
         WHERE r.user_id = ?
         ORDER BY r.tanggal DESC
         LIMIT 10`,
        [user.id]
      );
      setTransactions(result || []);
    };
    
    loadTransactions();
  }, [isReady, db, user]);
  
  return (
    <FlatList
      data={transactions}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View>
          <Text>{item.category_name}</Text>
          <Text>Rp {item.amount.toLocaleString('id-ID')}</Text>
          <Text>{item.tanggal}</Text>
        </View>
      )}
    />
  );
}
```

### Create New Transaction
```typescript
import { useAuth } from '@/context/AuthContext';
import { useDatabase } from '@/context/DatabaseContext';

async function createTransaction(
  categoryId: number,
  amount: number,
  type: 'income' | 'expense',
  tanggal: string,
  catatan?: string
) {
  const { user } = useAuth();
  const { db } = useDatabase();
  
  if (!user || !db) return false;
  
  try {
    const result = await db.runAsync(
      `INSERT INTO records 
       (user_id, category_id, amount, type, catatan, tanggal)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user.id, categoryId, amount, type, catatan || null, tanggal]
    );
    
    return result.lastInsertRowId > 0;
  } catch (error) {
    console.error('Error creating transaction:', error);
    return false;
  }
}
```

---

**Last Updated:** November 11, 2025  
**API Version:** 1.0.0
