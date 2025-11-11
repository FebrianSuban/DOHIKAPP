import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDatabase } from './DatabaseContext';
import * as Crypto from 'expo-crypto';

interface User {
  id: number;
  nama_lengkap: string;
  email: string;
  foto_profil?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (namaLengkap: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<boolean>;
  updatePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { db, isReady } = useDatabase();

  const hashPassword = async (password: string): Promise<string> => {
    return await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      password,
      { encoding: Crypto.CryptoEncoding.HEX }
    );
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    if (!db) return false;

    try {
      const hashedPassword = await hashPassword(password);
      const result = await db.getFirstAsync(
        'SELECT id, nama_lengkap, email, foto_profil FROM users WHERE email = ? AND password_hash = ?',
        [email, hashedPassword]
      ) as User | null;

      if (result) {
        setUser(result);
        await AsyncStorage.setItem('userId', result.id.toString());
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (namaLengkap: string, email: string, password: string): Promise<boolean> => {
    if (!db) return false;

    try {
      const hashedPassword = await hashPassword(password);
      const result = await db.runAsync(
        'INSERT INTO users (nama_lengkap, email, password_hash) VALUES (?, ?, ?)',
        [namaLengkap, email, hashedPassword]
      );

      if (result.lastInsertRowId) {
        const newUser: User = {
          id: result.lastInsertRowId as number,
          nama_lengkap: namaLengkap,
          email: email,
        };
        setUser(newUser);
        await AsyncStorage.setItem('userId', newUser.id.toString());
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    setUser(null);
    await AsyncStorage.removeItem('userId');
  };

  const updateUser = async (userData: Partial<User>): Promise<boolean> => {
    if (!db || !user) return false;

    try {
      const fields = Object.keys(userData).filter(key => key !== 'id');
      const values = fields.map(field => userData[field as keyof User]);
      const setClause = fields.map(field => `${field} = ?`).join(', ');

      // Ensure bind parameters don't contain `undefined` which breaks SQLite typings
      const bindParams: any[] = [...values.map(v => (v === undefined ? null : v)), user.id];
      await db.runAsync(
        `UPDATE users SET ${setClause} WHERE id = ?`,
        bindParams
      );

      setUser({ ...user, ...userData });
      return true;
    } catch (error) {
      console.error('Update user error:', error);
      return false;
    }
  };

  const updatePassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
    if (!db || !user) return false;

    try {
      const oldHashedPassword = await hashPassword(oldPassword);
      const result = await db.getFirstAsync(
        'SELECT id FROM users WHERE id = ? AND password_hash = ?',
        [user.id, oldHashedPassword]
      );

      if (!result) return false;

      const newHashedPassword = await hashPassword(newPassword);
      await db.runAsync(
        'UPDATE users SET password_hash = ? WHERE id = ?',
        [newHashedPassword, user.id]
      );

      return true;
    } catch (error) {
      console.error('Update password error:', error);
      return false;
    }
  };

  useEffect(() => {
    const checkAuthState = async () => {
      if (!isReady || !db) return;

      try {
        const userId = await AsyncStorage.getItem('userId');
        if (userId) {
          const result = await db.getFirstAsync(
            'SELECT id, nama_lengkap, email, foto_profil FROM users WHERE id = ?',
            [userId]
          ) as User | null;

          if (result) {
            setUser(result);
          }
        }
      } catch (error) {
        console.error('Check auth state error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthState();
  }, [isReady, db]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};