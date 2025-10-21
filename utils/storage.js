// utils/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export const salvarPaciente = async (paciente) => {
  try {
    const pacientes = await AsyncStorage.getItem('pacientes');
    const lista = pacientes ? JSON.parse(pacientes) : [];
    lista.push(paciente);
    await AsyncStorage.setItem('pacientes', JSON.stringify(lista));
  } catch (e) {
    console.error('Erro ao salvar paciente', e);
  }
};

export const consultarPacientes = async () => {
  try {
    const pacientes = await AsyncStorage.getItem('pacientes');
    return pacientes ? JSON.parse(pacientes) : [];
  } catch (e) {
    console.error('Erro ao consultar pacientes', e);
    return [];
  }
};
