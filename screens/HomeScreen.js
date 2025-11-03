import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, StatusBar } from 'react-native';
import { useTheme } from '../src/context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen({ navigation }) {
  const { theme, isDarkMode } = useTheme();

  const menuItems = [
    { 
      title: 'Exames', 
      icon: '📋',
      subtitle: 'Visualizar histórico',
      color: theme.colors.info,
      gradient: [theme.colors.info, theme.colors.infoLight],
      route: 'Lista'
    },
    { 
      title: 'Novo Exame', 
      icon: '➕',
      subtitle: 'Cadastrar paciente',
      color: theme.colors.secondary,
      gradient: [theme.colors.secondary, theme.colors.secondaryLight],
      route: 'Cadastro'
    },
    { 
      title: 'Densitometria', 
      icon: '🔬',
      subtitle: 'Realizar análise',
      color: theme.colors.accent,
      gradient: [theme.colors.accent, theme.colors.accentLight],
      route: 'Scan'
    },
  ];

  const quickActions = [
    { 
      title: 'Configurações', 
      icon: '⚙️',
      route: 'Configuracoes',
      color: theme.colors.textTertiary
    },
    { 
      title: 'Sobre', 
      icon: 'ℹ️',
      route: 'Sobre',
      color: theme.colors.textTertiary
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.colors.background}
      />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header com Gradiente */}
        <LinearGradient
          colors={isDarkMode 
            ? [theme.colors.backgroundLight, theme.colors.surface] 
            : [theme.colors.primary, theme.colors.primaryLight]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            {/* Logo com Efeito Glass */}
            <View style={[styles.logoContainer, { 
              backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.2)',
              borderColor: isDarkMode ? theme.colors.primary : 'rgba(255, 255, 255, 0.3)',
            }]}>
              <Text style={styles.logoIcon}>🦴</Text>
            </View>
            
            <Text style={[styles.title, { color: isDarkMode ? theme.colors.textPrimary : '#FFFFFF' }]}>
              Densitometria Óssea
            </Text>
            <Text style={[styles.subtitle, { color: isDarkMode ? theme.colors.textSecondary : 'rgba(255, 255, 255, 0.9)' }]}>
              Sistema Profissional de Análise
            </Text>
            
            {/* Badge de Status */}
            <View style={[styles.statusBadge, { 
              backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.25)',
              borderColor: isDarkMode ? theme.colors.primary : 'rgba(255, 255, 255, 0.4)',
            }]}>
              <View style={[styles.statusDot, { backgroundColor: theme.colors.success }]} />
              <Text style={[styles.statusText, { color: isDarkMode ? theme.colors.textSecondary : '#FFFFFF' }]}>
                Sistema Online
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Cards Principais */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
              MENU PRINCIPAL
            </Text>
            
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.mainCard, { 
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                  ...theme.shadows.lg,
                }]}
                onPress={() => navigation.navigate(item.route)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={item.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cardGradient}
                />
                
                <View style={styles.cardContent}>
                  <View style={[styles.iconContainer, { 
                    backgroundColor: item.color + (isDarkMode ? '30' : '20'),
                  }]}>
                    <Text style={styles.cardIcon}>{item.icon}</Text>
                  </View>
                  
                  <View style={styles.cardTextContainer}>
                    <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                      {item.title}
                    </Text>
                    <Text style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]}>
                      {item.subtitle}
                    </Text>
                  </View>
                  
                  <View style={[styles.arrowContainer, { backgroundColor: item.color + '15' }]}>
                    <Text style={[styles.arrow, { color: item.color }]}>›</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Ações Rápidas */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
              AÇÕES RÁPIDAS
            </Text>
            
            <View style={styles.quickActionsRow}>
              {quickActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.quickActionCard, { 
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border,
                    ...theme.shadows.md,
                  }]}
                  onPress={() => navigation.navigate(action.route)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.quickActionIcon, { 
                    backgroundColor: theme.colors.surfaceLight 
                  }]}>
                    <Text style={styles.quickActionEmoji}>{action.icon}</Text>
                  </View>
                  <Text style={[styles.quickActionText, { color: theme.colors.text }]}>
                    {action.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Footer Info */}
          <View style={[styles.footer, { 
            backgroundColor: theme.colors.surfaceLight,
            borderColor: theme.colors.border,
          }]}>
            <Text style={[styles.footerText, { color: theme.colors.textTertiary }]}>
              Sistema Educacional de Densitometria
            </Text>
            <Text style={[styles.footerVersion, { color: theme.colors.textDisabled }]}>
              Versão 1.0.0 • {isDarkMode ? '🌙' : '☀️'} Modo {isDarkMode ? 'Escuro' : 'Claro'}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3,
  },
  logoIcon: {
    fontSize: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  content: {
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
  mainCard: {
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.05,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardIcon: {
    fontSize: 32,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  arrowContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionEmoji: {
    fontSize: 28,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    marginTop: 16,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  footerVersion: {
    fontSize: 11,
    fontWeight: '500',
  },
});
