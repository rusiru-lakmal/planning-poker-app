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

function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated && pathname === '/') {
      router.replace('/login');
    }
    
    // Redirect authenticated users to tabs if they're on auth screens
    if (!isLoading && isAuthenticated && (pathname === '/login' || pathname === '/signup' || pathname === '/')) {
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
            <RoomProvider>
              <RootNavigator />
              <StatusBar style="auto" />
            </RoomProvider>
          </AuthProvider>
        </DynamicThemeProvider>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
