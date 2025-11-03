const lightTheme = {
  colors: {
    primary: '#2563EB',
    primaryDark: '#1D4ED8',
    secondary: '#10B981',
    accent: '#F59E0B',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#1F2937',
    textSecondary: '#6B7280',
    textLight: '#9CA3AF',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    border: '#E5E7EB',
    shadow: '#000000',
    primaryGradient: ['#2563EB', '#1D4ED8'],
    secondaryGradient: ['#10B981', '#059669'],
    backgroundGradient: ['#F8FAFC', '#F1F5F9'],
    cardGradient: ['#FFFFFF', '#F8FAFC'],
  },
};

const darkTheme = {
  colors: {
    primary: '#3B82F6',
    primaryDark: '#2563EB',
    secondary: '#10B981',
    accent: '#F59E0B',
    background: '#0F172A',
    surface: '#1E293B',
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    textLight: '#64748B',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    border: '#334155',
    shadow: '#000000',
    primaryGradient: ['#3B82F6', '#2563EB'],
    secondaryGradient: ['#10B981', '#059669'],
    backgroundGradient: ['#0F172A', '#1E293B'],
    cardGradient: ['#1E293B', '#334155'],
  },
};

const baseTheme = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 999,
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold',
      lineHeight: 40,
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold',
      lineHeight: 32,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28,
    },
    body: {
      fontSize: 16,
      fontWeight: 'normal',
      lineHeight: 24,
    },
    caption: {
      fontSize: 14,
      fontWeight: 'normal',
      lineHeight: 20,
    },
    small: {
      fontSize: 12,
      fontWeight: 'normal',
      lineHeight: 16,
    },
  },
};

export const getTheme = (isDarkMode) => ({
  ...baseTheme,
  ...(isDarkMode ? darkTheme : lightTheme),
});

// Para compatibilidade com código existente
export const theme = lightTheme;
