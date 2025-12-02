import { Gradients } from '@/constants/theme';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface AnimatedCardProps {
  value: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
  themeColors?: string[];
}

export function AnimatedCard({ value, selected, onPress, disabled, themeColors }: AnimatedCardProps) {
  const scale = useSharedValue(1);
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);
  const pressed = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(selected ? 1.15 : 1, {
      damping: 15,
      stiffness: 150,
    });
  }, [selected]);

  const handlePressIn = () => {
    if (disabled) return;
    pressed.value = withTiming(1, { duration: 100 });
    rotateX.value = withTiming(5, { duration: 100 });
    rotateY.value = withTiming(5, { duration: 100 });
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    if (disabled) return;
    pressed.value = withTiming(0, { duration: 200 });
    rotateX.value = withSpring(0);
    rotateY.value = withSpring(0);
  };

  const handlePress = () => {
    if (disabled) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => {
    const pressScale = interpolate(pressed.value, [0, 1], [1, 0.95], Extrapolate.CLAMP);
    
    return {
      transform: [
        { scale: scale.value * pressScale },
        { perspective: 1000 },
        { rotateX: `${rotateX.value}deg` },
        { rotateY: `${rotateY.value}deg` },
      ],
      shadowOpacity: interpolate(scale.value, [1, 1.15], [0.2, 0.4], Extrapolate.CLAMP),
      shadowRadius: interpolate(scale.value, [1, 1.15], [8, 16], Extrapolate.CLAMP),
      elevation: interpolate(scale.value, [1, 1.15], [5, 10], Extrapolate.CLAMP),
    };
  });

  const isMystery = value === '?';
  const gradientColors = isMystery 
    ? Gradients.Card.mystery 
    : selected 
    ? (themeColors || Gradients.Card.selected)
    : Gradients.Card.default;

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      activeOpacity={1}
      disabled={disabled}
    >
      <Animated.View style={[styles.cardContainer, animatedStyle]}>
        <LinearGradient
          colors={gradientColors as any}
          style={styles.card}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={[styles.cardText, isMystery && styles.mysteryText]}>
            {value}
          </Text>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  card: {
    width: 70,
    height: 100,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  cardText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  mysteryText: {
    fontSize: 36,
  },
});
