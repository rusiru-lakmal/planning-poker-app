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
  Modal,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useRouter, useFocusEffect } from 'expo-router';
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
  const { myRooms, isLoadingRooms, fetchMyRooms, joinRoomById, deleteRoom } = useRoom();
  const { currentTheme } = useTheme();
  const [initialLoad, setInitialLoad] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  useEffect(() => {
    fetchMyRooms()
      .catch((err) => {
        console.log('Error loading rooms:', err);
      })
      .finally(() => {
        setInitialLoad(false);
      });
  }, []);

  // Fetch notifications
  useEffect(() => {
    if (!user) return;
    
    const fetchNotifications = async () => {
      try {
        console.log('[HomeScreen] Fetching notifications for user:', user.id);
        const { collection, query, where, orderBy, limit, getDocs } = await import('firebase/firestore');
        const { db } = await import('@/services/firebaseConfig');
        
        // Try with orderBy first
        try {
          const q = query(
            collection(db, 'users', user.id, 'notifications'),
            where('read', '==', false),
            orderBy('createdAt', 'desc'),
            limit(5)
          );
          
          const snapshot = await getDocs(q);
          const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          console.log('[HomeScreen] Fetched notifications:', notifs.length, notifs);
          setNotifications(notifs);
        } catch (indexError: any) {
          console.log('[HomeScreen] orderBy failed, trying without it:', indexError.message);
          // Fallback: fetch without orderBy if index doesn't exist
          const q = query(
            collection(db, 'users', user.id, 'notifications'),
            where('read', '==', false),
            limit(5)
          );
          
          const snapshot = await getDocs(q);
          const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          console.log('[HomeScreen] Fetched notifications (no orderBy):', notifs.length, notifs);
          setNotifications(notifs);
        }
      } catch (error) {
        console.error('[HomeScreen] Error fetching notifications:', error);
      }
    };
    
    fetchNotifications();
  }, [user]);

  // Refetch notifications when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (!user) return;
      
      const fetchNotifications = async () => {
        try {
          console.log('[HomeScreen] Refetching notifications on focus for user:', user.id);
          const { collection, query, where, orderBy, limit, getDocs } = await import('firebase/firestore');
          const { db } = await import('@/services/firebaseConfig');
          
          try {
            const q = query(
              collection(db, 'users', user.id, 'notifications'),
              where('read', '==', false),
              orderBy('createdAt', 'desc'),
              limit(5)
            );
            
            const snapshot = await getDocs(q);
            const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log('[HomeScreen] Refetched notifications:', notifs.length, notifs);
            setNotifications(notifs);
          } catch (indexError: any) {
            console.log('[HomeScreen] orderBy failed on refetch, trying without it');
            const q = query(
              collection(db, 'users', user.id, 'notifications'),
              where('read', '==', false),
              limit(5)
            );
            
            const snapshot = await getDocs(q);
            const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log('[HomeScreen] Refetched notifications (no orderBy):', notifs.length);
            setNotifications(notifs);
          }
        } catch (error) {
          console.error('[HomeScreen] Error refetching notifications:', error);
        }
      };
      
      fetchNotifications();
    }, [user])
  );

  const handleAcceptInvite = async (notification: any) => {
    try {
      const roomId = notification.data?.roomId;
      if (roomId) {
        await joinRoomById(roomId);
        router.push(`/room/${roomId}`);
        
        // Mark notification as read
        const { doc, updateDoc } = await import('firebase/firestore');
        const { db } = await import('@/services/firebaseConfig');
        await updateDoc(doc(db, 'users', user!.id, 'notifications', notification.id), { read: true });
        
        // Remove from list
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }
    } catch (error) {
      console.error('Error accepting invite:', error);
      Alert.alert('Error', 'Failed to join room');
    }
  };

  const handleDismissNotification = async (notification: any) => {
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('@/services/firebaseConfig');
      await updateDoc(doc(db, 'users', user!.id, 'notifications', notification.id), { read: true });
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

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
  const completedRooms = myRooms?.filter((r) => r.gameState === 'REVEALED').length || 0;

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
              <View style={styles.headerRight}>
                {/* Notification Bell - Always visible */}
                <Pressable 
                  style={styles.bellContainer} 
                  onPress={() => setShowNotificationsModal(true)}
                >
                  <Text style={styles.bellIcon}>🔔</Text>
                  {notifications.length > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{notifications.length}</Text>
                    </View>
                  )}
                </Pressable>
                <PlanningPokerLogo size={56} animated={false} />
              </View>
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

          {/* Notifications */}
          {notifications.length > 0 && (
            <Animated.View entering={FadeInDown.delay(250)} style={styles.notificationsSection}>
              <Text style={styles.sectionTitle}>🔔 Notifications</Text>
              {notifications.map((notif, index) => (
                <Animated.View 
                  key={notif.id}
                  entering={FadeInDown.delay(300 + index * 50)}
                  style={styles.notificationCard}
                >
                  <LinearGradient
                    colors={['rgba(139, 92, 246, 0.1)', 'rgba(236, 72, 153, 0.1)']}
                    style={styles.notificationGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.notificationContent}>
                      <Text style={styles.notificationTitle}>{notif.title}</Text>
                      <Text style={styles.notificationBody}>{notif.body}</Text>
                    </View>
                    <View style={styles.notificationActions}>
                      <TouchableOpacity 
                        onPress={() => handleAcceptInvite(notif)}
                        style={styles.acceptButton}
                      >
                        <Text style={styles.acceptButtonText}>Accept</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={() => handleDismissNotification(notif)}
                        style={styles.dismissButton}
                      >
                        <Text style={styles.dismissButtonText}>Dismiss</Text>
                      </TouchableOpacity>
                    </View>
                  </LinearGradient>
                </Animated.View>
              ))}
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
                      onDelete={deleteRoom}
                    />
                  </Animated.View>
                ))}
              </View>
            )}
          </Animated.View>
        </ScrollView>
        
        {/* Notifications Modal */}
        <Modal
          visible={showNotificationsModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowNotificationsModal(false)}
        >
          <Pressable 
            style={styles.modalOverlay} 
            onPress={() => setShowNotificationsModal(false)}
          >
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          </Pressable>
          
          <View style={styles.modalContainer} pointerEvents="box-none">
            <Pressable style={{flex: 1}} onPress={() => setShowNotificationsModal(false)} />
            <Animated.View entering={FadeInDown.duration(300)} style={styles.modalContent}>
              <LinearGradient
                colors={currentTheme.colors.cardBg as any}
                style={styles.modalGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>🔔 Notifications</Text>
                  <Pressable onPress={() => setShowNotificationsModal(false)}>
                    <Text style={styles.closeButton}>✕</Text>
                  </Pressable>
                </View>
                
                <ScrollView style={styles.modalScroll}>
                  {notifications.length === 0 ? (
                    <View style={styles.emptyNotifications}>
                      <Text style={styles.emptyIcon}>📭</Text>
                      <Text style={styles.emptyText}>No new notifications</Text>
                    </View>
                  ) : (
                    notifications.map((notif, index) => (
                      <View key={notif.id} style={styles.modalNotificationCard}>
                        <View style={styles.notificationContent}>
                          <Text style={styles.notificationTitle}>{notif.title}</Text>
                          <Text style={styles.notificationBody}>{notif.body}</Text>
                        </View>
                        <View style={styles.notificationActions}>
                          <TouchableOpacity 
                            onPress={() => {
                              handleAcceptInvite(notif);
                              setShowNotificationsModal(false);
                            }}
                            style={styles.acceptButton}
                          >
                            <Text style={styles.acceptButtonText}>Accept</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            onPress={() => handleDismissNotification(notif)}
                            style={styles.dismissButton}
                          >
                            <Text style={styles.dismissButtonText}>Dismiss</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))
                  )}
                </ScrollView>
              </LinearGradient>
            </Animated.View>
            <Pressable style={{flex: 1}} onPress={() => setShowNotificationsModal(false)} />
          </View>
        </Modal>
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bellContainer: {
    position: 'relative',
    padding: 8,
  },
  bellIcon: {
    fontSize: 28,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: '#0F172A',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
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
  notificationsSection: {
    marginBottom: 24,
  },
  notificationCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  notificationGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 16,
  },
  notificationContent: {
    marginBottom: 12,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  notificationBody: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  notificationActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  dismissButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  dismissButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 24,
    overflow: 'hidden',
    maxHeight: '70%',
  },
  modalGradient: {
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  closeButton: {
    fontSize: 28,
    color: '#9CA3AF',
    fontWeight: '300',
  },
  modalScroll: {
    maxHeight: 400,
  },
  emptyNotifications: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  modalNotificationCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
});
