import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { User, LoginDto, SignupDto } from '@/types/api';
import authAPI from '@/services/auth.api';
import { removeToken } from '@/services/api';
import socketService from '@/services/socket';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (loginDto: LoginDto) => Promise<void>;
  googleLogin: (token: string) => Promise<void>;
  signup: (signupDto: SignupDto) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    // Disabled auto-login - user must login manually each time
    // Clear any stored token to ensure clean slate
    removeToken().catch(() => {});
    setIsLoading(false);

    // Listen for auth errors (401) from API interceptor
    const subscription = DeviceEventEmitter.addListener('auth_error', () => {
      logout();
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const login = async (loginDto: LoginDto): Promise<void> => {
    try {
      const response = await authAPI.login(loginDto);
      setUser(response.user);

      // Connect socket with auth token
      socketService.connect(response.accessToken);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const googleLogin = async (token: string): Promise<void> => {
    try {
      const response = await authAPI.googleLogin(token);
      setUser(response.user);

      // Connect socket with auth token
      socketService.connect(response.accessToken);
    } catch (error) {
      console.error('Google Login error:', error);
      throw error;
    }
  };

  const signup = async (signupDto: SignupDto): Promise<void> => {
    try {
      await authAPI.signup(signupDto);
      // Don't set user or connect socket - require manual login
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
      
      // Disconnect socket on logout
      socketService.disconnect();
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, clear local state
      setUser(null);
      socketService.disconnect();
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    googleLogin,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
