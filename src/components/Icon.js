import React from 'react';
import { Platform, Text, View } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { theme } from '../styles/theme';

// Mapeamento de ícones para emojis (fallback para web)
const iconEmojiMap = {
  'user': '👤',
  'user-group': '👥',
  'calendar-alt': '📅',
  'stethoscope': '🩺',
  'trash': '🗑️',
  'plus': '➕',
  'arrow-left': '←',
  'arrow-right': '→',
  'check': '✓',
  'times': '✕',
  'cog': '⚙️',
  'home': '🏠',
  'list': '📋',
  'chart-bar': '📊',
  'file-medical': '📄',
  'search': '🔍',
  'edit': '✏️',
  'save': '💾',
  'print': '🖨️',
  'share': '📤',
  'download': '⬇️',
  'info-circle': 'ℹ️',
  'exclamation-triangle': '⚠️',
  'bone': '🦴',
};

const Icon = ({ 
  name, 
  size = 20, 
  color = theme.colors.text, 
  style = {},
  ...props 
}) => {
  // Na web, usar emojis como fallback
  if (Platform.OS === 'web') {
    // Extrair o nome do ícone se for um objeto FontAwesome
    const iconName = typeof name === 'object' ? name.iconName : name;
    const emoji = iconEmojiMap[iconName] || '•';
    
    return (
      <Text 
        style={[
          { 
            fontSize: size, 
            color: color,
            lineHeight: size + 4,
          }, 
          style
        ]}
        {...props}
      >
        {emoji}
      </Text>
    );
  }
  
  // No mobile, usar FontAwesome normalmente
  return (
    <FontAwesomeIcon 
      icon={name} 
      size={size} 
      color={color} 
      style={style}
      {...props}
    />
  );
};

export default Icon;