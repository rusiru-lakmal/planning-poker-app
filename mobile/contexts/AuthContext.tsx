import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as ApiUser, LoginDto, SignupDto } from '@/types/api';
import { auth, db } from '@/services/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';

interface AuthContextType {
  user: ApiUser | null;
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
  const [user, setUser] = useState<ApiUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || 'User',
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (loginDto: LoginDto): Promise<void> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, loginDto.email, loginDto.password);
      
      // Update user document in Firestore (e.g. last login)
      if (userCredential.user) {
        const userRef = doc(db, 'users', userCredential.user.uid);
        const name = userCredential.user.displayName || 'User';
        await setDoc(userRef, {
          email: userCredential.user.email,
          name: name,
          nameLower: name.toLowerCase(),
          searchKeywords: generateSearchKeywords(name),
          lastLogin: new Date().toISOString()
        }, { merge: true });
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const googleLogin = async (token: string): Promise<void> => {
    // TODO: Implement Google Sign-In with Firebase
    console.warn('Google Login not yet implemented for Firebase');
  };

  const signup = async (signupDto: SignupDto): Promise<void> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        signupDto.email, 
        signupDto.password
      );
      
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: signupDto.name
        });
        
        // Create user document in Firestore
        const userRef = doc(db, 'users', userCredential.user.uid);
        await setDoc(userRef, {
          id: userCredential.user.uid,
          email: userCredential.user.email,
          name: signupDto.name,
          nameLower: signupDto.name.toLowerCase(),
          createdAt: new Date().toISOString(),
          searchKeywords: generateSearchKeywords(signupDto.name)
        });
        
        // Force update local state since onAuthStateChanged might fire before updateProfile
        setUser({
          id: userCredential.user.uid,
          email: userCredential.user.email || '',
          name: signupDto.name,
        });
      }
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
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

// Helper to generate search keywords for Firestore
const generateSearchKeywords = (name: string): string[] => {
  const keywords: string[] = [];
  const lowerName = name.toLowerCase();
  let current = '';
  for (const char of lowerName) {
    current += char;
    keywords.push(current);
  }
  return keywords;
};
