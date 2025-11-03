import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Storage wrapper para compatibilidade web
const storage = {
  async getItem(key) {
    if (Platform.OS === 'web') {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.log('localStorage error:', error);
        return null;
      }
    }
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return AsyncStorage.getItem(key);
  },
  async setItem(key, value) {
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.log('localStorage error:', error);
      }
      return;
    }
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return AsyncStorage.setItem(key, value);
  }
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true); // DARK MODE COMO PADRÃO
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await storage.getItem('darkMode');
      if (savedTheme !== null) {
        setIsDarkMode(JSON.parse(savedTheme));
      } else {
        // Se não há preferência salva, salva Dark Mode como padrão
        await storage.setItem('darkMode', JSON.stringify(true));
      }
    } catch (error) {
      console.log('Error loading theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await storage.setItem('darkMode', JSON.stringify(newTheme));
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  };

  const theme = {
    colors: isDarkMode ? {
      // Dark theme colors - Design profissional
      primary: '#3B82F6', // Azul vibrante
      primaryLight: '#60A5FA',
      primaryDark: '#2563EB',
      secondary: '#10B981', // Verde esmeralda
      secondaryLight: '#34D399',
      accent: '#F59E0B', // Laranja âmbar
      accentLight: '#FBBF24',
      background: '#0A0E27', // Azul muito escuro (quase preto)
      backgroundLight: '#0F172A', // Slate 900
      surface: '#1E293B', // Slate 800
      surfaceLight: '#334155', // Slate 700
      surfaceHover: '#475569', // Slate 600
      card: '#1E293B',
      cardElevated: '#334155',
      text: '#F1F5F9', // Slate 100
      textPrimary: '#FFFFFF',
      textSecondary: '#CBD5E1', // Slate 300
      textTertiary: '#94A3B8', // Slate 400
      textDisabled: '#64748B', // Slate 500
      border: '#334155',
      borderLight: '#475569',
      divider: '#1E293B',
      success: '#10B981',
      successLight: '#34D399',
      warning: '#F59E0B',
      warningLight: '#FBBF24',
      error: '#EF4444',
      errorLight: '#F87171',
      info: '#3B82F6',
      infoLight: '#60A5FA',
      overlay: 'rgba(0, 0, 0, 0.7)',
      backdropLight: 'rgba(15, 23, 42, 0.95)',
    } : {
      // Light theme colors - Design profissional
      primary: '#2563EB',
      primaryLight: '#3B82F6',
      primaryDark: '#1D4ED8',
      secondary: '#059669',
      secondaryLight: '#10B981',
      accent: '#D97706',
      accentLight: '#F59E0B',
      background: '#F8FAFC', // Slate 50
      backgroundLight: '#FFFFFF',
      surface: '#FFFFFF',
      surfaceLight: '#F1F5F9', // Slate 100
      surfaceHover: '#E2E8F0', // Slate 200
      card: '#FFFFFF',
      cardElevated: '#F8FAFC',
      text: '#0F172A', // Slate 900
      textPrimary: '#1E293B', // Slate 800
      textSecondary: '#475569', // Slate 600
      textTertiary: '#64748B', // Slate 500
      textDisabled: '#94A3B8', // Slate 400
      border: '#E2E8F0',
      borderLight: '#F1F5F9',
      divider: '#E2E8F0',
      success: '#059669',
      successLight: '#10B981',
      warning: '#D97706',
      warningLight: '#F59E0B',
      error: '#DC2626',
      errorLight: '#EF4444',
      info: '#2563EB',
      infoLight: '#3B82F6',
      overlay: 'rgba(0, 0, 0, 0.5)',
      backdropLight: 'rgba(248, 250, 252, 0.95)',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
      xxxl: 64,
    },
    borderRadius: {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 20,
      xxl: 24,
      full: 999,
    },
    fontSize: {
      xs: 11,
      sm: 13,
      md: 15,
      lg: 17,
      xl: 20,
      xxl: 24,
      xxxl: 32,
      display: 40,
    },
    fontWeight: {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    shadows: isDarkMode ? {
      none: {},
      sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 3,
        elevation: 3,
      },
      md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 6,
        elevation: 6,
      },
      lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.6,
        shadowRadius: 12,
        elevation: 10,
      },
      xl: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.7,
        shadowRadius: 16,
        elevation: 14,
      },
    } : {
      none: {},
      sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
      },
      md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
      },
      lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
      },
      xl: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 12,
      },
    },
    animation: {
      fast: 150,
      normal: 250,
      slow: 350,
    },
  };

  const value = {
    isDarkMode,
    toggleTheme,
    isLoading,
    theme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};