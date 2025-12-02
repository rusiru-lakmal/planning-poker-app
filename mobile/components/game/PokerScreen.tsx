import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import socketService from '@/services/socket';
import { Participant, Room } from '@/types/api';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { CardDeck } from './CardDeck';
import { ResultsChart } from './ResultsChart';
import { Timer } from './Timer';

interface PokerScreenProps {
  room: Room;
  participants: Participant[];
}

export function PokerScreen({ room, participants }: PokerScreenProps) {
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const isHost = room.hostUserId === user?.id;

  const currentUserParticipant = participants.find(p => p.userId === user?.id);
  const isSpectator = currentUserParticipant?.role === 'spectator' || currentUserParticipant?.role === 'observer';
  const currentVote = currentUserParticipant?.vote;

  const handleVote = (vote: string) => {
    if (user?.id) {
      socketService.submitVote(room.id, user.id, vote);
    }
  };

  const handleReveal = () => {
    socketService.revealVotes(room.id);
  };

  const handleReset = () => {
    socketService.resetGame(room.id);
  };

  const handleTimerAction = (action: 'start' | 'pause' | 'stop') => {
    if (action === 'start') {
      socketService.startTimer(room.id, room.settings?.timerDuration || 60);
    } else if (action === 'pause') {
      socketService.pauseTimer(room.id);
    } else {
      socketService.stopTimer(room.id);
    }
  };

  const handleTimerExpire = () => {
    console.log('[PokerScreen] Timer expired, revealing votes...');
    if (isHost && room.gameState === 'VOTING') {
      socketService.revealVotes(room.id);
    }
  };

  const handleStartVoting = () => {
    socketService.startVoting(room.id);
  };

  return (
    <LinearGradient
      colors={currentTheme.colors.background as any}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Game Area */}
      <View style={styles.gameArea}>
        {/* Story Card Header */}
        <View style={styles.storyCard}>
          <LinearGradient
            colors={currentTheme.colors.cardBg as any}
            style={styles.storyCardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.storyTitle}>
              {room.gameState === 'REVEALED' ? '✨ Voting Finished' : 
               room.gameState === 'LOBBY' ? '🎯 Waiting to Start' : '⏳ Voting in Progress'}
            </Text>
            {room.timer && room.timer.startTime && (
              <Timer 
                startTime={room.timer.startTime} 
                duration={room.timer.duration} 
                status={room.timer.status}
                onTimerExpire={handleTimerExpire}
              />
            )}
          </LinearGradient>
        </View>
        
        {/* Table / Participants */}
        <View style={styles.table}>
          <View style={styles.participantsGrid}>
            {participants.map((p) => (
              <ParticipantBadge 
                key={p.userId} 
                participant={p} 
                revealed={room.gameState === 'REVEALED'}
                currentTheme={currentTheme}
              />
            ))}
          </View>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {room.gameState === 'REVEALED' ? (
          <View style={styles.resultsArea}>
            <Text style={styles.resultTitle}>
              📊 Results
            </Text>
            <ResultsChart participants={participants} deckType={room.deckType} />
            {isHost && (
              <Button title="Start New Vote" onPress={handleReset} />
            )}
          </View>
        ) : (
          <>
            {!isSpectator ? (
              <CardDeck 
                deckType={room.deckType} 
                selectedValue={currentVote}
                onSelect={handleVote}
                themeColors={currentTheme.colors.button as any}
              />
            ) : (
              <View style={styles.spectatorMessage}>
                <Text style={styles.spectatorText}>
                  👀 You are spectating
                </Text>
              </View>
            )}

            {isHost && (
              <View style={styles.hostControls}>
                {room.gameState === 'LOBBY' ? (
                  <Button 
                    title="Start Voting" 
                    onPress={handleStartVoting} 
                    style={styles.hostButton}
                  />
                ) : (
                  <Button 
                    title="Reveal Votes" 
                    onPress={handleReveal} 
                    variant="secondary"
                    style={styles.hostButton}
                  />
                )}
                
                {room.settings?.timerDuration ? (
                   <Button 
                    title={room.timer?.status === 'running' ? "Stop Timer" : "Start Timer"} 
                    onPress={() => handleTimerAction(room.timer?.status === 'running' ? 'stop' : 'start')}
                    variant="outline"
                    style={styles.hostButton}
                  />
                ) : null}
              </View>
            )}
          </>
        )}
      </View>
    </LinearGradient>
  );
}

function ParticipantBadge({ participant, revealed, currentTheme }: { participant: Participant, revealed: boolean, currentTheme: any }) {
  const hasVoted = !!participant.vote;
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  
  useEffect(() => {
    if (hasVoted && !revealed) {
      scale.value = withSequence(
        withSpring(1.15),
        withSpring(1)
      );
    }
  }, [hasVoted, revealed]);

  useEffect(() => {
    if (revealed && hasVoted) {
      rotation.value = withTiming(180, { duration: 600 });
    } else {
      rotation.value = withTiming(0, { duration: 400 });
    }
  }, [revealed, hasVoted]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotateY: `${rotation.value}deg` },
      { scaleX: revealed && hasVoted ? -1 : 1 }, // Fix mirror bug
    ],
  }));

  return (
    <View style={styles.badge}>
      <Animated.View style={[styles.cardBackContainer, animatedStyle]}>
        <LinearGradient
          colors={hasVoted ? (revealed ? ['#FFFFFF', '#F3F4F6'] : (currentTheme.colors.button as any)) : ['#E5E7EB', '#D1D5DB']}
          style={[
            styles.cardBack,
            hasVoted && !revealed && styles.cardBackVoted,
            revealed && styles.cardBackRevealed,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={[
            styles.cardValue, 
            revealed && styles.cardValueRevealed,
            !hasVoted && styles.cardValueEmpty
          ]}>
            {revealed ? participant.vote : (hasVoted ? '✓' : '–')}
          </Text>
        </LinearGradient>
      </Animated.View>
      <Text style={styles.badgeName}>
        {participant.name.length > 10 ? participant.name.substring(0, 10) + '...' : participant.name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  textDark: {
    color: '#FFFFFF',
  },
  gameArea: {
    flex: 1,
    justifyContent: 'flex-start',
    padding: 20,
    paddingTop: 60,
  },
  storyCard: {
    marginBottom: 40,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  storyCardGradient: {
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  storyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  table: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  participantsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
    maxWidth: '100%',
  },
  controls: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 92, 246, 0.2)',
  },
  badge: {
    alignItems: 'center',
    width: 70,
    marginBottom: 16,
  },
  cardBackContainer: {
    marginBottom: 8,
  },
  cardBack: {
    width: 50,
    height: 70,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  cardBackVoted: {
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  cardBackRevealed: {
    borderColor: '#8B5CF6',
    borderWidth: 3,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cardValueRevealed: {
    color: '#8B5CF6',
    textShadowColor: 'transparent',
  },
  cardValueEmpty: {
    color: '#9CA3AF',
    fontSize: 20,
  },
  badgeName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  resultsArea: {
    alignItems: 'center',
    gap: 16,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  spectatorMessage: {
    padding: 32,
    alignItems: 'center',
  },
  spectatorText: {
    fontSize: 18,
    color: '#A78BFA',
    fontStyle: 'italic',
    fontWeight: '600',
  },
  hostControls: {
    marginTop: 16,
    gap: 12,
  },
  hostButton: {
    marginBottom: 8,
  },
});
