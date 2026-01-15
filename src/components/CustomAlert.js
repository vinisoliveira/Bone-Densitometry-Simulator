import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

/**
 * Componente de Alert customizado no estilo do projeto
 * 
 * Props:
 * - visible: boolean - controla visibilidade do modal
 * - title: string - título do alert
 * - message: string - mensagem do alert
 * - type: 'info' | 'success' | 'warning' | 'error' - tipo do alert (define ícone e cor)
 * - buttons: array - array de botões [{text, onPress, style}]
 * - onClose: function - função chamada ao fechar
 */
export default function CustomAlert({ 
  visible, 
  title, 
  message, 
  type = 'info',
  buttons = [{ text: 'OK', onPress: () => {} }],
  onClose 
}) {
  
  const getIconConfig = () => {
    switch (type) {
      case 'success':
        return { name: 'check-circle', color: '#27AE60' };
      case 'warning':
        return { name: 'exclamation-triangle', color: '#F39C12' };
      case 'error':
        return { name: 'times-circle', color: '#E74C3C' };
      case 'info':
      default:
        return { name: 'info-circle', color: '#4A90E2' };
    }
  };

  const iconConfig = getIconConfig();

  const getButtonStyle = (buttonStyle) => {
    switch (buttonStyle) {
      case 'destructive':
        return styles.buttonDestructive;
      case 'cancel':
        return styles.buttonCancel;
      default:
        return styles.buttonDefault;
    }
  };

  const getButtonTextStyle = (buttonStyle) => {
    switch (buttonStyle) {
      case 'destructive':
        return styles.buttonTextDestructive;
      case 'cancel':
        return styles.buttonTextCancel;
      default:
        return styles.buttonTextDefault;
    }
  };

  // Função para formatar texto com palavras destacadas
  const formatMessage = (text) => {
    if (typeof text !== 'string') return text;
    
    // Definir palavras e seus estilos
    const highlights = [
      { word: 'ATENÇÃO:', style: { fontWeight: '700', color: '#E74C3C' } },
      { word: 'ATENÇÃO', style: { fontWeight: '700', color: '#E74C3C' } },
      { word: 'IRREVERSÍVEL!', style: { fontWeight: '700', color: '#F39C12' } },
      { word: 'IRREVERSÍVEL', style: { fontWeight: '700', color: '#F39C12' } },
    ];
    
    let parts = [{ text, style: null }];
    
    highlights.forEach(({ word, style }) => {
      const newParts = [];
      parts.forEach(part => {
        if (part.style) {
          newParts.push(part);
          return;
        }
        const regex = new RegExp(`(${word})`, 'gi');
        const splitParts = part.text.split(regex);
        splitParts.forEach(sp => {
          if (sp.toLowerCase() === word.toLowerCase()) {
            newParts.push({ text: sp, style });
          } else if (sp) {
            newParts.push({ text: sp, style: null });
          }
        });
      });
      parts = newParts;
    });
    
    return parts.map((part, index) => (
      <Text key={index} style={part.style}>
        {part.text}
      </Text>
    ));
  };

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Ícone */}
          <View style={[styles.iconContainer, { backgroundColor: `${iconConfig.color}20` }]}>
            <FontAwesome5 name={iconConfig.name} size={32} color={iconConfig.color} />
          </View>

          {/* Título */}
          <Text style={styles.title}>{title}</Text>

          {/* Mensagem */}
          <Text style={styles.message}>{formatMessage(message)}</Text>

          {/* Botões */}
          <View style={styles.buttonsContainer}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  getButtonStyle(button.style),
                  buttons.length > 1 && index === 0 && styles.buttonMarginRight,
                ]}
                onPress={() => {
                  if (button.onPress) button.onPress();
                  if (onClose) onClose();
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.buttonText, getButtonTextStyle(button.style)]}>
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#2a3142',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3a3f52',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    color: '#AAAAAA',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  buttonsContainer: {
    flexDirection: 'row',
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonMarginRight: {
    marginRight: 10,
  },
  buttonDefault: {
    backgroundColor: '#4A90E2',
  },
  buttonCancel: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3a3f52',
  },
  buttonDestructive: {
    backgroundColor: '#E74C3C',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  buttonTextDefault: {
    color: '#FFFFFF',
  },
  buttonTextCancel: {
    color: '#AAAAAA',
  },
  buttonTextDestructive: {
    color: '#FFFFFF',
  },
});
