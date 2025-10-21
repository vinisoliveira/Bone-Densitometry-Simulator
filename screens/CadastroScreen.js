import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SelectorModal = ({ label, value, options, onChange }) => {
  const [visible, setVisible] = useState(false);

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setVisible(true)}
      >
        <Text style={styles.selectorText}>
          {value || `Selecione ${label.toLowerCase()}`}
        </Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => {
                    onChange(item);
                    setVisible(false);
                  }}
                >
                  <Text style={styles.optionText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const CadastroScreen = ({ navigation, pacientes, setPacientes }) => {
  const [nome, setNome] = useState('');
  const [idade, setIdade] = useState('');
  const [sexo, setSexo] = useState('');
  const [etnia, setEtnia] = useState('');
  const [exame, setExame] = useState('');
  const idsGerados = useRef(new Set());

  const gerarIdUnico = () => {
    let id;
    let tentativas = 0;
    do {
      const numero = Math.floor(Math.random() * (500 - 100 + 1)) + 100;
      id = numero.toString().padStart(5, '0');
      tentativas++;
    } while (idsGerados.current.has(id) && tentativas < 1000);

    idsGerados.current.add(id);
    return id;
  };

  const handleSalvar = () => {
    if (!nome || !idade || !sexo || !etnia || !exame) {
      Alert.alert('Campos obrigatórios', 'Preencha todos os campos antes de salvar.');
      return;
    }

    const id = gerarIdUnico();

    const novoPaciente = {
      id,
      nome,
      idade,
      sexo,
      etnia,
      exame,
    };

    setPacientes((prev) => [...prev, novoPaciente]);
    navigation.navigate('Exame', novoPaciente);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="document-text" size={28} color="#00e6e6" />
        <Text style={styles.title}>Cadastro de Exame</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Nome completo</Text>
        <TextInput
          style={styles.input}
          value={nome}
          onChangeText={setNome}
          placeholder="Digite o nome"
          placeholderTextColor="#aaa"
        />

        <Text style={styles.label}>Idade</Text>
        <TextInput
          style={styles.input}
          value={idade}
          onChangeText={setIdade}
          placeholder="Digite a idade"
          placeholderTextColor="#aaa"
          keyboardType="numeric"
        />

        <SelectorModal
          label="Sexo"
          value={sexo}
          onChange={setSexo}
          options={['Masculino', 'Feminino', 'Outro']}
        />

        <SelectorModal
          label="Etnia"
          value={etnia}
          onChange={setEtnia}
          options={['Branca', 'Negra', 'Parda', 'Amarela', 'Indígena']}
        />

        <SelectorModal
          label="Tipo de exame"
          value={exame}
          onChange={setExame}
          options={['coluna_lombar_ap.jpg', 'femur_esquerdo.jpg']}
        />

        <TouchableOpacity style={styles.button} onPress={handleSalvar}>
          <Ionicons name="save" size={20} color="#00e6e6" style={styles.icon} />
          <Text style={styles.buttonText}>Salvar Exame</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Ionicons name="home" size={20} color="#00e6e6" style={styles.icon} />
          <Text style={styles.buttonText}>Voltar para Início</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a1f44', padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  title: { color: '#e6f2ff', fontSize: 24, fontWeight: 'bold', marginLeft: 10 },
  card: { backgroundColor: '#1e2a38', padding: 20, borderRadius: 10 },
  label: { color: '#00e6e6', fontSize: 14, marginTop: 15 },
  input: {
    backgroundColor: '#2c3e50',
    color: '#e6f2ff',
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
  },
  selector: {
    backgroundColor: '#2c3e50',
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
  },
  selectorText: { color: '#e6f2ff', fontSize: 16 },
  button: {
    flexDirection: 'row',
    backgroundColor: '#2c3e50',
    padding: 15,
    borderRadius: 10,
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeButton: {
    flexDirection: 'row',
    backgroundColor: '#2c3e50',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  buttonText: { color: '#e6f2ff', fontSize: 16, marginLeft: 10 },
  icon: { marginRight: 5 },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#1e2a38',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  option: { paddingVertical: 12 },
  optionText: { color: '#e6f2ff', fontSize: 16 },
});

export default CadastroScreen;
