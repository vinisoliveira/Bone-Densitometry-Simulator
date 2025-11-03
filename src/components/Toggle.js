import React from 'react';
import { TouchableOpacity, View, StyleSheet, Animated, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const Toggle = ({ value, onValueChange, disabled = false }) => {
  const { theme } = useTheme();
  const animatedValue = React.useRef(new Animated.Value(value ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: value ? 1 : 0,
      useNativeDriver: true,
      friction: 8,
      tension: 100,
    }).start();
  }, [value]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 26],
  });

  const backgroundColor = value ? theme.colors.primary : theme.colors.textDisabled;

  const handlePress = () => {
    if (!disabled && onValueChange) {
      onValueChange(!value);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={disabled}
      style={[
        styles.container,
        { backgroundColor },
        disabled && styles.disabled,
      ]}
    >
      <Animated.View
        style={[
          styles.circle,
          {
            transform: [{ translateX }],
            backgroundColor: '#FFFFFF',
          },
          theme.shadows.sm,
        ]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 52,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
      },
    }),
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default Toggle;