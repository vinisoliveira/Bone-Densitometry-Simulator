import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DARK = {
  background: '#1a1d29',
  surface: '#2a3142',
  surfaceAlt: '#232738',
  card: '#1a1d29',
  border: '#3a3f52',
  text: '#FFFFFF',
  textSecondary: '#c9d1d9',
  textMuted: '#8892B0',
  textFaint: '#6e7681',
  accent: '#4A90E2',
  isDark: true,
  // DXA screen specific
  editorBg: '#0d1117',
  editorSurface: '#161b22',
  editorPanel: '#21262d',
  editorBorder: '#30363d',
  editorText: '#c9d1d9',
};

const LIGHT = {
  background: '#f0f2f5',
  surface: '#ffffff',
  surfaceAlt: '#f8f9fa',
  card: '#ffffff',
  border: '#d0d7de',
  text: '#1a1d29',
  textSecondary: '#333333',
  textMuted: '#656d76',
  textFaint: '#8b949e',
  accent: '#4A90E2',
  isDark: false,
  // DXA screen specific
  editorBg: '#f0f2f5',
  editorSurface: '#ffffff',
  editorPanel: '#f6f8fa',
  editorBorder: '#d0d7de',
  editorText: '#333333',
};

const ThemeContext = createContext({ theme: DARK, isDark: true, toggleTheme: () => {} });

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('theme_dark')
      .then(v => {
        if (v === 'false') setIsDark(false);
      })
      .catch(() => {});
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    AsyncStorage.setItem('theme_dark', String(next)).catch(() => {});
  };

  const theme = isDark ? DARK : LIGHT;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
