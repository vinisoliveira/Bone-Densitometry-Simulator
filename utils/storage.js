import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'PACIENTES';
const IMAGENS_KEY = 'IMAGENS_EXAMES';

// Função para gerar hash único para imagem
export const gerarHashImagem = () => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  const randomPart2 = Math.random().toString(36).substring(2, 6);
  return `IMG_${timestamp}_${randomPart}${randomPart2}`.toUpperCase();
};

// Salvar imagem no storage com hash
export const salvarImagemExame = async (uri, tipoExame) => {
  try {
    const hash = gerarHashImagem();
    const dadosImagem = {
      hash,
      uri,
      tipoExame,
      dataCriacao: new Date().toISOString(),
    };
    
    // Carregar imagens existentes
    const imagensExistentes = await AsyncStorage.getItem(IMAGENS_KEY);
    const listaImagens = imagensExistentes ? JSON.parse(imagensExistentes) : [];
    
    // Adicionar nova imagem
    listaImagens.push(dadosImagem);
    await AsyncStorage.setItem(IMAGENS_KEY, JSON.stringify(listaImagens));
    
    return dadosImagem;
  } catch (error) {
    console.error('Erro ao salvar imagem:', error);
    return null;
  }
};

// Buscar imagem pelo hash
export const buscarImagemPorHash = async (hash) => {
  try {
    const imagensExistentes = await AsyncStorage.getItem(IMAGENS_KEY);
    const listaImagens = imagensExistentes ? JSON.parse(imagensExistentes) : [];
    return listaImagens.find(img => img.hash === hash) || null;
  } catch (error) {
    console.error('Erro ao buscar imagem:', error);
    return null;
  }
};

// Deletar imagem pelo hash
export const deletarImagemPorHash = async (hash) => {
  try {
    const imagensExistentes = await AsyncStorage.getItem(IMAGENS_KEY);
    const listaImagens = imagensExistentes ? JSON.parse(imagensExistentes) : [];
    const novaLista = listaImagens.filter(img => img.hash !== hash);
    await AsyncStorage.setItem(IMAGENS_KEY, JSON.stringify(novaLista));
    return true;
  } catch (error) {
    console.error('Erro ao deletar imagem:', error);
    return false;
  }
};

// Listar todas as imagens
export const listarTodasImagens = async () => {
  try {
    const imagensExistentes = await AsyncStorage.getItem(IMAGENS_KEY);
    return imagensExistentes ? JSON.parse(imagensExistentes) : [];
  } catch (error) {
    console.error('Erro ao listar imagens:', error);
    return [];
  }
};

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

export const atualizarPaciente = async (pacienteAtualizado) => {
  try {
    const dadosExistentes = await AsyncStorage.getItem(STORAGE_KEY);
    const lista = dadosExistentes ? JSON.parse(dadosExistentes) : [];
    
    const index = lista.findIndex(p => p.id === pacienteAtualizado.id);
    if (index !== -1) {
      lista[index] = { ...lista[index], ...pacienteAtualizado };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
      cacheMemoria = lista;
      ultimaAtualizacao = Date.now();
    }
    return lista[index];
  } catch (error) {
    console.error('Erro ao atualizar paciente:', error);
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

// =============================================
// SISTEMA DE BACKUP
// =============================================

const BACKUPS_KEY = 'BACKUPS_LISTA';

// Gerar ID único para backup
const gerarIdBackup = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `BKP_${timestamp}_${random}`.toUpperCase();
};

// Criar um novo backup
export const criarBackup = async (nomeBackup = null) => {
  try {
    // Carregar dados atuais dos pacientes e imagens
    const pacientesData = await AsyncStorage.getItem(STORAGE_KEY);
    const imagensData = await AsyncStorage.getItem(IMAGENS_KEY);
    
    const pacientes = pacientesData ? JSON.parse(pacientesData) : [];
    const imagens = imagensData ? JSON.parse(imagensData) : [];
    
    // Criar objeto de backup
    const dataAtual = new Date();
    const backup = {
      id: gerarIdBackup(),
      nome: nomeBackup || `Backup ${dataAtual.toLocaleDateString('pt-BR')}`,
      dataCriacao: dataAtual.toISOString(),
      dataFormatada: dataAtual.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      totalPacientes: pacientes.length,
      totalImagens: imagens.length,
      dados: {
        pacientes,
        imagens,
      },
    };
    
    // Carregar lista de backups existentes
    const backupsData = await AsyncStorage.getItem(BACKUPS_KEY);
    const backups = backupsData ? JSON.parse(backupsData) : [];
    
    // Adicionar novo backup
    backups.unshift(backup); // Adiciona no início (mais recente primeiro)
    
    // Salvar lista atualizada
    await AsyncStorage.setItem(BACKUPS_KEY, JSON.stringify(backups));
    
    return backup;
  } catch (error) {
    console.error('❌ Erro ao criar backup:', error);
    throw error;
  }
};

// Listar todos os backups
export const listarBackups = async () => {
  try {
    const backupsData = await AsyncStorage.getItem(BACKUPS_KEY);
    const backups = backupsData ? JSON.parse(backupsData) : [];
    
    // Retornar lista sem os dados completos (para performance)
    return backups.map(backup => ({
      id: backup.id,
      nome: backup.nome,
      dataCriacao: backup.dataCriacao,
      dataFormatada: backup.dataFormatada,
      totalPacientes: backup.totalPacientes,
      totalImagens: backup.totalImagens,
    }));
  } catch (error) {
    console.error('❌ Erro ao listar backups:', error);
    return [];
  }
};

// Buscar backup completo por ID
export const buscarBackupPorId = async (backupId) => {
  try {
    const backupsData = await AsyncStorage.getItem(BACKUPS_KEY);
    const backups = backupsData ? JSON.parse(backupsData) : [];
    return backups.find(b => b.id === backupId) || null;
  } catch (error) {
    console.error('❌ Erro ao buscar backup:', error);
    return null;
  }
};

// Restaurar backup
export const restaurarBackup = async (backupId) => {
  try {
    // Buscar backup
    const backup = await buscarBackupPorId(backupId);
    
    if (!backup) {
      throw new Error('Backup não encontrado');
    }
    
    // Restaurar dados dos pacientes
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(backup.dados.pacientes));
    
    // Restaurar dados das imagens
    await AsyncStorage.setItem(IMAGENS_KEY, JSON.stringify(backup.dados.imagens));
    
    // Limpar cache
    limparCache();
    
    return {
      success: true,
      pacientesRestaurados: backup.dados.pacientes.length,
      imagensRestauradas: backup.dados.imagens.length,
    };
  } catch (error) {
    console.error('❌ Erro ao restaurar backup:', error);
    throw error;
  }
};

// Deletar backup
export const deletarBackup = async (backupId) => {
  try {
    const backupsData = await AsyncStorage.getItem(BACKUPS_KEY);
    const backups = backupsData ? JSON.parse(backupsData) : [];
    
    const novosBackups = backups.filter(b => b.id !== backupId);
    
    await AsyncStorage.setItem(BACKUPS_KEY, JSON.stringify(novosBackups));
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao deletar backup:', error);
    throw error;
  }
};

// Deletar todos os backups
export const deletarTodosBackups = async () => {
  try {
    await AsyncStorage.removeItem(BACKUPS_KEY);
    return true;
  } catch (error) {
    console.error('❌ Erro ao deletar todos os backups:', error);
    throw error;
  }
};
