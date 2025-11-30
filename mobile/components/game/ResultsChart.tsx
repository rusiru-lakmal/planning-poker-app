import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Participant } from '@/types/api';
import { Gradients } from '@/constants/theme';

interface ResultsChartProps {
  participants: Participant[];
  deckType: string;
}

export function ResultsChart({ participants, deckType }: ResultsChartProps) {
  // Calculate vote distribution
  const votes = participants
    .map(p => p.vote)
    .filter((v): v is string => !!v); // Filter out null/undefined

  const totalVotes = votes.length;
  if (totalVotes === 0) return null;

  const distribution = votes.reduce((acc, vote) => {
    acc[vote] = (acc[vote] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Sort by value (numeric if possible)
  const sortedKeys = Object.keys(distribution).sort((a, b) => {
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    return a.localeCompare(b);
  });

  // Calculate average
  const sum = votes.reduce((acc, v) => {
    const num = parseFloat(v);
    return !isNaN(num) ? acc + num : acc;
  }, 0);
  const countNumeric = votes.filter(v => !isNaN(parseFloat(v))).length;
  const average = countNumeric > 0 ? (sum / countNumeric).toFixed(1) : null;

  // Determine consensus (if all votes are the same or within a range)
  const hasConsensus = sortedKeys.length === 1;
  const variance = sortedKeys.length <= 2;

  return (
    <View style={styles.container}>
      <View style={styles.chart}>
        {sortedKeys.map((vote, index) => {
          const count = distribution[vote];
          const percentage = (count / totalVotes) * 100;
          
          return (
            <AnimatedBar 
              key={vote}
              vote={vote}
              count={count}
              percentage={percentage}
              index={index}
              hasConsensus={hasConsensus}
            />
          );
        })}
      </View>

      {average && (
        <View style={styles.stats}>
          <LinearGradient
            colors={hasConsensus ? Gradients.success : variance ? ['#F59E0B', '#F97316'] : Gradients.Card.selected}
            style={styles.averageBadge}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.averageLabel}>Average</Text>
            <Text style={styles.averageValue}>{average}</Text>
            {hasConsensus && <Text style={styles.consensusText}>✨ Consensus!</Text>}
          </LinearGradient>
        </View>
      )}
    </View>
  );
}

function AnimatedBar({ vote, count, percentage, index, hasConsensus }: { 
  vote: string; 
  count: number; 
  percentage: number; 
  index: number;
  hasConsensus: boolean;
}) {
  const width = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    width.value = withDelay(
      index * 100,
      withSpring(percentage, {
        damping: 15,
        stiffness: 100,
      })
    );
    opacity.value = withDelay(
      index * 100,
      withTiming(1, { duration: 400 })
    );
  }, [percentage, index]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
    opacity: opacity.value,
  }));

  const gradientColors = hasConsensus 
    ? Gradients.success 
    : Gradients.Card.selected;

  return (
    <View style={styles.barContainer}>
      <View style={styles.labelContainer}>
        <Text style={styles.labelText}>{vote}</Text>
      </View>
      <View style={styles.barTrack}>
        <Animated.View style={[styles.barWrapper, animatedStyle]}>
          <LinearGradient
            colors={gradientColors}
            style={styles.bar}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </Animated.View>
      </View>
      <Text style={styles.countText}>{count} ({Math.round(percentage)}%)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  chart: {
    gap: 16,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
  },
  labelContainer: {
    width: 50,
    alignItems: 'flex-end',
    paddingRight: 12,
  },
  labelText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  barTrack: {
    flex: 1,
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  barWrapper: {
    height: '100%',
  },
  bar: {
    height: '100%',
    borderRadius: 8,
  },
  countText: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#D1D5DB',
    width: 80,
  },
  stats: {
    marginTop: 24,
    alignItems: 'center',
  },
  averageBadge: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 20,
    alignItems: 'center',
    minWidth: 200,
    elevation: 8,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  averageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  averageValue: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  consensusText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
  },
});
