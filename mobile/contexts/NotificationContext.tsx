import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';
import { useAuth } from './AuthContext';
import { db } from '@/services/firebaseConfig';
import { doc, updateDoc, onSnapshot, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { router } from 'expo-router';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface NotificationContextType {
  expoPushToken: string | undefined;
  notification: Notifications.Notification | undefined;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>(undefined);
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (data?.roomId) {
        router.push(`/room/${data.roomId}`);
      }
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  // Save token to user profile when authenticated
  useEffect(() => {
    if (user && expoPushToken) {
      const saveToken = async () => {
        try {
          const userRef = doc(db, 'users', user.id);
          await updateDoc(userRef, {
            expoPushToken: expoPushToken
          });
        } catch (error) {
          console.error("Error saving push token:", error);
        }
      };
      saveToken();
    }
  }, [user, expoPushToken]);

  // Listen for in-app notifications from Firestore
  useEffect(() => {
    if (!user) return;

    console.log('[NotificationContext] Setting up listener for user:', user.id);

    const q = query(
      collection(db, 'users', user.id, 'notifications'),
      where('read', '==', false),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('[NotificationContext] Snapshot received, changes:', snapshot.docChanges().length);
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const notifData = change.doc.data();
          console.log('[NotificationContext] New notification:', notifData);
          
          // Schedule a local notification if the app is open
          Notifications.scheduleNotificationAsync({
            content: {
              title: notifData.title,
              body: notifData.body,
              data: notifData.data,
            },
            trigger: null, // Show immediately
          }).then(() => {
            console.log('[NotificationContext] Local notification scheduled');
          }).catch(err => {
            console.error('[NotificationContext] Error scheduling notification:', err);
          });
          
          // DON'T mark as read automatically - let the user dismiss it manually
          // This way it will show in the bell icon notification list
          // updateDoc(change.doc.ref, { read: true }).catch(err => {
          //   console.error('[NotificationContext] Error marking as read:', err);
          // });
        }
      });
    }, (error) => {
      console.error('[NotificationContext] Snapshot error:', error);
      console.error('[NotificationContext] This might be due to missing Firestore index');
    });

    return () => unsubscribe();
  }, [user]);

  const value = {
    expoPushToken,
    notification
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      // Alert.alert('Failed to get push token for push notification!');
      console.log('Failed to get push token for push notification!');
      return;
    }
    
    // Get the token that uniquely identifies this device
    try {
      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log("Expo Push Token:", token);
    } catch (e) {
      console.error("Error getting push token:", e);
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}
