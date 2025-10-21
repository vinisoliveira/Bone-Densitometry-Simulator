import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

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
    <View style={styles.container}>
      <Text style={styles.title}>Cadastro do Paciente</Text>

      <TextInput
        placeholder="Nome"
        value={nome}
        onChangeText={setNome}
        style={styles.input}
      />
      <TextInput
        placeholder="Idade"
        value={idade}
        onChangeText={setIdade}
        keyboardType="numeric"
        style={styles.input}
      />

      <Text style={styles.label}>Sexo:</Text>
      {renderOptions(['Masculino', 'Feminino', 'Outro'], sexo, setSexo)}

      <Text style={styles.label}>Etnia:</Text>
      {renderOptions(['Branca', 'Parda', 'Preta', 'Amarela', 'Indígena'], etnia, setEtnia)}

      <Text style={styles.label}>Tipo de Exame:</Text>
      {renderOptions(['Coluna Lombar', 'Raio-X Torácico', 'Tomografia Cervical'], exame, setExame)}

      <View style={{ marginTop: 30 }}>
        <Button title="Iniciar Escaneamento" onPress={iniciarExame} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 5, marginTop: 10 },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 10,
    marginBottom: 10,
  },
  optionSelected: {
    backgroundColor: '#007aff',
    borderColor: '#007aff',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
  },
  optionTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
