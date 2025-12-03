import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Path, Rect, Stop, LinearGradient as SvgLinearGradient, Text as SvgText } from 'react-native-svg';

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
      <Svg width={size} height={size} viewBox="0 0 200 200">
        <Defs>
          {/* Card gradient - blue theme */}
          <SvgLinearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
            <Stop offset="100%" stopColor="#1e40af" stopOpacity="1" />
          </SvgLinearGradient>
          {/* Accent gradient - green theme */}
          <SvgLinearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#10b981" stopOpacity="1" />
            <Stop offset="100%" stopColor="#059669" stopOpacity="1" />
          </SvgLinearGradient>
        </Defs>

        {/* Background Circle */}
        <Circle cx="100" cy="100" r="95" fill="#1e40af" opacity="0.1" />

        {/* Left card (rotated -15 degrees) */}
        <Rect
          x="45"
          y="60"
          width="50"
          height="70"
          rx="6"
          fill="url(#cardGradient)"
          opacity="0.7"
          transform="rotate(-15 70 95)"
        />

        {/* Right card (rotated 15 degrees) */}
        <Rect
          x="105"
          y="60"
          width="50"
          height="70"
          rx="6"
          fill="url(#cardGradient)"
          opacity="0.7"
          transform="rotate(15 130 95)"
        />

        {/* Center card (front, no rotation) */}
        <Rect
          x="75"
          y="55"
          width="50"
          height="70"
          rx="6"
          fill="url(#cardGradient)"
        />

        {/* Center card number "8" */}
        <SvgText
          x="100"
          y="100"
          fontSize="36"
          fontWeight="bold"
          fill="#FFFFFF"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          8
        </SvgText>

        {/* Small corner numbers */}
        <SvgText
          x="82"
          y="67"
          fontSize="12"
          fontWeight="bold"
          fill="#FFFFFF"
        >
          8
        </SvgText>
        <SvgText
          x="118"
          y="118"
          fontSize="12"
          fontWeight="bold"
          fill="#FFFFFF"
        >
          8
        </SvgText>

        {/* Checkmark accent badge */}
        <Circle cx="138" cy="68" r="18" fill="url(#accentGradient)" />
        <Path
          d="M 132 67 L 136 72 L 145 62"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
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
