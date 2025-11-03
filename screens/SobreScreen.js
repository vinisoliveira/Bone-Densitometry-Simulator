import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../src/context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function SobreScreen({ navigation }) {
  const { theme, isDarkMode } = useTheme();

  const handleGoBack = () => {
    if (navigation && typeof navigation.goBack === 'function') {
      navigation.goBack();
    } else if (Platform.OS === 'web' && window.history) {
      window.history.back();
    }
  };

  const tecnologias = [
    { name: 'React Native', icon: '⚛️', color: theme.colors.info },
    { name: 'Expo', icon: '📱', color: theme.colors.primary },
    { name: 'React Navigation', icon: '🧭', color: theme.colors.secondary },
  ];

  const desenvolvedores = [
    { name: 'Bernardo Nascimento', role: 'Full Stack Developer', icon: '💻' },
    { name: 'Vinícius Oliveira', role: 'Frontend Developer', icon: '🎨' },
    { name: 'Fernando Vinícius', role: 'Backend Developer', icon: '⚙️' }
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.colors.background}
      />
      
      {/* Header */}
      <LinearGradient
        colors={isDarkMode 
          ? [theme.colors.backgroundLight, theme.colors.surface] 
          : [theme.colors.info, theme.colors.infoLight]}
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
            <Text style={styles.headerIcon}>ℹ️</Text>
          </View>
          <Text style={[styles.headerTitle, { 
            color: isDarkMode ? theme.colors.textPrimary : '#FFFFFF' 
          }]}>
            Sobre o Projeto
          </Text>
        </View>
        
        <View style={styles.headerSpacer} />
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Propósito */}
        <View style={styles.section}>
          <View style={[styles.card, { 
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
            ...theme.shadows.md,
          }]}>
            <LinearGradient
              colors={[theme.colors.primary + '15', 'transparent']}
              style={styles.cardGradient}
            />
            <View style={[styles.cardIcon, { backgroundColor: theme.colors.primary + '20' }]}>
              <Text style={styles.cardEmoji}>🎯</Text>
            </View>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Propósito do Sistema
            </Text>
            <Text style={[styles.cardText, { color: theme.colors.textSecondary }]}>
              Sistema educacional voltado para visualização e organização de exames de 
              densitometria óssea, com foco em radiografias da coluna e membros. 
              Oferece uma experiência imersiva e funcional para fins acadêmicos.
            </Text>
          </View>
        </View>

        {/* Tecnologias */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            TECNOLOGIAS UTILIZADAS
          </Text>
          {tecnologias.map((tech, index) => (
            <View
              key={index}
              style={[styles.techCard, { 
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
                ...theme.shadows.sm,
              }]}
            >
              <LinearGradient
                colors={[tech.color + '15', 'transparent']}
                style={styles.techGradient}
              />
              <View style={[styles.techIcon, { backgroundColor: tech.color + '20' }]}>
                <Text style={styles.techEmoji}>{tech.icon}</Text>
              </View>
              <Text style={[styles.techName, { color: theme.colors.text }]}>
                {tech.name}
              </Text>
            </View>
          ))}
        </View>

        {/* Desenvolvedores */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            EQUIPE DE DESENVOLVIMENTO
          </Text>
          {desenvolvedores.map((dev, index) => (
            <View
              key={index}
              style={[styles.devCard, { 
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
                ...theme.shadows.md,
              }]}
            >
              <LinearGradient
                colors={[theme.colors.secondary, theme.colors.secondaryLight]}
                style={styles.devAvatar}
              >
                <Text style={styles.devAvatarText}>
                  {dev.name.split(' ').map(n => n[0]).join('')}
                </Text>
              </LinearGradient>
              <View style={styles.devInfo}>
                <Text style={[styles.devName, { color: theme.colors.text }]}>
                  {dev.name}
                </Text>
                <Text style={[styles.devRole, { color: theme.colors.textSecondary }]}>
                  {dev.icon} {dev.role}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={[styles.footerCard, { 
          backgroundColor: theme.colors.surfaceLight,
          borderColor: theme.colors.border,
        }]}>
          <Text style={[styles.footerTitle, { color: theme.colors.text }]}>
            Sistema Educacional
          </Text>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            Desenvolvido para fins acadêmicos e educacionais
          </Text>
          <Text style={[styles.footerVersion, { color: theme.colors.textTertiary }]}>
            Versão 1.0.0 • 2024
          </Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -44,
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
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  cardIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardEmoji: {
    fontSize: 32,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 24,
  },
  techCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 18,
    marginBottom: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  techGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  techIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  techEmoji: {
    fontSize: 24,
  },
  techName: {
    fontSize: 17,
    fontWeight: '700',
  },
  devCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
  },
  devAvatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  devAvatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  devInfo: {
    flex: 1,
  },
  devName: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  devRole: {
    fontSize: 14,
    fontWeight: '600',
  },
  footerCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    marginTop: 16,
  },
  footerTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  footerVersion: {
    fontSize: 12,
    fontWeight: '600',
  },
});
