import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
  useColorScheme,
  Animated,
} from 'react-native';
import { Colors } from '@/constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  labelStyle,
  style,
  ...props
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isFocused, setIsFocused] = React.useState(false);
  const animatedFocus = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(animatedFocus, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, animatedFocus]);

  const borderColor = animatedFocus.interpolate({
    inputRange: [0, 1],
    outputRange: [isDark ? Colors.dark.border : Colors.light.border, isDark ? Colors.dark.tint : Colors.light.tint],
  });

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, isDark && styles.labelDark, labelStyle]}>{label}</Text>
      )}
      <Animated.View style={{
        borderRadius: 16,
        borderWidth: 2,
        borderColor: error ? (isDark ? Colors.dark.error : Colors.light.error) : borderColor,
        backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
      }}>
        <TextInput
          style={[
            styles.input,
            isDark ? styles.inputDark : styles.inputLight,
            style,
          ]}
          placeholderTextColor={isDark ? '#9CA3AF' : '#9CA3AF'}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
      </Animated.View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151',
    marginLeft: 4,
  },
  labelDark: {
    color: '#D1D5DB',
  },
  input: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    minHeight: 56,
    width: '100%',
  },
  inputLight: {
    color: '#111827',
  },
  inputDark: {
    color: '#F9FAFB',
  },
  error: {
    fontSize: 13,
    color: '#EF4444',
    marginTop: 6,
    marginLeft: 4,
  },
});
