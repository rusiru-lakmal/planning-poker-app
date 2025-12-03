import { PokerScreen } from '@/components/game/PokerScreen';
import { RoomSettingsModal } from '@/components/room/RoomSettingsModal';
import { Button } from '@/components/ui/button';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { PlanningPokerLogo } from '@/components/ui/PlanningPokerLogo';
import { useAuth } from '@/contexts/AuthContext';
import { useRoom } from '@/contexts/RoomContext';
import { useTheme } from '@/contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    View
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { InviteUsersModal } from '@/components/room/InviteUsersModal';

export default function RoomScreen() {
  const { currentTheme } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { currentRoom, participants, joinRoomById, leaveRoom, updateSettings, startVoting } = useRoom();
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const handleUpdateSettings = (settings: any) => {
    if (currentRoom?.id) {
      updateSettings(settings);
    }
  };

  useEffect(() => {
    if (id && user) {
      const loadRoom = async () => {
        try {
          setLoading(true);
          await joinRoomById(id);
        } catch (error: any) {
          Alert.alert('Error', error.message || 'Failed to load room');
          router.back();
        } finally {
          setLoading(false);
        }
      };
      
      loadRoom();
    }
  }, [id, user]);

  const handleShareCode = async () => {
    if (!currentRoom) return;
    try {
      await Share.share({
        message: `Join my Planning Poker session!\\nRoom: ${currentRoom.name}\\nCode: ${currentRoom.code}`,
      });
    } catch (error) {
      console.error('Error sharing room code:', error);
    }
  };

  const handleLeaveRoom = () => {
    Alert.alert(
      'Leave Room',
      'Are you sure you want to leave this room?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => {
            leaveRoom();
            router.back();
          },
        },
      ]
    );
  };

  const handleStartGame = () => {
    console.log('[RoomScreen] Start Voting button clicked');
    if (currentRoom?.id) {
      console.log('[RoomScreen] Starting voting for room:', currentRoom.id);
      try {
        startVoting();
        console.log('[RoomScreen] startVoting called');
      } catch (error) {
        console.error('[RoomScreen] Error calling startVoting:', error);
      }
    } else {
      console.error('[RoomScreen] Cannot start voting: currentRoom.id is missing', currentRoom);
    }
  };

  const isHost = currentRoom?.hostUserId === user?.id;

  if (loading || !currentRoom) {
    return (
      <LinearGradient
        colors={currentTheme.colors.background as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.loadingContainer}>
          <PlanningPokerLogo size={100} animated={true} />
          <LoadingSkeleton width="80%" height={32} borderRadius={16} style={{ marginTop: 32, marginBottom: 16 }} />
          <LoadingSkeleton width="60%" height={20} borderRadius={10} style={{ marginBottom: 32 }} />
          <LoadingSkeleton width="100%" height={120} borderRadius={20} />
        </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Render Poker Screen if game is active
  console.log('[RoomScreen] Current game state:', currentRoom.gameState);
  if (currentRoom.gameState === 'VOTING' || currentRoom.gameState === 'REVEALED') {
    console.log('[RoomScreen] Rendering PokerScreen');
    return <PokerScreen room={currentRoom} participants={participants} />;
  }

  // LOBBY STATE - Premium Design
  return (
    <LinearGradient
      colors={currentTheme.colors.background as any}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
          <PlanningPokerLogo size={80} animated={true} />
          <Text style={styles.roomName}>{currentRoom.name}</Text>
          
          {/* Room Code Badge */}
          <LinearGradient
            colors={currentTheme.colors.cardBg as any}
            style={styles.codeBadge}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.codeLabel}>Room Code</Text>
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>{currentRoom.code}</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Participants Section */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              👥 Participants ({participants.length})
            </Text>
          </View>

          <View style={styles.participantsList}>
            {participants.length === 0 ? (
              <LinearGradient
                colors={currentTheme.colors.cardBg as any}
                style={styles.emptyState}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.emptyIcon}>👻</Text>
                <Text style={styles.emptyText}>Waiting for participants...</Text>
              </LinearGradient>
            ) : (
              participants.map((participant, index) => (
                <Animated.View
                  key={`${participant.userId}-${index}`}
                  entering={FadeInDown.delay(300 + index * 50)}
                >
                  <LinearGradient
                    colors={currentTheme.colors.cardBg as any}
                    style={styles.participantCard}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <LinearGradient
                      colors={[
                        `hsl(${(index * 60) % 360}, 70%, 60%)`,
                        `hsl(${((index * 60) + 40) % 360}, 70%, 50%)`,
                      ]}
                      style={styles.avatar}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={styles.avatarText}>
                        {participant.name.charAt(0).toUpperCase()}
                      </Text>
                    </LinearGradient>
                    <View style={styles.participantInfo}>
                      <Text style={styles.participantName}>
                        {participant.name}
                        {participant.userId === user?.id && ' (You)'}
                      </Text>
                      <Text style={styles.participantStatus}>
                        {participant.userId === currentRoom.hostUserId ? '👑 Host' : '🎮 Player'}
                      </Text>
                    </View>
                  </LinearGradient>
                </Animated.View>
              ))
            )}
          </View>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View entering={FadeInDown.delay(400)} style={styles.actions}>
          {isHost && (
            <>
              <Button
                title="🎯 Start Voting"
                onPress={handleStartGame}
                style={styles.primaryButton}
              />
              <Button
                title="⚙️ Settings"
                onPress={() => setShowSettings(true)}
                variant="outline"
                style={styles.outlineButton}
              />
              <Button
                title="👋 Invite Users"
                onPress={() => setShowInviteModal(true)}
                variant="outline"
                style={styles.outlineButton}
              />
            </>
          )}
          <Button
            title="📤 Share Code"
            onPress={handleShareCode}
            variant="outline"
            style={styles.outlineButton}
          />
          <Button
            title="🚪 Leave Room"
            onPress={handleLeaveRoom}
            variant="outline"
            style={styles.leaveButton}
          />
        </Animated.View>
      </ScrollView>

      {/* Settings Modal */}
      {isHost && (
        <>
          <RoomSettingsModal
            visible={showSettings}
            onClose={() => setShowSettings(false)}
            onSave={handleUpdateSettings}
            initialSettings={currentRoom.settings}
            roomId={currentRoom.id}
          />
          <InviteUsersModal
            visible={showInviteModal}
            onClose={() => setShowInviteModal(false)}
            roomId={currentRoom.id}
            roomName={currentRoom.name}
          />
        </>
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  roomName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  codeBadge: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  codeLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    marginBottom: 8,
  },
  codeBox: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
  },
  codeText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 4,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  participantsList: {
    gap: 12,
  },
  participantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  participantStatus: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  emptyState: {
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  actions: {
    gap: 12,
  },
  primaryButton: {
    marginBottom: 4,
  },
  outlineButton: {
    marginBottom: 4,
  },
  leaveButton: {
    borderColor: '#EF4444',
    marginTop: 8,
  },
});
