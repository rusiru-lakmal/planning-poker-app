import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Pressable,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
} from 'react-native-reanimated';
import { RoomCard } from '@/components/RoomCard';
import { useAuth } from '@/contexts/AuthContext';
import { useRoom } from '@/contexts/RoomContext';
import { EmptyState } from '@/components/ui/EmptyState';
import { RoomListSkeleton } from '@/components/ui/LoadingSkeleton';
import { PlanningPokerLogo } from '@/components/ui/PlanningPokerLogo';
import { useTheme } from '@/contexts/ThemeContext';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { myRooms, isLoadingRooms, fetchMyRooms } = useRoom();
  const { currentTheme } = useTheme();
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    fetchMyRooms()
      .catch((err) => {
        console.log('Error loading rooms:', err);
      })
      .finally(() => {
        setInitialLoad(false);
      });
  }, []);

  const handleCreateRoom = () => {
    router.push('/create-room');
  };

  const handleJoinRoom = () => {
    router.push('/join-room');
  };

  const handleRoomPress = (roomId: string) => {
    router.push(`/room/${roomId}` as any);
  };

  // Calculate stats
  const totalRooms = myRooms?.length || 0;
  const activeRooms = myRooms?.filter((r) => r.gameState === 'VOTING').length || 0;
  const completedRooms = myRooms?.filter((r) => r.gameState === 'FINISHED').length || 0;

  const StatCard = ({ icon, label, value, gradient }: any) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    return (
      <Pressable
        onPressIn={() => (scale.value = withSpring(0.95))}
        onPressOut={() => (scale.value = withSpring(1))}
        style={{ flex: 1 }}
      >
        <Animated.View style={[styles.statCard, animatedStyle]}>
          <LinearGradient
            colors={gradient}
            style={styles.statGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.statIcon}>{icon}</Text>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
          </LinearGradient>
        </Animated.View>
      </Pressable>
    );
  };

  if (initialLoad && isLoadingRooms) {
    return (
      <LinearGradient
        colors={currentTheme.colors.background as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <RoomListSkeleton />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={currentTheme.colors.background as any}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoadingRooms && !initialLoad}
              onRefresh={fetchMyRooms}
              tintColor="#8B5CF6"
            />
          }
        >
          {/* Premium Header */}
          <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
            <View style={styles.headerContent}>
              <View>
                <Text style={styles.greeting}>Welcome back,</Text>
                <Text style={styles.userName}>{user?.name || 'User'}! 👋</Text>
              </View>
              <PlanningPokerLogo size={56} animated={false} />
            </View>
          </Animated.View>

          {/* Stats Dashboard */}
          {totalRooms > 0 && (
            <Animated.View entering={FadeInDown.delay(200)} style={styles.statsContainer}>
              <Text style={styles.sectionTitle}>📊 Your Statistics</Text>
              <View style={styles.statsGrid}>
                <StatCard
                  icon="🏠"
                  label="Total Rooms"
                  value={totalRooms}
                  gradient={['rgba(139, 92, 246, 0.8)', 'rgba(124, 58, 237, 0.8)']}
                />
                <StatCard
                  icon="⏳"
                  label="Active"
                  value={activeRooms}
                  gradient={['rgba(245, 158, 11, 0.8)', 'rgba(251, 146, 60, 0.8)']}
                />
                <StatCard
                  icon="✅"
                  label="Completed"
                  value={completedRooms}
                  gradient={['rgba(16, 185, 129, 0.8)', 'rgba(5, 150, 105, 0.8)']}
                />
              </View>
            </Animated.View>
          )}

          {/* Quick Actions */}
          <Animated.View entering={FadeInDown.delay(300)} style={styles.actionsSection}>
            <Text style={styles.sectionTitle}>🚀 Quick Actions</Text>
            <View style={styles.actionsGrid}>
              <Pressable onPress={handleCreateRoom} style={styles.actionCard}>
                <LinearGradient
                  colors={['rgba(139, 92, 246, 0.15)', 'rgba(236, 72, 153, 0.15)']}
                  style={styles.actionGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.actionIconContainer}>
                    <Text style={styles.actionIcon}>➕</Text>
                  </View>
                  <Text style={styles.actionTitle}>Create Room</Text>
                  <Text style={styles.actionSubtitle}>Start new session</Text>
                </LinearGradient>
              </Pressable>

              <Pressable onPress={handleJoinRoom} style={styles.actionCard}>
                <LinearGradient
                  colors={['rgba(99, 102, 241, 0.15)', 'rgba(139, 92, 246, 0.15)']}
                  style={styles.actionGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.actionIconContainer}>
                    <Text style={styles.actionIcon}>🚪</Text>
                  </View>
                  <Text style={styles.actionTitle}>Join Room</Text>
                  <Text style={styles.actionSubtitle}>Enter with code</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </Animated.View>

          {/* My Rooms Section */}
          <Animated.View entering={FadeInDown.delay(400)} style={styles.roomsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🏠 My Rooms</Text>
              {totalRooms > 0 && (
                <Text style={styles.roomCount}>{totalRooms} room{totalRooms !== 1 ? 's' : ''}</Text>
              )}
            </View>

            {isLoadingRooms && !initialLoad ? (
              <RoomListSkeleton />
            ) : totalRooms === 0 ? (
              <EmptyState
                emoji="📭"
                title="No Rooms Yet"
                subtitle="Create or join a room to get started with Planning Poker!"
                actionLabel="Create Your First Room"
                onAction={handleCreateRoom}
              />
            ) : (
              <View style={styles.roomsList}>
                {myRooms?.map((room, index) => (
                  <Animated.View
                    key={`room-${room.id}`}
                    entering={FadeInDown.delay(500 + index * 50)}
                  >
                    <RoomCard
                      room={room}
                      onPress={() => handleRoomPress(room.id)}
                    />
                  </Animated.View>
                ))}
              </View>
            )}
          </Animated.View>
        </ScrollView>
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
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  userName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 4,
  },
  statsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statGradient: {
    padding: 16,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  actionsSection: {
    marginBottom: 24,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionGradient: {
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 16,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionIcon: {
    fontSize: 24,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  roomsSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  roomCount: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '700',
  },
  roomsList: {
    gap: 16,
  },
});
