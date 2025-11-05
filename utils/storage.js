import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'PACIENTES';

export const salvarPaciente = async (novoPaciente) => {
  try {
    const dadosExistentes = await AsyncStorage.getItem(STORAGE_KEY);
    const lista = dadosExistentes ? JSON.parse(dadosExistentes) : [];
    lista.push(novoPaciente);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
  } catch (error) {
    console.error('Erro ao salvar paciente:', error);
  }
};

export const carregarPacientes = async () => {
  try {
    const dados = await AsyncStorage.getItem(STORAGE_KEY);
    const lista = dados ? JSON.parse(dados) : [];
    return lista;
  } catch (error) {
    console.error('❌ Erro ao carregar pacientes:', error);
    return [];
  }
};

let cacheMemoria = null;
let ultimaAtualizacao = 0;

export const limparCache = () => {
  cacheMemoria = null;
  ultimaAtualizacao = 0;
};

export const deletarPaciente = async (id) => {
  try {
    // Carregar dados existentes
    const dadosExistentes = await AsyncStorage.getItem(STORAGE_KEY);
    const lista = dadosExistentes ? JSON.parse(dadosExistentes) : [];
    
    // Verificar se o ID existe
    const pacienteEncontrado = lista.find(paciente => paciente.id === id);
    
    if (!pacienteEncontrado) {
      // Log pode ser útil para debug de produção, mantendo apenas este
    }
    
    // Filtrar (remover o paciente)
    const novaLista = lista.filter(paciente => {
      const manter = paciente.id !== id;
      return manter;
    });
    
    // Salvar nova lista
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(novaLista));
    
    // Atualizar cache
    cacheMemoria = novaLista;
    ultimaAtualizacao = Date.now();
    
    // Verificar se foi realmente salvo
    const verificacao = await AsyncStorage.getItem(STORAGE_KEY);
    const listaVerificacao = verificacao ? JSON.parse(verificacao) : [];
    
    return novaLista;
  } catch (error) {
    console.error('❌ === ERRO na função deletarPaciente ===');
    console.error('❌ Erro:', error);
    console.error('❌ Stack:', error.stack);
    throw error;
  }
};

export const deletarTodosPacientes = async () => {
  try {
    // Método 1: Remover chave específica
    await AsyncStorage.removeItem(STORAGE_KEY);
    
    // Método 2: Limpar cache
    cacheMemoria = [];
    ultimaAtualizacao = Date.now();
    
    // Método 3: Verificar se foi realmente removido
    const verificacao = await AsyncStorage.getItem(STORAGE_KEY);
    
    if (verificacao !== null) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    }
    
    return [];
  } catch (error) {
    console.error('❌ Erro ao deletar todos os pacientes:', error);
    throw error;
  }
};

// Função para debug - limpar tudo durante desenvolvimento
export const limparTudoParaDebug = async () => {
  try {
    // Listar todas as chaves primeiro
    const todasChaves = await AsyncStorage.getAllKeys();
    
    // Limpar AsyncStorage COMPLETAMENTE
    await AsyncStorage.clear();
    
    // Limpar cache de memória
    limparCache();
    
    // Verificar se foi realmente limpo
    const chavesAposLimpeza = await AsyncStorage.getAllKeys();
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao limpar dados:', error);
    throw error;
  }
};

// Função adicional para debug - listar todos os dados
export const debugListarTudoNoStorage = async () => {
  try {
    const todasChaves = await AsyncStorage.getAllKeys();
    
    for (const chave of todasChaves) {
      const valor = await AsyncStorage.getItem(chave);
    }
    
    return todasChaves;
  } catch (error) {
    console.error('❌ Erro no debug:', error);
    return [];
  }
};
