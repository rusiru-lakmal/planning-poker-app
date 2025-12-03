import React, { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, router, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { RoomProvider } from '@/contexts/RoomContext';
import { ThemeProvider as DynamicThemeProvider } from '@/contexts/ThemeContext';
import { NotificationProvider } from '@/contexts/NotificationContext';

function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    console.log('[RootNavigator] Auth state:', { isLoading, isAuthenticated, pathname });
    
    if (isLoading) {
      return; // Wait for auth to load
    }
    
    // Redirect to login if not authenticated
    if (!isAuthenticated && pathname !== '/login' && pathname !== '/signup') {
      console.log('[RootNavigator] Not authenticated, redirecting to login');
      router.replace('/login');
      return;
    }
    
    // Redirect authenticated users away from auth screens
    if (isAuthenticated && (pathname === '/login' || pathname === '/signup' || pathname === '/')) {
      console.log('[RootNavigator] Authenticated, redirecting to tabs');
      router.replace('/(tabs)');
    }
  }, [isLoading, isAuthenticated, pathname]);

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="create-room" options={{ presentation: 'modal', title: 'Create Room', headerShown: true }} />
      <Stack.Screen name="join-room" options={{ presentation: 'modal', title: 'Join Room', headerShown: true }} />
      <Stack.Screen name="room/[id]" options={{ title: 'Room', headerShown: true }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SafeAreaProvider>
        <DynamicThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              <RoomProvider>
                <RootNavigator />
                <StatusBar style="auto" />
              </RoomProvider>
            </NotificationProvider>
          </AuthProvider>
        </DynamicThemeProvider>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
