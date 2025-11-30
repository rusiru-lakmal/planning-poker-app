import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface LoadingSkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function LoadingSkeleton({ 
  width = '100%', 
  height = 20, 
  borderRadius = 8,
  style 
}: LoadingSkeletonProps) {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmer.value,
      [0, 1],
      [-200, 200]
    );

    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View style={[styles.container, { width, height, borderRadius }, style]}>
      <View style={styles.background} />
      <Animated.View style={[styles.shimmerContainer, animatedStyle]}>
        <LinearGradient
          colors={['transparent', 'rgba(255, 255, 255, 0.15)', 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.shimmer}
        />
      </Animated.View>
    </View>
  );
}

// Preset skeleton layouts
export function CardSkeleton() {
  return (
    <View style={styles.cardSkeleton}>
      <LoadingSkeleton height={100} borderRadius={16} />
      <LoadingSkeleton width="60%" height={16} style={{ marginTop: 12 }} />
      <LoadingSkeleton width="40%" height={12} style={{ marginTop: 8 }} />
    </View>
  );
}

export function ListItemSkeleton() {
  return (
    <View style={styles.listItem}>
      <LoadingSkeleton width={40} height={40} borderRadius={20} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <LoadingSkeleton width="70%" height={16} />
        <LoadingSkeleton width="50%" height={12} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

export function RoomListSkeleton() {
  return (
    <View style={styles.roomListSkeleton}>
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  shimmerContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  shimmer: {
    flex: 1,
    width: 200,
  },
  cardSkeleton: {
    marginBottom: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  roomListSkeleton: {
    padding: 16,
  },
});
