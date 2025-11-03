import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Platform } from 'react-native';
import { useTheme } from '../src/context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function CadastroScreen({ navigation, pacientes, setPacientes }) {
  const { theme, isDarkMode } = useTheme();
  const [nome, setNome] = useState('');
  const [idade, setIdade] = useState('');
  const [sexo, setSexo] = useState('');
  const [etnia, setEtnia] = useState('');
  const [exame, setExame] = useState('');

  const handleGoBack = () => {
    if (navigation && typeof navigation.goBack === 'function') {
      navigation.goBack();
    } else if (Platform.OS === 'web' && window.history) {
      window.history.back();
    }
  };

  const validarCampos = () => {
    if (!nome || !idade || !sexo || !etnia || !exame) {
      if (Platform.OS === 'web') {
        alert('⚠️ Preencha todos os campos obrigatórios!');
      }
      return false;
    }
    return true;
  };

  const cadastrarPaciente = () => {
    if (!validarCampos()) return;

    const novoPaciente = {
      id: Date.now().toString(),
      nome,
      idade,
      sexo,
      etnia,
      exame,
      dataExame: new Date().toLocaleDateString('pt-BR'),
    };

    if (setPacientes) {
      setPacientes(prev => [...prev, novoPaciente]);
    }

    if (Platform.OS === 'web') {
      alert(`✅ ${novoPaciente.nome} cadastrado com sucesso!`);
      navigation.navigate('Lista');
    }
  };

  const sexoOptions = [
    { label: 'Masculino', value: 'Masculino', icon: '♂️', color: theme.colors.info },
    { label: 'Feminino', value: 'Feminino', icon: '♀️', color: theme.colors.secondary },
    { label: 'Outro', value: 'Outro', icon: '⚧', color: theme.colors.accent }
  ];

  const etniaOptions = [
    { value: 'Branca', icon: '👤' },
    { value: 'Parda', icon: '👤' },
    { value: 'Preta', icon: '👤' },
    { value: 'Amarela', icon: '👤' },
    { value: 'Indígena', icon: '👤' }
  ];
  
  const exameOptions = [
    { label: 'Coluna Lombar', value: 'Coluna Lombar', icon: '🦴' },
    { label: 'Fêmur', value: 'Fêmur', icon: '🦴' },
    { label: 'Punho', value: 'Punho', icon: '🦴' }
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
          : [theme.colors.secondary, theme.colors.secondaryLight]}
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
            backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.2)',
          }]}>
            <Text style={styles.headerIcon}>➕</Text>
          </View>
          <Text style={[styles.headerTitle, { 
            color: isDarkMode ? theme.colors.textPrimary : '#FFFFFF' 
          }]}>
            Novo Paciente
          </Text>
        </View>
        
        <View style={styles.headerSpacer} />
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Informações Pessoais */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            INFORMAÇÕES PESSOAIS
          </Text>
          
          <View style={[styles.card, { 
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
            ...theme.shadows.md,
          }]}>
            <View style={[styles.inputContainer, { 
              backgroundColor: theme.colors.surfaceLight,
              borderColor: nome ? theme.colors.primary : theme.colors.border,
            }]}>
              <Text style={styles.inputIcon}>👤</Text>
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="Nome completo"
                placeholderTextColor={theme.colors.textTertiary}
                value={nome}
                onChangeText={setNome}
              />
            </View>

            <View style={[styles.inputContainer, { 
              backgroundColor: theme.colors.surfaceLight,
              borderColor: idade ? theme.colors.primary : theme.colors.border,
            }]}>
              <Text style={styles.inputIcon}>📅</Text>
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="Idade"
                placeholderTextColor={theme.colors.textTertiary}
                keyboardType="numeric"
                value={idade}
                onChangeText={setIdade}
              />
            </View>
          </View>
        </View>

        {/* Sexo */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            SEXO
          </Text>
          <View style={styles.optionsGrid}>
            {sexoOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionCard,
                  { 
                    backgroundColor: theme.colors.card,
                    borderColor: sexo === option.value ? option.color : theme.colors.border,
                    borderWidth: sexo === option.value ? 2 : 1,
                    ...theme.shadows.sm,
                  }
                ]}
                onPress={() => setSexo(option.value)}
                activeOpacity={0.7}
              >
                {sexo === option.value && (
                  <LinearGradient
                    colors={[option.color + '20', 'transparent']}
                    style={styles.optionGradient}
                  />
                )}
                <Text style={styles.optionIcon}>{option.icon}</Text>
                <Text style={[styles.optionLabel, { 
                  color: sexo === option.value ? theme.colors.text : theme.colors.textSecondary 
                }]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Etnia */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            ETNIA
          </Text>
          <View style={styles.optionsWrap}>
            {etniaOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.chipOption,
                  { 
                    backgroundColor: etnia === option.value ? theme.colors.primary : theme.colors.card,
                    borderColor: etnia === option.value ? theme.colors.primary : theme.colors.border,
                  }
                ]}
                onPress={() => setEtnia(option.value)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipLabel, { 
                  color: etnia === option.value ? '#FFFFFF' : theme.colors.text 
                }]}>
                  {option.value}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tipo de Exame */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            TIPO DE EXAME
          </Text>
          <View style={styles.examOptionsContainer}>
            {exameOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.examCard,
                  { 
                    backgroundColor: theme.colors.card,
                    borderColor: exame === option.value ? theme.colors.accent : theme.colors.border,
                    borderWidth: exame === option.value ? 2 : 1,
                    ...theme.shadows.sm,
                  }
                ]}
                onPress={() => setExame(option.value)}
                activeOpacity={0.7}
              >
                {exame === option.value && (
                  <LinearGradient
                    colors={[theme.colors.accent + '20', 'transparent']}
                    style={styles.examGradient}
                  />
                )}
                <View style={[styles.examIconContainer, { 
                  backgroundColor: exame === option.value 
                    ? theme.colors.accent + '20' 
                    : theme.colors.surfaceLight 
                }]}>
                  <Text style={styles.examIcon}>{option.icon}</Text>
                </View>
                <Text style={[styles.examLabel, { 
                  color: exame === option.value ? theme.colors.text : theme.colors.textSecondary 
                }]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Botão Cadastrar */}
        <TouchableOpacity
          style={[styles.submitButton, { 
            backgroundColor: theme.colors.secondary,
            ...theme.shadows.lg,
          }]}
          onPress={cadastrarPaciente}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[theme.colors.secondary, theme.colors.secondaryLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitGradient}
          >
            <Text style={styles.submitIcon}>✓</Text>
            <Text style={styles.submitText}>Cadastrar Paciente</Text>
          </LinearGradient>
        </TouchableOpacity>
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
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 2,
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  optionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  optionCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    overflow: 'hidden',
  },
  optionGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  optionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  optionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chipOption: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
  },
  chipLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  examOptionsContainer: {
    gap: 12,
  },
  examCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 18,
    overflow: 'hidden',
  },
  examGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  examIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  examIcon: {
    fontSize: 24,
  },
  examLabel: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  submitButton: {
    borderRadius: 18,
    overflow: 'hidden',
    marginTop: 12,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  submitIcon: {
    fontSize: 22,
    color: '#FFFFFF',
    marginRight: 10,
  },
  submitText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
