import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Gradients } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

interface OrbProps {
  colors: string[];
  size: number;
  initialX: number;
  initialY: number;
  duration?: number;
}

function Orb({ colors, size, initialX, initialY, duration = 4000 }: OrbProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    opacity.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: duration * 0.8, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: duration * 0.8, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.orb,
        {
          width: size,
          height: size,
          left: initialX,
          top: initialY,
        },
        animatedStyle,
      ]}
    >
      <LinearGradient
        colors={colors}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
    </Animated.View>
  );
}

export function AnimatedBackground() {
  const { currentTheme } = useTheme();
  
  // Use theme's orb colors
  const orbColors = currentTheme.orbs || [
    Gradients.orb.purple,
    Gradients.orb.pink,
    Gradients.orb.indigo,
    Gradients.orb.blue,
    Gradients.orb.purple,
  ];

  return (
    <View style={styles.container}>
      <Orb
        colors={orbColors[0]}
        size={200}
        initialX={-50}
        initialY={50}
        duration={5000}
      />
      <Orb
        colors={orbColors[1]}
        size={250}
        initialX={200}
        initialY={-80}
        duration={6000}
      />
      <Orb
        colors={orbColors[2]}
        size={180}
        initialX={100}
        initialY={400}
        duration={5500}
      />
      <Orb
        colors={orbColors[3]}
        size={220}
        initialX={-80}
        initialY={600}
        duration={4500}
      />
      <Orb
        colors={orbColors[4]}
        size={160}
        initialX={250}
        initialY={700}
        duration={5200}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    borderRadius: 9999,
  },
});
