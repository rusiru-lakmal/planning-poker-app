import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEMES, Theme } from '@/constants/themes';

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (themeId: string) => void;
  availableThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(THEMES.cosmic);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedThemeId = await AsyncStorage.getItem('user_theme');
      if (savedThemeId && THEMES[savedThemeId]) {
        setCurrentTheme(THEMES[savedThemeId]);
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  };

  const setTheme = async (themeId: string) => {
    if (THEMES[themeId]) {
      setCurrentTheme(THEMES[themeId]);
      try {
        await AsyncStorage.setItem('user_theme', themeId);
      } catch (error) {
        console.error('Failed to save theme:', error);
      }
    }
  };

  const availableThemes = Object.values(THEMES);

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, availableThemes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
