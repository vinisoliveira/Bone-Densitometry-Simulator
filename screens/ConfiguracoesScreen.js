import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { useTheme } from '../src/context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import Toggle from '../src/components/Toggle';

export default function ConfiguracoesScreen({ navigation }) {
  const { theme, isDarkMode, toggleTheme } = useTheme();

  const handleGoBack = () => {
    console.log('Navegando de volta...');
    if (navigation && typeof navigation.goBack === 'function') {
      navigation.goBack();
    } else if (Platform.OS === 'web' && window.history) {
      window.history.back();
    }
  };

  const settingsSections = [
    {
      title: 'APARÊNCIA',
      items: [
        {
          icon: isDarkMode ? '🌙' : '☀️',
          label: 'Modo Escuro',
          description: 'Interface otimizada para ambientes com pouca luz',
          type: 'toggle',
          value: isDarkMode,
          onToggle: toggleTheme,
          gradient: [theme.colors.primary, theme.colors.primaryLight],
        },
      ],
    },
    {
      title: 'INFORMAÇÕES',
      items: [
        {
          icon: 'ℹ️',
          label: 'Versão do Aplicativo',
          description: '1.0.0',
          type: 'info',
          gradient: [theme.colors.info, theme.colors.infoLight],
        },
        {
          icon: '📄',
          label: 'Licença',
          description: 'Open Source - MIT License',
          type: 'info',
          gradient: [theme.colors.secondary, theme.colors.secondaryLight],
        },
        {
          icon: '👨‍💻',
          label: 'Desenvolvedores',
          description: 'Equipe de Desenvolvimento',
          type: 'info',
          gradient: [theme.colors.accent, theme.colors.accentLight],
        },
      ],
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.colors.background}
      />
      
      {/* Header Profissional */}
      <LinearGradient
        colors={isDarkMode 
          ? [theme.colors.backgroundLight, theme.colors.surface] 
          : [theme.colors.primary, theme.colors.primaryLight]}
        style={styles.header}
      >
        <TouchableOpacity 
          style={[styles.backButton, { 
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)',
          }]}
          onPress={handleGoBack}
          activeOpacity={0.7}
        >
          <Text style={[styles.backArrow, { 
            color: isDarkMode ? theme.colors.textPrimary : '#FFFFFF' 
          }]}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <View style={[styles.headerIconContainer, { 
            backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.2)',
          }]}>
            <Text style={styles.headerIcon}>⚙️</Text>
          </View>
          <Text style={[styles.headerTitle, { 
            color: isDarkMode ? theme.colors.textPrimary : '#FFFFFF' 
          }]}>
            Configurações
          </Text>
        </View>
        
        <View style={styles.headerSpacer} />
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
              {section.title}
            </Text>
            
            {section.items.map((item, itemIndex) => (
              <View
                key={itemIndex}
                style={[styles.settingCard, { 
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                  ...theme.shadows.md,
                }]}
              >
                {/* Gradiente sutil no fundo */}
                <LinearGradient
                  colors={[...item.gradient, 'transparent']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cardGradient}
                />
                
                <View style={styles.settingContent}>
                  <View style={[styles.settingIcon, { 
                    backgroundColor: item.gradient[0] + (isDarkMode ? '30' : '20'),
                  }]}>
                    <Text style={styles.settingEmoji}>{item.icon}</Text>
                  </View>
                  
                  <View style={styles.settingText}>
                    <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                      {item.label}
                    </Text>
                    <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                      {item.description}
                    </Text>
                  </View>
                  
                  {item.type === 'toggle' && (
                    <Toggle
                      value={item.value}
                      onValueChange={item.onToggle}
                    />
                  )}
                </View>
              </View>
            ))}
          </View>
        ))}

        {/* Botão de Ação */}
        <TouchableOpacity
          style={[styles.actionButton, { 
            backgroundColor: theme.colors.primary,
            ...theme.shadows.lg,
          }]}
          onPress={handleGoBack}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.actionButtonGradient}
          >
            <Text style={styles.actionButtonIcon}>🏠</Text>
            <Text style={styles.actionButtonText}>Voltar para Início</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footerContainer}>
          <View style={[styles.footerBadge, { 
            backgroundColor: theme.colors.surfaceLight,
            borderColor: theme.colors.border,
          }]}>
            <View style={[styles.footerDot, { backgroundColor: theme.colors.success }]} />
            <Text style={[styles.footerText, { color: theme.colors.textTertiary }]}>
              Configurações salvas automaticamente
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerIcon: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  headerSpacer: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 16,
    marginLeft: 4,
  },
  settingCard: {
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.03,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
  },
  settingIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingEmoji: {
    fontSize: 28,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  actionButton: {
    borderRadius: 18,
    overflow: 'hidden',
    marginTop: 8,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  actionButtonIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  actionButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  footerContainer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  footerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '600',
  },
});