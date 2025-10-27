import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography } from '../src/styles/theme';

export default function CadastroScreen() {
  const navigation = useNavigation();
  const [nome, setNome] = useState('');
  const [idade, setIdade] = useState('');
  const [sexo, setSexo] = useState('Masculino');
  const [etnia, setEtnia] = useState('Parda');
  const [exame, setExame] = useState('Coluna Lombar');

  const iniciarExame = () => {
    if (!nome || !idade) {
      alert('Preencha nome e idade!');
      return;
    }

    navigation.navigate('Scan', {
      paciente: nome,
      idade,
      sexo,
      etnia,
      exame,
    });
  };

  const renderOptions = (options, selected, setSelected) => (
    <View style={styles.optionRow}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt}
          style={[
            styles.optionButton,
            selected === opt && styles.optionSelected,
          ]}
          onPress={() => setSelected(opt)}
        >
          <Text
            style={[
              styles.optionText,
              selected === opt && styles.optionTextSelected,
            ]}
          >
            {opt}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Cadastro do Paciente</Text>

      <TextInput
        placeholder="Nome"
        value={nome}
        onChangeText={setNome}
        style={styles.input}
        placeholderTextColor={colors.muted}
      />
      <TextInput
        placeholder="Idade"
        value={idade}
        onChangeText={setIdade}
        keyboardType="numeric"
        style={styles.input}
        placeholderTextColor={colors.muted}
      />

      <Text style={styles.label}>Sexo:</Text>
      {renderOptions(['Masculino', 'Feminino', 'Outro'], sexo, setSexo)}

      <Text style={styles.label}>Etnia:</Text>
      {renderOptions(['Branca', 'Parda', 'Preta', 'Amarela', 'Indígena'], etnia, setEtnia)}

      <Text style={styles.label}>Tipo de Exame:</Text>
      {renderOptions(['Coluna Lombar', 'Fêmur', 'Punho'], exame, setExame)}

      <TouchableOpacity style={styles.button} onPress={iniciarExame}>
        <Text style={typography.buttonText}>Iniciar Escaneamento</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  title: {
    ...typography.title,
    color: colors.primary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
  },
  label: {
    ...typography.label,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  optionButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  optionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: 14,
    color: colors.text,
  },
  optionTextSelected: {
    color: colors.surface,
    fontWeight: '600',
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
});
