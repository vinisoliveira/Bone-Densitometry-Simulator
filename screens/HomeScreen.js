import React, { memo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors, spacing, typography } from '../src/styles/theme';

const { width } = Dimensions.get('window');

const HomeScreen = memo(({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const navegarPara = (tela) => () => navigation.navigate(tela);

  const MenuItem = ({ icon, label, subtitle, onPress, delay = 0 }) => {
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const itemFadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(itemFadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }, []);

    return (
      <Animated.View
        style={[
          { 
            opacity: itemFadeAnim,
            transform: [{ scale: scaleAnim }] 
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={onPress}
          activeOpacity={0.7}
        >
          <View style={styles.menuIconContainer}>
            <FontAwesome5 name={icon} size={28} color="#4A90E2" solid />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuLabel}>{label}</Text>
            <Text style={styles.menuSubtitle}>{subtitle}</Text>
          </View>
          <FontAwesome5 name="chevron-right" size={18} color="#666" />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Botão de Configurações Flutuante */}
      <Animated.View 
        style={[
          styles.configButton,
          {
            opacity: fadeAnim,
            transform: [{ scale: fadeAnim }]
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.configButtonInner}
          onPress={navegarPara('Configuracoes')}
          activeOpacity={0.8}
        >
          <FontAwesome5 name="cog" size={24} color="#4A90E2" />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.logoContainer}>
          <FontAwesome5 name="bone" size={48} color="#4A90E2" />
        </View>
        <Text style={styles.title}>Bone Densitometry</Text>
        <Text style={styles.description}>
          Simulador para análise de densitometria óssea
        </Text>
      </Animated.View>

      <View style={styles.menuSection}> 
        <MenuItem
          icon="folder-open"
          label="Exames"
          subtitle="Visualizar exames"
          onPress={navegarPara('Lista')}
          delay={100}
        />
        
        <MenuItem
          icon="plus-circle"
          label="Novo Exame"
          subtitle="Adicionar paciente"
          onPress={navegarPara('Cadastro')}
          delay={200}
        />
        
        <MenuItem
          icon="info-circle"
          label="Sobre"
          subtitle="Informações do app"
          onPress={navegarPara('Sobre')}
          delay={300}
        />
      </View>
    </View>
  );
});

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1d29',
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
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '300',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  description: {
    fontSize: 14,
    color: '#999',
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
    color: '#FFFFFF',
    marginBottom: spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a3142',
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
    color: '#FFFFFF',
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#999',
  },
  footer: {
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
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
    backgroundColor: '#2a3142',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});
