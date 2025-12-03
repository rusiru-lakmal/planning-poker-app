import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Participant, Room } from '@/types/api';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ResultsChart } from './ResultsChart';
import { useRoom } from '@/contexts/RoomContext';

interface ResultsScreenProps {
  room: Room;
  participants: Participant[];
}

export function ResultsScreen({ room, participants }: ResultsScreenProps) {
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const { resetRoom } = useRoom();
  const isHost = room.hostUserId === user?.id;

  // Consensus Health Logic
  const calculateConsensusHealth = () => {
    const votes = participants
      .map(p => p.vote)
      .filter(v => v !== null && v !== '?' && v !== '☕') as string[];

    if (votes.length < 2) return null;

    const fibSequence = ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89'];
    const indices = votes.map(v => fibSequence.indexOf(v)).filter(i => i !== -1);
    
    if (indices.length === 0) return null;

    const minIndex = Math.min(...indices);
    const maxIndex = Math.max(...indices);
    const spread = maxIndex - minIndex;

    if (spread <= 1) {
      return {
        status: 'HEALTHY',
        color: '#10B981',
        bg: 'rgba(16, 185, 129, 0.1)',
        border: 'rgba(16, 185, 129, 0.3)',
        icon: '✅',
        title: 'Great Consensus!',
        message: 'The team is aligned on this estimate.'
      };
    } else if (spread <= 2) {
      return {
        status: 'MODERATE',
        color: '#F59E0B',
        bg: 'rgba(245, 158, 11, 0.1)',
        border: 'rgba(245, 158, 11, 0.3)',
        icon: '⚠️',
        title: 'Moderate Divergence',
        message: 'Some difference in opinion. Worth a quick check.'
      };
    } else {
      return {
        status: 'RISKY',
        color: '#EF4444',
        bg: 'rgba(239, 68, 68, 0.1)',
        border: 'rgba(239, 68, 68, 0.3)',
        icon: '🚨',
        title: 'High Risk / Ambiguous',
        message: 'Significant disagreement detected. Discussion recommended!'
      };
    }
  };

  const consensus = calculateConsensusHealth();

  return (
    <LinearGradient
      colors={currentTheme.colors.background as any}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Header Section */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
          <Text style={styles.title}>✨ Voting Finished</Text>
          <Text style={styles.subtitle}>Here are the results</Text>
        </Animated.View>

        {/* Consensus Card */}
        {consensus && (
          <Animated.View 
            entering={FadeInDown.delay(200)}
            style={[
              styles.consensusCard, 
              { backgroundColor: consensus.bg, borderColor: consensus.border }
            ]}
          >
            <View style={styles.consensusHeader}>
              <Text style={styles.consensusIcon}>{consensus.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.consensusTitle, { color: consensus.color }]}>
                  {consensus.title}
                </Text>
                <Text style={styles.consensusMessage}>{consensus.message}</Text>
              </View>
            </View>
            

          </Animated.View>
        )}

        {/* Chart Section */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Distribution</Text>
          <ResultsChart participants={participants} deckType={room.deckType} />
        </Animated.View>

        {/* Participants Grid (Revealed) */}
        <Animated.View entering={FadeInDown.delay(400)} style={styles.gridSection}>
          <Text style={styles.sectionTitle}>Votes</Text>
          <View style={styles.grid}>
            {participants.map((p, index) => (
              <Animated.View 
                key={p.userId} 
                entering={FadeInUp.delay(500 + index * 50)}
                style={styles.participantCard}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                  style={styles.participantGradient}
                >
                  <Text style={styles.voteValue}>{p.vote || '-'}</Text>
                  <Text style={styles.participantName} numberOfLines={1}>
                    {p.name}
                  </Text>
                </LinearGradient>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Footer Actions */}
        <View style={styles.footerSpacer} />
      </ScrollView>

      {/* Fixed Bottom Action */}
      {isHost && (
        <Animated.View entering={FadeInUp.delay(600)} style={styles.footer}>
          <Button 
            title="🔄 Start New Vote" 
            onPress={resetRoom}
            style={styles.resetButton}
            textStyle={{ fontSize: 18, fontWeight: 'bold' }}
          />
        </Animated.View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  consensusCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  consensusHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  consensusIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  consensusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  consensusMessage: {
    fontSize: 14,
    color: '#D1D5DB',
    flexWrap: 'wrap',
  },
  chartSection: {
    marginBottom: 32,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  gridSection: {
    marginBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  participantCard: {
    width: '31%',
    minWidth: 90,
    aspectRatio: 0.8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  participantGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
  },
  voteValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#8B5CF6',
    marginBottom: 8,
  },
  participantName: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  footerSpacer: {
    height: 80,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  resetButton: {
    height: 56,
    borderRadius: 28,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
