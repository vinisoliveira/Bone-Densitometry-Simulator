import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'PACIENTES';

// Cache simples para evitar leituras desnecessárias
let cacheMemoria = null;
let ultimaAtualizacao = 0;
const CACHE_DURATION = 30000; // 30 segundos

export const salvarPaciente = async (novoPaciente) => {
  try {
    const dadosExistentes = await AsyncStorage.getItem(STORAGE_KEY);
    const lista = dadosExistentes ? JSON.parse(dadosExistentes) : [];
    lista.push(novoPaciente);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    
    // Atualizar cache
    cacheMemoria = lista;
    ultimaAtualizacao = Date.now();
    
    return lista;
  } catch (error) {
    console.error('Erro ao salvar paciente:', error);
    throw error;
  }
};

export const carregarPacientes = async () => {
  try {
    // Verificar se cache ainda é válido
    const agora = Date.now();
    if (cacheMemoria && (agora - ultimaAtualizacao) < CACHE_DURATION) {
      return cacheMemoria;
    }

    const dados = await AsyncStorage.getItem(STORAGE_KEY);
    const pacientes = dados ? JSON.parse(dados) : [];
    
    // Atualizar cache
    cacheMemoria = pacientes;
    ultimaAtualizacao = agora;
    
    return pacientes;
  } catch (error) {
    console.error('Erro ao carregar pacientes:', error);
    return [];
  }
};

export const limparCache = () => {
  cacheMemoria = null;
  ultimaAtualizacao = 0;
};
