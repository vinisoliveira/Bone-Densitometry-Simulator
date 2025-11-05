import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform, Animated, Easing } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors, spacing, typography } from '../src/styles/theme';
import { salvarPaciente } from '../utils/storage';

export default function CadastroScreen({ navigation }) {
  const [paciente, setPaciente] = useState('');
  const [idade, setIdade] = useState('');
  const [sexo, setSexo] = useState('');
  const [etnia, setEtnia] = useState('');
  const [exame, setExame] = useState('');
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  // Animações
  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;
  const particleAnimations = useRef([...Array(8)].map(() => ({
    translateY: new Animated.Value(0),
    translateX: new Animated.Value(0),
    opacity: new Animated.Value(1),
    scale: new Animated.Value(1),
  }))).current;

  const validarCampos = () => {
    if (!paciente || !idade || !sexo || !etnia || !exame) {
      Alert.alert('Atenção', 'Preencha todos os campos e selecione o exame.');
      return false;
    }
    return true;
  };

  const animarSucesso = () => {
    setShowSuccessAnimation(true);

    // Animação do círculo de sucesso
    Animated.sequence([
      Animated.parallel([
        Animated.spring(successScale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(successOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(checkmarkScale, {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();

    // Animação das partículas
    particleAnimations.forEach((particle, index) => {
      const angle = (index / 8) * Math.PI * 2;
      const distance = 100;
      
      Animated.parallel([
        Animated.timing(particle.translateX, {
          toValue: Math.cos(angle) * distance,
          duration: 800,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(particle.translateY, {
          toValue: Math.sin(angle) * distance,
          duration: 800,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(particle.opacity, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(particle.scale, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const resetarAnimacoes = () => {
    successScale.setValue(0);
    successOpacity.setValue(0);
    checkmarkScale.setValue(0);
    particleAnimations.forEach(particle => {
      particle.translateX.setValue(0);
      particle.translateY.setValue(0);
      particle.opacity.setValue(1);
      particle.scale.setValue(1);
    });
  };

  const iniciarEscaneamento = () => {
    if (!validarCampos()) return;

    // Gerar ID único aqui
    const idUnico = Date.now().toString();

    const novoPaciente = {
      id: idUnico,
      nome: paciente,
      idade,
      sexo,
      etnia,
      exame,
    };

    salvarPaciente(novoPaciente);

    // Mostrar animação de sucesso
    animarSucesso();

    // Navegar após a animação - PASSA O ID
    setTimeout(() => {
      resetarAnimacoes();
      setShowSuccessAnimation(false);
      navigation.navigate('Scan', {
        ...novoPaciente,
        vertebraSelecionada: null,
      });
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <FontAwesome5 name="arrow-left" size={20} color="#4A90E2" />
        </TouchableOpacity>
        <Text style={styles.title}>Novo Exame</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <View style={styles.inputIcon}>
                <FontAwesome5 name="user" size={16} color="#4A90E2" />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Nome do paciente"
                placeholderTextColor="#666"
                value={paciente}
                onChangeText={setPaciente}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputIcon}>
                <FontAwesome5 name="birthday-cake" size={16} color="#4A90E2" />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Idade"
                placeholderTextColor="#666"
                keyboardType="numeric"
                value={idade}
                onChangeText={setIdade}
              />
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <FontAwesome5 name="venus-mars" size={14} color="#4A90E2" />
                <Text style={styles.label}>Sexo</Text>
              </View>
              <View style={styles.optionRow}>
                {['Masculino', 'Feminino', 'Outro'].map((opcao) => (
                  <TouchableOpacity
                    key={opcao}
                    style={[
                      styles.optionButton,
                      sexo === opcao && styles.optionSelected,
                    ]}
                    onPress={() => setSexo(opcao)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.optionText,
                      sexo === opcao && styles.optionTextSelected
                    ]}>
                      {opcao}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <FontAwesome5 name="globe-americas" size={14} color="#4A90E2" />
                <Text style={styles.label}>Etnia</Text>
              </View>
              <View style={styles.optionRow}>
                {['Branca', 'Parda', 'Preta', 'Amarela', 'Indígena'].map((opcao) => (
                  <TouchableOpacity
                    key={opcao}
                    style={[
                      styles.optionButton,
                      etnia === opcao && styles.optionSelected,
                    ]}
                    onPress={() => setEtnia(opcao)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.optionText,
                      etnia === opcao && styles.optionTextSelected
                    ]}>
                      {opcao}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <FontAwesome5 name="x-ray" size={14} color="#4A90E2" />
                <Text style={styles.label}>Tipo de Exame</Text>
              </View>
              <View style={styles.examOptions}>
                {[
                  { nome: 'Coluna Lombar', icon: 'spine' },
                  { nome: 'Fêmur', icon: 'bone' },
                  { nome: 'Punho', icon: 'hand-paper' }
                ].map((opcao) => (
                  <TouchableOpacity
                    key={opcao.nome}
                    style={[
                      styles.examCard,
                      exame === opcao.nome && styles.examCardSelected,
                    ]}
                    onPress={() => setExame(opcao.nome)}
                    activeOpacity={0.7}
                  >
                    <FontAwesome5 
                      name={opcao.icon} 
                      size={24} 
                      color={exame === opcao.nome ? '#FFFFFF' : '#4A90E2'} 
                    />
                    <Text style={[
                      styles.examText,
                      exame === opcao.nome && styles.examTextSelected
                    ]}>
                      {opcao.nome}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.scanButton} 
            onPress={iniciarEscaneamento}
            activeOpacity={0.8}
          >
            <FontAwesome5 name="heartbeat" size={18} color="#FFFFFF" />
            <Text style={styles.scanText}>Iniciar Escaneamento</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Animação de Sucesso */}
      {showSuccessAnimation && (
        <View style={styles.successOverlay}>
          {/* Partículas */}
          {particleAnimations.map((particle, index) => (
            <Animated.View
              key={index}
              style={[
                styles.particle,
                {
                  transform: [
                    { translateX: particle.translateX },
                    { translateY: particle.translateY },
                    { scale: particle.scale },
                  ],
                  opacity: particle.opacity,
                  backgroundColor: index % 2 === 0 ? '#4A90E2' : '#00D9FF',
                },
              ]}
            />
          ))}

          {/* Círculo de Sucesso */}
          <Animated.View
            style={[
              styles.successCircle,
              {
                transform: [{ scale: successScale }],
                opacity: successOpacity,
              },
            ]}
          >
            <Animated.View
              style={[
                styles.checkmarkContainer,
                {
                  transform: [{ scale: checkmarkScale }],
                },
              ]}
            >
              <FontAwesome5 name="check" size={50} color="#FFFFFF" />
            </Animated.View>
          </Animated.View>

          {/* Texto de Sucesso */}
          <Animated.Text
            style={[
              styles.successText,
              {
                opacity: successOpacity,
                transform: [{ scale: successScale }],
              },
            ]}
          >
            Paciente Cadastrado!
          </Animated.Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1d29',
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
    backgroundColor: '#2a3142',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: '#2a3142',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1d29',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#3a3f52',
  },
  inputIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(74, 144, 226, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFFFFF',
  },
  section: {
    marginTop: 8,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    backgroundColor: '#1a1d29',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3a3f52',
  },
  optionSelected: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  optionText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  examOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  examCard: {
    flex: 1,
    backgroundColor: '#1a1d29',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#3a3f52',
    minHeight: 90,
  },
  examCardSelected: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  examText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    textAlign: 'center',
  },
  examTextSelected: {
    color: '#FFFFFF',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 10,
  },
  scanText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(26, 29, 41, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  checkmarkContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  successText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 30,
    textAlign: 'center',
  },
  particle: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
});
