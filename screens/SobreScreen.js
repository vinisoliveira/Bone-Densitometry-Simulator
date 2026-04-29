import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../src/contexts/ThemeContext';


const SobreScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const InfoCard = ({ icon, title, children }) => (
    <View style={[styles.card, { backgroundColor: theme.surface }]}>
      <View style={[styles.cardHeader, { borderBottomColor: theme.border }]}>
        <View style={styles.iconWrapper}>
          <FontAwesome5 name={icon} size={24} color="#667eea" />
        </View>
        <Text style={[styles.cardTitle, { color: theme.text }]}>{title}</Text>
      </View>
      <View style={styles.cardContent}>
        {children}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: theme.surfaceAlt }]}
          onPress={() => navigation.goBack()}
        >
          <FontAwesome5 name="arrow-left" size={20} color="#4A90E2" />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Sobre o Projeto</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoContainer}>
          <View style={[styles.logoCircle, { backgroundColor: theme.surface }]}>
            <FontAwesome5 name="blog" size={48} color="#4A90E2" />
          </View>
          <Text style={[styles.appName, { color: theme.text }]}>Bone Densitometry</Text>
          <Text style={[styles.appVersion, { color: theme.textMuted }]}>Simulator v1.0</Text>
        </View>

        <InfoCard icon="bullseye" title="Propósito">
          <Text style={[styles.text, { color: theme.textSecondary }]}>
            Este projeto é voltado para visualização e organização de exames de imagem, 
            com foco em radiografias da coluna e membros. Ele simula o ambiente de um 
            laboratório moderno, oferecendo uma experiência imersiva e funcional.
          </Text>
        </InfoCard>

        <InfoCard icon="code" title="Tecnologias">
          <View style={styles.techList}>
            <TechItem icon="react" name="React Native" />
            <TechItem icon="mobile-alt" name="Expo" />
            <TechItem icon="route" name="React Navigation" />
            <TechItem icon="font" name="FontAwesome Icons" />
          </View>
        </InfoCard>

        <InfoCard icon="users" title="Desenvolvedores">
          <View style={styles.devList}>
            <DevItem name="Bernardo Nascimento" />
            <DevItem name="Vinícius Oliveira" />
            <DevItem name="Fernando Vinícius" />
          </View>
        </InfoCard>

        <InfoCard icon="graduation-cap" title="Turma Radiologia">
          <Text style={[styles.classText, { color: theme.textSecondary }]}>
            Projeto desenvolvido como parte do curso de Radiologia, 
            demonstrando aplicações práticas da tecnologia na área da saúde.
          </Text>
        </InfoCard>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textMuted }]}>© 2025 AIFP</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const TechItem = ({ icon, name }) => {
  const { theme } = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.techItem}>
      <FontAwesome5 name={icon} size={16} color="#667eea" />
      <Text style={[styles.techText, { color: theme.textSecondary }]}>{name}</Text>
    </View>
  );
};

const DevItem = ({ name }) => {
  const { theme } = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.devItem}>
      <View style={styles.devIcon}>
        <FontAwesome5 name="user" size={16} color="#667eea" />
      </View>
      <Text style={[styles.devText, { color: theme.textSecondary }]}>{name}</Text>
    </View>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: theme.textMuted,
  },
  card: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(74, 144, 226, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  cardContent: {
    padding: 16,
  },
  text: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 22,
  },
  techList: {
    gap: 12,
  },
  techItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  techText: {
    fontSize: 14,
    color: theme.textSecondary,
    fontWeight: '500',
  },
  devList: {
    gap: 12,
  },
  devItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  devIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(74, 144, 226, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  devText: {
    fontSize: 14,
    color: theme.textSecondary,
    fontWeight: '600',
  },
  classText: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 22,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    color: theme.textMuted,
  },
});

export default SobreScreen;
