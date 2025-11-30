import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useColorScheme,
  Alert,
  Switch,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRoom } from '@/contexts/RoomContext';
import { AnimatedBackground } from '@/components/game/AnimatedBackground';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

export default function JoinRoomScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { joinRoomByCode } = useRoom();
  const { currentTheme } = useTheme();

  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSpectator, setIsSpectator] = useState(false);

  const scale = useSharedValue(1);

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) {
      setError('Room code is required');
      // Shake animation
      scale.value = withSequence(
        withSpring(1.02),
        withSpring(0.98),
        withSpring(1)
      );
      return;
    }

    setLoading(true);
    try {
      const room = await joinRoomByCode(roomCode.trim().toUpperCase(), isSpectator ? 'spectator' : 'player');
      
      // Navigate to the room
      router.replace(`/room/${room.id}`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <LinearGradient
      colors={currentTheme.colors.background as any}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <Animated.View style={[styles.card, animatedCardStyle]}>
              <LinearGradient
                colors={['rgba(139, 92, 246, 0.15)', 'rgba(236, 72, 153, 0.15)']}
                style={styles.cardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.header}>
                  <Text style={styles.emoji}>🚪</Text>
                  <Text style={[styles.title, isDark && styles.textDark]}>
                    Join Room
                  </Text>
                  <Text style={[styles.subtitle, isDark && styles.textDark]}>
                    Enter the room code to join
                  </Text>
                </View>

                <View style={styles.form}>
                  <Input
                    label="Room Code"
                    placeholder="Enter room code"
                    value={roomCode}
                    onChangeText={(text) => {
                      setRoomCode(text.toUpperCase());
                      setError('');
                    }}
                    error={error}
                    autoFocus
                    autoCapitalize="characters"
                    maxLength={6}
                  />

                  <View style={styles.switchContainer}>
                    <LinearGradient
                      colors={['rgba(139, 92, 246, 0.1)', 'rgba(236, 72, 153, 0.1)']}
                      style={styles.switchCard}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={[styles.switchLabel, isDark && styles.textDark]}>
                        👀 Join as Spectator
                      </Text>
                      <Switch
                        value={isSpectator}
                        onValueChange={setIsSpectator}
                        trackColor={{ false: '#374151', true: '#8B5CF6' }}
                        thumbColor={isSpectator ? '#EC4899' : '#D1D5DB'}
                        ios_backgroundColor="#374151"
                      />
                    </LinearGradient>
                  </View>

                  <Button
                    title="Join Room"
                    onPress={handleJoinRoom}
                    loading={loading}
                    style={styles.button}
                  />

                  <Button
                    title="Cancel"
                    onPress={() => router.back()}
                    variant="outline"
                    disabled={loading}
                  />
                </View>
              </LinearGradient>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
  },
  cardGradient: {
    padding: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    color: '#D1D5DB',
    textAlign: 'center',
    fontWeight: '500',
  },
  textDark: {
    color: '#FFFFFF',
  },
  form: {
    width: '100%',
  },
  button: {
    marginBottom: 12,
  },
  switchContainer: {
    marginBottom: 24,
  },
  switchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.025)',
  },
  switchLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
