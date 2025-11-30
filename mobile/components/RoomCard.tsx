import React from 'react';
import { View, Text, StyleSheet, Pressable, useColorScheme } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Room } from '@/contexts/RoomContext';
import { useTheme } from '@/contexts/ThemeContext';

interface RoomCardProps {
  room: Room;
  onPress: () => void;
}

export function RoomCard({ room, onPress }: RoomCardProps) {
  const { currentTheme } = useTheme();
  const scale = useSharedValue(1);
  const elevation = useSharedValue(8);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    elevation: elevation.value,
    shadowOpacity: elevation.value / 20,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15 });
    elevation.value = withTiming(4, { duration: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
    elevation.value = withTiming(8, { duration: 150 });
  };

  // Calculate participant count
  const participantCount = room.participants?.length || 0;
  const activeCount = room.participants?.filter((p) => p.hasVoted).length || 0;

  // Determine status
  const getStatusInfo = () => {
    if (room.gameState === 'FINISHED') {
      return { label: 'Finished', color: '#10B981', emoji: '✅' };
    } else if (room.gameState === 'VOTING') {
      return { label: 'Active', color: '#F59E0B', emoji: '⏳' };
    } else {
      return { label: 'Lobby', color: '#6366F1', emoji: '🎯' };
    }
  };

  const status = getStatusInfo();

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.card, animatedStyle]}>
        <LinearGradient
          colors={[currentTheme.colors.card1, currentTheme.colors.card2]}
          style={styles.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Header with status badge */}
          <View style={styles.header}>
            <Text style={styles.roomName} numberOfLines={1}>
              {room.name}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
              <Text style={styles.statusEmoji}>{status.emoji}</Text>
              <Text style={[styles.statusText, { color: status.color }]}>
                {status.label}
              </Text>
            </View>
          </View>

          {/* Description */}
          {room.description && (
            <Text style={styles.description} numberOfLines={2}>
              {room.description}
            </Text>
          )}

          {/* Stats Row */}
          <View style={styles.statsRow}>
            {/* Participants */}
            <View style={styles.stat}>
              <Text style={styles.statIcon}>👥</Text>
              <Text style={styles.statText}>{participantCount} members</Text>
            </View>

            {/* Active voters (if voting) */}
            {room.gameState === 'VOTING' && (
              <View style={styles.stat}>
                <Text style={styles.statIcon}>✓</Text>
                <Text style={styles.statText}>
                  {activeCount}/{participantCount} voted
                </Text>
              </View>
            )}

            {/* Created by */}
            <View style={[styles.stat, { marginLeft: 'auto' }]}>
              <Text style={styles.statIcon}>👤</Text>
              <Text style={styles.statText} numberOfLines={1}>
                {room.creator?.name || 'Unknown'}
              </Text>
            </View>
          </View>

          {/* Participant Avatars */}
          {participantCount > 0 && (
            <View style={styles.avatarsContainer}>
              {room.participants?.slice(0, 5).map((participant, index) => (
                <View
                  key={`avatar-${participant.id}-${index}`}
                  style={[
                    styles.avatar,
                    { 
                      marginLeft: index === 0 ? 0 : -12,
                      zIndex: 10 - index,
                    },
                  ]}
                >
                  <LinearGradient
                    colors={[
                      `hsl(${(index * 60) % 360}, 70%, 60%)`,
                      `hsl(${((index * 60) + 40) % 360}, 70%, 50%)`,
                    ]}
                    style={styles.avatarGradient}
                  >
                    <Text style={styles.avatarText}>
                      {participant.name?.charAt(0).toUpperCase() || '?'}
                    </Text>
                  </LinearGradient>
                </View>
              ))}
              {participantCount > 5 && (
                <View key="avatar-more" style={[styles.avatar, { marginLeft: -12, zIndex: 5 }]}>
                  <View style={styles.avatarMore}>
                    <Text style={styles.avatarMoreText}>+{participantCount - 5}</Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Gradient Border */}
          <LinearGradient
            colors={[currentTheme.colors.borderStart, currentTheme.colors.borderEnd]}
            style={styles.border}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  cardGradient: {
    borderRadius: 20,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    position: 'relative',
  },
  border: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    padding: 1,
    zIndex: -1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roomName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  description: {
    fontSize: 14,
    color: '#D1D5DB',
    marginBottom: 16,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  statText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  avatarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#0F172A',
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  avatarMore: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
    backgroundColor: 'rgba(139, 92, 246, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarMoreText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
