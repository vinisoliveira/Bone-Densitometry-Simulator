import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, ScrollView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors, spacing, typography } from '../src/styles/theme';
import { useTheme } from '../src/contexts/ThemeContext';

const { width } = Dimensions.get('window');

const HomeScreen = memo(({ navigation }) => {
  const { theme } = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const navegarPara = (tela) => () => navigation.navigate(tela);

  const MenuItem = ({ icon, label, subtitle, onPress }) => {
    return (
      <View>
        <TouchableOpacity 
          style={[styles.menuItem, { backgroundColor: theme.surface }]}
          onPress={onPress}
          activeOpacity={0.7}
        >
          <View style={[styles.menuIconContainer, { backgroundColor: theme.isDark ? 'rgba(74, 144, 226, 0.15)' : 'rgba(74, 144, 226, 0.1)' }]}>
            <FontAwesome5 name={icon} size={28} color="#4A90E2" solid />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={[styles.menuLabel, { color: theme.text }]}>{label}</Text>
            <Text style={[styles.menuSubtitle, { color: theme.textMuted }]}>{subtitle}</Text>
          </View>
          <FontAwesome5 name="chevron-right" size={18} color={theme.textMuted} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Botão de Configurações Flutuante */}
      <View style={styles.configButton}>
        <TouchableOpacity 
          style={[styles.configButtonInner, { backgroundColor: theme.surface }]}
          onPress={navegarPara('Configuracoes')}
          activeOpacity={0.8}
        >
          <FontAwesome5 name="cog" size={24} color="#4A90E2" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/icons/5846d2bc-7a92-48a8-9468-6d4e3fde6a97.png')} 
            style={styles.logoImage}
          />
        </View>
        <Text style={[styles.title, { color: theme.text }]}>Bone Densitometry Simulator</Text>
        <Text style={[styles.description, { color: theme.textMuted }]}>
          Simulador para análise de densitometria óssea
        </Text>
      </View>

      <View style={styles.menuSection}> 
        <MenuItem
          icon="folder-open"
          label="Exames"
          subtitle="Visualizar exames"
          onPress={navegarPara('Lista')}
        />
        
        <MenuItem
          icon="plus-circle"
          label="Novo Exame"
          subtitle="Adicionar paciente"
          onPress={navegarPara('Cadastro')}
        />
        
        <MenuItem
          icon="info-circle"
          label="Sobre"
          subtitle="Informações do app"
          onPress={navegarPara('Sobre')}
        />
      </View>
      </ScrollView>
    </View>
  );
});

export default HomeScreen;

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  header: {
    paddingTop: spacing.xl * 2,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  logoImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '300',
    color: theme.text,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  description: {
    fontSize: 14,
    color: theme.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  menuSection: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text,
    marginBottom: spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(74, 144, 226, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 14,
    color: theme.textMuted,
  },
  footer: {
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: theme.textMuted,
    textAlign: 'center',
  },
  configButton: {
    position: 'absolute',
    top: spacing.xl,
    right: spacing.lg,
    zIndex: 1,
  },
  configButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});
