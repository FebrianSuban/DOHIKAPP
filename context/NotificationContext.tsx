import React, { createContext, useContext, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

interface NotificationContextType {
  scheduleReminder: (nama: string, date: Date) => Promise<string | null>;
  cancelReminder: (notificationId: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    // Match the full NotificationBehavior type expected by expo-notifications
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    const requestPermissions = async () => {
      if (Platform.OS !== 'web') {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          alert('Izin notifikasi diperlukan untuk pengingat tagihan!');
        }
      }
    };

    requestPermissions();
  }, []);

  const scheduleReminder = async (nama: string, date: Date): Promise<string | null> => {
    if (Platform.OS === 'web') return null;

    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Pengingat Tagihan',
          body: `Pengingat: Tagihan ${nama} jatuh tempo besok`,
          data: { nama },
        },
        // Use a Date trigger input shape required by expo-notifications types
        trigger: {
          // use the exported enum value so TypeScript matches the expected type
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: new Date(date.getTime() - 24 * 60 * 60 * 1000), // 1 day before
        },
      });

      return notificationId;
    } catch (error) {
      console.error('Schedule reminder error:', error);
      return null;
    }
  };

  const cancelReminder = async (notificationId: string): Promise<void> => {
    if (Platform.OS === 'web') return;

    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Cancel reminder error:', error);
    }
  };

  return (
    <NotificationContext.Provider value={{ scheduleReminder, cancelReminder }}>
      {children}
    </NotificationContext.Provider>
  );
};