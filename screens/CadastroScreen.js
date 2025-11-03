import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { colors, spacing, typography } from '../src/styles/theme';
import { salvarPaciente } from '../utils/storage';

export default function CadastroScreen({ navigation }) {
  const [paciente, setPaciente] = useState('');
  const [idade, setIdade] = useState('');
  const [sexo, setSexo] = useState('');
  const [etnia, setEtnia] = useState('');
  const [exame, setExame] = useState('');

  const validarCampos = () => {
    if (!paciente || !idade || !sexo || !etnia || !exame) {
      Alert.alert('Atenção', 'Preencha todos os campos e selecione o exame.');
      return false;
    }
    return true;
  };

  const iniciarEscaneamento = () => {
    if (!validarCampos()) return;

    const novoPaciente = {
      id: Date.now().toString(),
      nome: paciente,
      idade,
      sexo,
      etnia,
      exame,
    };

    salvarPaciente(novoPaciente);

    navigation.navigate('Scan', {
      ...novoPaciente,
      vertebraSelecionada: null,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastro do Paciente</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome do paciente"
        value={paciente}
        onChangeText={setPaciente}
      />
      <TextInput
        style={styles.input}
        placeholder="Idade"
        keyboardType="numeric"
        value={idade}
        onChangeText={setIdade}
      />

      <Text style={styles.label}>Sexo:</Text>
      <View style={styles.optionRow}>
        {['Masculino', 'Feminino', 'Outro'].map((opcao) => (
          <TouchableOpacity
            key={opcao}
            style={[
              styles.optionButton,
              sexo === opcao && styles.optionSelected,
            ]}
            onPress={() => setSexo(opcao)}
          >
            <Text style={styles.optionText}>{opcao}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Etnia:</Text>
      <View style={styles.optionRow}>
        {['Branca', 'Parda', 'Preta', 'Amarela', 'Indígena'].map((opcao) => (
          <TouchableOpacity
            key={opcao}
            style={[
              styles.optionButton,
              etnia === opcao && styles.optionSelected,
            ]}
            onPress={() => setEtnia(opcao)}
          >
            <Text style={styles.optionText}>{opcao}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Tipo de Exame:</Text>
      <View style={styles.optionRow}>
        {['Coluna Lombar', 'Fêmur', 'Punho'].map((opcao) => (
          <TouchableOpacity
            key={opcao}
            style={[
              styles.optionButton,
              exame === opcao && styles.optionSelected,
            ]}
            onPress={() => setExame(opcao)}
          >
            <Text style={styles.optionText}>{opcao}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.scanButton} onPress={iniciarEscaneamento}>
        <Text style={typography.buttonText}>🧪 Iniciar Escaneamento</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  title: {
    ...typography.title,
    fontSize: 22,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: 'white',
  },
  label: {
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  optionButton: {
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: 8,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  optionSelected: {
    backgroundColor: colors.primary,
  },
  optionText: {
    color: colors.text,
    fontSize: 14,
  },
  scanButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
});
