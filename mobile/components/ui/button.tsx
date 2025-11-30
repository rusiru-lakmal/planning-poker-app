import React from 'react';
import {
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
  Animated,
  Pressable,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
  ...props
}) => {
  const scale = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    onPress();
  };

  const isDisabled = disabled || loading;

  const ButtonContent = () => (
    <>
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? Colors.light.tint : '#FFFFFF'}
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.text,
            styles[`${variant}Text`],
            isDisabled && styles.disabledText,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </>
  );

  if (variant === 'primary' && !isDisabled) {
    return (
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={isDisabled}
        style={[style]}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <LinearGradient
            colors={['#2563EB', '#1D4ED8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.button, styles.primary]}
          >
            <ButtonContent />
          </LinearGradient>
        </Animated.View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={isDisabled}
      style={[style]}
    >
      <Animated.View
        style={[
          styles.button,
          styles[variant],
          isDisabled && styles.disabled,
          { transform: [{ scale }] },
        ]}
      >
        <ButtonContent />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primary: {
    // Background handled by LinearGradient
  },
  secondary: {
    backgroundColor: '#4B5563',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.light.tint,
    shadowOpacity: 0,
    elevation: 0,
  },
  disabled: {
    opacity: 0.5,
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#FFFFFF',
  },
  outlineText: {
    color: Colors.light.tint,
  },
  disabledText: {
    opacity: 0.8,
    color: '#FFFFFF',
  },
});
