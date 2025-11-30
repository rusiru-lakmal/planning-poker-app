import React, { useEffect } from 'react';
import { StyleSheet, Text, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withDelay,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
  onHide?: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type = 'success',
  onHide,
  duration = 3000,
}) => {
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSequence(
        withSpring(Platform.OS === 'ios' ? 60 : 20, { damping: 15 }),
        withDelay(
          duration,
          withTiming(-100, { duration: 500 }, (finished) => {
            if (finished && onHide) {
              runOnJS(onHide)();
            }
          })
        )
      );
      opacity.value = withSequence(
        withTiming(1, { duration: 300 }),
        withDelay(duration, withTiming(0, { duration: 300 }))
      );
    }
  }, [visible, duration, onHide, translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return '#34C759';
      case 'error':
        return '#FF3B30';
      case 'info':
        return '#007AFF';
      default:
        return '#34C759';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        animatedStyle,
        { backgroundColor: getBackgroundColor() },
      ]}
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
