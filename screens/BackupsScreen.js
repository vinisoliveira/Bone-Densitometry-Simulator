import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  RefreshControl,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { 
  listarBackups, 
  deletarBackup, 
  restaurarBackup,
  criarBackup 
} from '../utils/storage';
import CustomAlert from '../src/components/CustomAlert';
import { useCustomAlert } from '../src/hooks/useCustomAlert';
import { useTheme } from '../src/contexts/ThemeContext';

const BackupsScreen = ({ navigation }) => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { alertConfig, showAlert, hideAlert } = useCustomAlert();
  const { theme } = useTheme();
  
  // Estado para guardar ação pendente de confirmação
  const [pendingAction, setPendingAction] = useState(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const carregarBackups = async () => {
    try {
      const lista = await listarBackups();
      setBackups(lista);
    } catch (error) {
      console.error('Erro ao carregar backups:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    carregarBackups();
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    carregarBackups();
  };

  const handleCriarBackup = async () => {
    try {
      setLoading(true);
      const novoBackup = await criarBackup();
      showAlert({
        title: 'Backup Criado',
        message: `Backup "${novoBackup.nome}" criado com sucesso!\n\n• ${novoBackup.totalPacientes} pacientes salvos\n• ${novoBackup.totalImagens} imagens salvas`,
        type: 'success',
        buttons: [{ text: 'OK' }],
      });
      await carregarBackups();
    } catch (error) {
      showAlert({
        title: 'Erro',
        message: 'Não foi possível criar o backup.',
        type: 'error',
        buttons: [{ text: 'OK' }],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRestaurar = (backup) => {
    const executarRestauracao = async () => {
      try {
        setLoading(true);
        const resultado = await restaurarBackup(backup.id);
        showAlert({
          title: 'Backup Restaurado',
          message: `Dados restaurados com sucesso!\n\n• ${resultado.pacientesRestaurados} pacientes\n• ${resultado.imagensRestauradas} imagens`,
          type: 'success',
          buttons: [{ text: 'OK' }],
        });
      } catch (error) {
        showAlert({
          title: 'Erro',
          message: 'Não foi possível restaurar o backup.',
          type: 'error',
          buttons: [{ text: 'OK' }],
        });
      } finally {
        setLoading(false);
      }
    };

    // Salvar ação pendente e mostrar confirmação
    setPendingAction(() => executarRestauracao);
    showAlert({
      title: 'Restaurar Backup',
      message: `Deseja restaurar o backup "${backup.nome}"?\n\nIsso irá substituir todos os dados atuais da lista de exames pelos dados deste backup.\n\n• ${backup.totalPacientes} pacientes\n• ${backup.totalImagens} imagens`,
      type: 'warning',
      buttons: [
        { text: 'Cancelar', style: 'cancel', onPress: () => setPendingAction(null) },
        { 
          text: 'Restaurar', 
          style: 'default',
          onPress: () => {
            hideAlert();
            executarRestauracao();
          }
        },
      ],
    });
  };

  const handleDeletar = (backup) => {
    const executarExclusao = async () => {
      try {
        await deletarBackup(backup.id);
        showAlert({
          title: 'Sucesso',
          message: 'Backup excluído com sucesso.',
          type: 'success',
          buttons: [{ text: 'OK' }],
        });
        await carregarBackups();
      } catch (error) {
        showAlert({
          title: 'Erro',
          message: 'Não foi possível excluir o backup.',
          type: 'error',
          buttons: [{ text: 'OK' }],
        });
      }
    };

    showAlert({
      title: 'Excluir Backup',
      message: `Tem certeza que deseja excluir o backup "${backup.nome}"?\n\nATENÇÃO: Esta ação é IRREVERSÍVEL!\nO backup será permanentemente apagado e não poderá ser recuperado.`,
      type: 'warning',
      buttons: [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: () => {
            hideAlert();
            executarExclusao();
          }
        },
      ],
    });
  };

  const renderBackupItem = (backup, index) => (
    <Animated.View
      key={backup.id}
      style={[
        styles.backupCard,
        {
          backgroundColor: theme.surface,
          opacity: fadeAnim,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 30],
                outputRange: [0, 30 + index * 10],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.backupHeader}>
        <View style={styles.backupIconContainer}>
          <FontAwesome5 name="archive" size={20} color="#4A90E2" />
        </View>
        <View style={styles.backupInfo}>
          <Text style={[styles.backupNome, { color: theme.text }]}>{backup.nome}</Text>
          <Text style={[styles.backupData, { color: theme.textMuted }]}>{backup.dataFormatada}</Text>
        </View>
      </View>

      <View style={styles.backupStats}>
        <View style={styles.statItem}>
          <FontAwesome5 name="user" size={12} color={theme.textMuted} />
          <Text style={[styles.statText, { color: theme.textMuted }]}>{backup.totalPacientes} pacientes</Text>
        </View>
        <View style={styles.statItem}>
          <FontAwesome5 name="image" size={12} color={theme.textMuted} />
          <Text style={[styles.statText, { color: theme.textMuted }]}>{backup.totalImagens} imagens</Text>
        </View>
      </View>

      <View style={styles.backupActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.restaurarButton]}
          onPress={() => handleRestaurar(backup)}
          activeOpacity={0.7}
        >
          <FontAwesome5 name="undo" size={14} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Restaurar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deletarButton]}
          onPress={() => handleDeletar(backup)}
          activeOpacity={0.7}
        >
          <FontAwesome5 name="trash-alt" size={14} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.surfaceAlt || theme.surface }]}
          onPress={() => navigation.goBack()}
        >
          <FontAwesome5 name="arrow-left" size={20} color="#4A90E2" />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Backups</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.surfaceAlt || theme.surface }]}
          onPress={handleCriarBackup}
        >
          <FontAwesome5 name="plus" size={18} color="#4A90E2" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4A90E2"
            colors={['#4A90E2']}
          />
        }
      >
        {loading ? (
          <View style={styles.emptyContainer}>
            <FontAwesome5 name="spinner" size={40} color="#4A90E2" />
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>Carregando...</Text>
          </View>
        ) : backups.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIcon, { backgroundColor: theme.surface }]}>
              <FontAwesome5 name="archive" size={50} color={theme.textMuted} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Nenhum Backup</Text>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
              Você ainda não criou nenhum backup.{'\n'}
              Clique no botão + para criar seu primeiro backup.
            </Text>
          </View>
        ) : (
          <>
            <View style={[styles.infoBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <FontAwesome5 name="info-circle" size={16} color="#4A90E2" />
              <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                Os backups são salvos localmente e incluem todos os dados dos pacientes e imagens.
              </Text>
            </View>

            <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
              {backups.length} backup{backups.length !== 1 ? 's' : ''} salvos
            </Text>

            {backups.map((backup, index) => renderBackupItem(backup, index))}
          </>
        )}
      </ScrollView>

      {/* Botão flutuante para criar backup */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleCriarBackup}
        activeOpacity={0.8}
      >
        <FontAwesome5 name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Alert Customizado */}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        buttons={alertConfig.buttons}
        onClose={hideAlert}
      />
    </View>
  );
};

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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2a3142',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#999',
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  backupCard: {
    backgroundColor: '#2a3142',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  backupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  backupIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(74, 144, 226, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  backupInfo: {
    flex: 1,
  },
  backupNome: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  backupData: {
    fontSize: 13,
    color: '#999',
  },
  backupStats: {
    flexDirection: 'row',
    gap: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#3a3f52',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
    color: '#999',
  },
  backupActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  restaurarButton: {
    backgroundColor: '#4A90E2',
  },
  deletarButton: {
    backgroundColor: '#E74C3C',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2a3142',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default BackupsScreen;
