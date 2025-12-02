import { Input } from '@/components/ui/input';
import { PlanningPokerLogo } from '@/components/ui/PlanningPokerLogo';
import { Toast } from '@/components/ui/Toast';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignupScreen() {
  const { signup } = useAuth();
  const { currentTheme } = useTheme();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  const scale = useSharedValue(1);

  const validateForm = () => {
    const newErrors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    };
    let isValid = true;

    // Name validation
    if (!name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
      isValid = false;
    }

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    
    if (!isValid) {
      // Shake animation on validation error
      scale.value = withSequence(
        withSpring(1.02),
        withSpring(0.98),
        withSpring(1)
      );
    }
    
    return isValid;
  };

  const handleSignup = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      console.log('Attempting signup with:', { name, email });
      await signup({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      console.log('Signup successful');
      
      // Show success toast
      setToastVisible(true);
      
      // Navigate to login after a short delay to let user see the toast
      setTimeout(() => {
        console.log('Navigating to login');
        router.replace('/login');
      }, 1500);
      
    } catch (error: any) {
      console.error('Signup failed:', error);
      Alert.alert('Signup Failed', error.message || 'Unable to create account');
    } finally {
      setLoading(false);
    }
  };

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <LinearGradient
      colors={currentTheme.colors.background as any}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>

      <Toast 
        visible={toastVisible}
        message="Account created successfully! Please login."
        type="success"
        onHide={() => setToastVisible(false)}
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <Animated.View style={[styles.card, animatedCardStyle, { shadowColor: currentTheme.colors.shadow }]}>
              <LinearGradient
                colors={currentTheme.colors.cardBg as any}
                style={[styles.cardGradient, { borderColor: 'rgba(255,255,255,0.1)' }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.header}>
                  <PlanningPokerLogo size={100} animated={true} />
                  <Text style={[styles.title, styles.textLight]}>
                    Create Account
                  </Text>
                  <Text style={[styles.subtitle, { color: '#D1D5DB' }]}>
                    Join Planning Poker today
                  </Text>
                </View>

                <View style={styles.form}>
                  <Input
                    label="Name"
                    placeholder="Enter your name"
                    value={name}
                    onChangeText={(text) => {
                      setName(text);
                      setErrors({ ...errors, name: '' });
                    }}
                    error={errors.name}
                    autoCapitalize="words"
                    autoComplete="name"
                    labelStyle={styles.inputLabel}
                    containerStyle={{ marginBottom: 16 }}
                  />

                  <Input
                    label="Email"
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      setErrors({ ...errors, email: '' });
                    }}
                    error={errors.email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    labelStyle={styles.inputLabel}
                    containerStyle={{ marginBottom: 16 }}
                  />

                  <Input
                    label="Password"
                    placeholder="Create a password"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      setErrors({ ...errors, password: '' });
                    }}
                    error={errors.password}
                    secureTextEntry
                    autoCapitalize="none"
                    labelStyle={styles.inputLabel}
                    containerStyle={{ marginBottom: 16 }}
                  />

                  <Input
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      setErrors({ ...errors, confirmPassword: '' });
                    }}
                    error={errors.confirmPassword}
                    secureTextEntry
                    autoCapitalize="none"
                    labelStyle={styles.inputLabel}
                    containerStyle={{ marginBottom: 24 }}
                  />

                  <TouchableOpacity
                    onPress={handleSignup}
                    disabled={loading}
                  >
                    <LinearGradient
                      colors={currentTheme.colors.button as any}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.primaryButton}
                    >
                      <Text style={styles.primaryButtonText}>
                        {loading ? 'Creating Account...' : 'Sign Up'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <View style={styles.footer}>
                    <Text style={[styles.footerText, styles.textLight]}>
                      Already have an account?{' '}
                    </Text>
                    <Link href="/login" asChild>
                      <Text style={[styles.link, { color: currentTheme.colors.accent }]}>Sign In</Text>
                    </Link>
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 12,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
  },
  cardGradient: {
    padding: 32,
    borderWidth: 1,
    borderRadius: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '500',
  },
  form: {
    width: '100%',
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 15,
    color: '#D1D5DB',
  },
  link: {
    fontSize: 15,
    fontWeight: '700',
  },
  inputLabel: {
    color: '#E2E8F0',
  },
  textLight: {
    color: '#FFFFFF',
  },
});
