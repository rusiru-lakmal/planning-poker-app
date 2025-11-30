import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, LinearGradient as SvgLinearGradient, Defs, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSpring,
  withSequence,
  Easing,
} from 'react-native-reanimated';

interface LogoProps {
  size?: number;
  animated?: boolean;
}

export function PlanningPokerLogo({ size = 120, animated = true }: LogoProps) {
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      scale.value = withRepeat(
        withSequence(
          withSpring(1.05, { damping: 3 }),
          withSpring(1, { damping: 3 })
        ),
        -1,
        true
      );
    }
  }, [animated]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 120 120">
        <Defs>
          <SvgLinearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#8B5CF6" stopOpacity="1" />
            <Stop offset="100%" stopColor="#EC4899" stopOpacity="1" />
          </SvgLinearGradient>
          <SvgLinearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#1E1B4B" stopOpacity="1" />
            <Stop offset="100%" stopColor="#312E81" stopOpacity="1" />
          </SvgLinearGradient>
        </Defs>

        {/* Background Circle */}
        <Circle cx="60" cy="60" r="58" fill="url(#bgGradient)" />

        {/* Card 1 - "1" */}
        <Path
          d="M 35 45 L 50 40 L 50 70 L 35 75 Z"
          fill="url(#cardGradient)"
          opacity="0.9"
        />

        {/* Card 2 - "2" */}
        <Path
          d="M 42 42 L 57 38 L 57 68 L 42 72 Z"
          fill="url(#cardGradient)"
          opacity="0.95"
        />

        {/* Card 3 - "3" (center, brightest) */}
        <Path
          d="M 50 40 L 65 38 L 65 68 L 50 70 Z"
          fill="url(#cardGradient)"
          opacity="1"
        />

        {/* Card 4 - "5" */}
        <Path
          d="M 58 42 L 73 40 L 73 70 L 58 72 Z"
          fill="url(#cardGradient)"
          opacity="0.95"
        />

        {/* Card 5 - "8" */}
        <Path
          d="M 65 45 L 80 42 L 80 72 L 65 75 Z"
          fill="url(#cardGradient)"
          opacity="0.9"
        />

        {/* Number indicators (optional decorative elements) */}
        <Circle cx="42" cy="55" r="2" fill="#FFFFFF" opacity="0.8" />
        <Circle cx="50" cy="53" r="2" fill="#FFFFFF" opacity="0.9" />
        <Circle cx="58" cy="53" r="2.5" fill="#FFFFFF" opacity="1" />
        <Circle cx="66" cy="55" r="2" fill="#FFFFFF" opacity="0.9" />
        <Circle cx="73"cy="57" r="2" fill="#FFFFFF" opacity="0.8" />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
