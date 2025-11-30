
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { Link } from 'expo-router';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import * as LocalAuthentication from 'expo-local-authentication';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { Toast } from '@/components/ui/Toast';
import { AnimatedBackground } from '@/components/game/AnimatedBackground';
import { PlanningPokerLogo } from '@/components/ui/PlanningPokerLogo';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { useTheme } from '@/contexts/ThemeContext';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const { login, googleLogin } = useAuth();
  const { currentTheme, setTheme, availableThemes } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [showThemes, setShowThemes] = useState(true); // Show by default

  const scale = useSharedValue(1);

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: 'YOUR_ANDROID_CLIENT_ID',
    iosClientId: 'YOUR_IOS_CLIENT_ID',
    webClientId: 'YOUR_WEB_CLIENT_ID',
  });

  const handleGoogleLogin = React.useCallback(async (token: string) => {
    setLoading(true);
    try {
      await googleLogin(token);
      setToastVisible(true);
    } catch (error: any) {
      Alert.alert('Google Login Failed', error.message || 'Could not sign in with Google');
    } finally {
      setLoading(false);
    }
  }, [googleLogin]);

  useEffect(() => {
    // Check biometric support
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setIsBiometricSupported(compatible);
      setInitialLoading(false);
    })();
  }, []);

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      if (id_token) {
        handleGoogleLogin(id_token);
      }
    }
  }, [response, handleGoogleLogin]);

  const validateForm = () => {
    const newErrors = { email: '', password: '' };
    let isValid = true;

    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setErrors(newErrors);

    if (!isValid) {
      scale.value = withSequence(
        withSpring(1.02),
        withSpring(0.98),
        withSpring(1)
      );
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await login({ email: email.trim(), password });
      setToastVisible(true);
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleBiometricAuth = async () => {
    try {
      const biometricAuth = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Login with biometrics',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (biometricAuth.success) {
        // In a real app, you'd retrieve stored credentials here
        Alert.alert('Success', 'Biometric authentication successful! (Demo mode)');
      }
    } catch (error) {
      console.log('Biometric auth error:', error);
    }
  };

  if (initialLoading) {
    return (
      <LinearGradient
        colors={currentTheme.colors.background as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <AnimatedBackground />
          <View style={styles.loadingContainer}>
            <LoadingSkeleton width={120} height={120} borderRadius={60} style={{ marginBottom: 32 }} />
            <LoadingSkeleton width="80%" height={32} borderRadius={16} style={{ marginBottom: 16 }} />
            <LoadingSkeleton width="60%" height={20} borderRadius={10} style={{ marginBottom: 32 }} />
            <LoadingSkeleton width="100%" height={56} borderRadius={12} style={{ marginBottom: 12 }} />
            <LoadingSkeleton width="100%" height={56} borderRadius={12} />
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

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
          message="Welcome back! Login successful."
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
              {/* Theme Toggle */}
              <View style={styles.themeToggleContainer}>
                <TouchableOpacity
                  onPress={() => setShowThemes(!showThemes)}
                  style={[styles.themeButton, { borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)' }]}
                >
                  <Ionicons name="color-palette" size={20} color={currentTheme.colors.accent} />
                </TouchableOpacity>
              </View>

              {/* Theme Selector */}
              {showThemes && (
                <Animated.View style={[styles.themeSelector, { borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                  <Text style={styles.themeTitle}>CHOOSE THEME</Text>
                  <View style={styles.themeGrid}>
                    {availableThemes.map((theme) => (
                      <TouchableOpacity
                        key={theme.id}
                        onPress={() => setTheme(theme.id)}
                        style={[
                          styles.themeOption,
                          currentTheme.id === theme.id && { backgroundColor: theme.colors.button[0] }
                        ]}
                      >
                        <Text style={[
                          styles.themeName,
                          currentTheme.id === theme.id ? { color: '#FFF' } : { color: '#9CA3AF' }
                        ]}>
                          {theme.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </Animated.View>
              )}

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
                      Planning Poker
                    </Text>
                    <Text style={[styles.subtitle, { color: '#D1D5DB' }]}>
                      Sign in to continue
                    </Text>
                  </View>

                  <View style={styles.form}>
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
                      placeholder="Enter your password"
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        setErrors({ ...errors, password: '' });
                      }}
                      error={errors.password}
                      secureTextEntry
                      autoCapitalize="none"
                      labelStyle={styles.inputLabel}
                      containerStyle={{ marginBottom: 24 }}
                    />

                    <TouchableOpacity
                      onPress={handleLogin}
                      disabled={loading}
                    >
                      <LinearGradient
                        colors={currentTheme.colors.button as any}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.primaryButton}
                      >
                        <Text style={styles.primaryButtonText}>
                          {loading ? 'Signing In...' : 'Sign In'}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>

                    <Button
                      title="Sign in with Google"
                      onPress={() => promptAsync()}
                      disabled={!request}
                      variant="outline"
                      style={styles.googleButton}
                    />

                    {isBiometricSupported && (
                      <Button
                        title="🔐 Login with Biometrics"
                        onPress={handleBiometricAuth}
                        variant="outline"
                        style={styles.biometricButton}
                      />
                    )}

                    <View style={styles.footer}>
                      <Text style={[styles.footerText, styles.textLight]}>
                        Don&apos;t have an account?{' '}
                      </Text>
                      <Link href="/signup" asChild>
                        <Text style={[styles.link, { color: currentTheme.colors.accent }]}>Sign Up</Text>
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
  orb: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.5,
    // filter: 'blur(60px)', // Removed as it's not supported in RN styles directly without specific libs or polyfills, relying on opacity for now or could use BlurView if needed but keeping simple
  },
  themeToggleContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 10,
  },
  themeButton: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    // backdropFilter: 'blur(12px)', // Not supported in RN
  },
  themeSelector: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    // backdropFilter: 'blur(12px)', // Not supported in RN
  },
  themeTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  themeOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  themeName: {
    fontSize: 14,
    fontWeight: '500',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
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
  googleButton: {
    marginTop: 16,
  },
  biometricButton: {
    marginTop: 12,
    borderColor: '#10B981',
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
