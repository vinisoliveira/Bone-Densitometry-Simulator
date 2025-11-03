import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, StatusBar, Platform } from 'react-native';
import { useTheme } from '../src/context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function ListaScreen({ navigation, pacientes = [] }) {
  const { theme, isDarkMode } = useTheme();

  const handleGoBack = () => {
    if (navigation && typeof navigation.goBack === 'function') {
      navigation.goBack();
    } else if (Platform.OS === 'web' && window.history) {
      window.history.back();
    }
  };

  const confirmarExclusao = (pacienteId, nomePaciente) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`Deseja excluir o paciente ${nomePaciente}?`)) {
        // Implementar exclusão
        alert('Paciente excluído com sucesso!');
      }
    }
  };

  const renderPaciente = ({ item }) => (
    <View style={[styles.pacienteCard, { 
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.border,
      ...theme.shadows.md,
    }]}>
      <View style={styles.pacienteHeader}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryLight]}
          style={styles.avatarGradient}
        >
          <Text style={styles.avatarText}>
            {item.nome.charAt(0).toUpperCase()}
          </Text>
        </LinearGradient>
        
        <View style={styles.pacienteInfo}>
          <Text style={[styles.pacienteNome, { color: theme.colors.text }]}>
            {item.nome}
          </Text>
          <View style={styles.infoRow}>
            <Text style={[styles.infoTag, { 
              backgroundColor: theme.colors.info + (isDarkMode ? '30' : '20'),
              color: theme.colors.info,
            }]}>
              {item.idade} anos
            </Text>
            <Text style={[styles.infoTag, { 
              backgroundColor: theme.colors.secondary + (isDarkMode ? '30' : '20'),
              color: theme.colors.secondary,
            }]}>
              {item.sexo}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={[styles.deleteButton, { 
            backgroundColor: theme.colors.error + (isDarkMode ? '20' : '15'),
          }]}
          onPress={() => confirmarExclusao(item.id, item.nome)}
          activeOpacity={0.7}
        >
          <Text style={styles.deleteIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>
      
      <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
      
      <View style={styles.pacienteBody}>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
            Etnia
          </Text>
          <Text style={[styles.detailValue, { color: theme.colors.text }]}>
            {item.etnia}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
            Exame
          </Text>
          <Text style={[styles.detailValue, { color: theme.colors.text }]}>
            {item.exame}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
            Data
          </Text>
          <Text style={[styles.detailValue, { color: theme.colors.text }]}>
            {item.dataExame}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.examButton, { 
          backgroundColor: theme.colors.primary,
          ...theme.shadows.sm,
        }]}
        onPress={() => navigation.navigate('Scan', item)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.examButtonGradient}
        >
          <Text style={styles.examButtonIcon}>🔬</Text>
          <Text style={styles.examButtonText}>Iniciar Análise</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const EmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={[theme.colors.primary + '20', theme.colors.primaryLight + '20']}
        style={styles.emptyIconContainer}
      >
        <Text style={styles.emptyIcon}>📋</Text>
      </LinearGradient>
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        Nenhum Paciente Cadastrado
      </Text>
      <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
        Comece cadastrando o primeiro paciente para realizar exames de densitometria óssea
      </Text>
      <TouchableOpacity
        style={[styles.emptyButton, { 
          backgroundColor: theme.colors.primary,
          ...theme.shadows.lg,
        }]}
        onPress={() => navigation.navigate('Cadastro')}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[theme.colors.secondary, theme.colors.secondaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.emptyButtonGradient}
        >
          <Text style={styles.emptyButtonIcon}>➕</Text>
          <Text style={styles.emptyButtonText}>Cadastrar Primeiro Paciente</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.colors.background}
      />
      
      {/* Header */}
      <LinearGradient
        colors={isDarkMode 
          ? [theme.colors.backgroundLight, theme.colors.surface] 
          : [theme.colors.primary, theme.colors.primaryLight]}
        style={styles.header}
      >
        <TouchableOpacity 
          style={[styles.backButton, { 
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)',
          }]}
          onPress={handleGoBack}
          activeOpacity={0.7}
        >
          <Text style={[styles.backArrow, { 
            color: isDarkMode ? theme.colors.textPrimary : '#FFFFFF' 
          }]}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <View style={[styles.headerIconContainer, { 
            backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.2)',
          }]}>
            <Text style={styles.headerIcon}>👥</Text>
          </View>
          <View>
            <Text style={[styles.headerTitle, { 
              color: isDarkMode ? theme.colors.textPrimary : '#FFFFFF' 
            }]}>
              Pacientes
            </Text>
            <Text style={[styles.headerSubtitle, { 
              color: isDarkMode ? theme.colors.textSecondary : 'rgba(255, 255, 255, 0.8)' 
            }]}>
              {pacientes.length} {pacientes.length === 1 ? 'cadastro' : 'cadastros'}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={[styles.addButton, { 
            backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.2)',
          }]}
          onPress={() => navigation.navigate('Cadastro')}
          activeOpacity={0.7}
        >
          <Text style={[styles.addIcon, { 
            color: isDarkMode ? theme.colors.secondary : '#FFFFFF' 
          }]}>➕</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Lista */}
      <FlatList
        data={pacientes}
        renderItem={renderPaciente}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={EmptyComponent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  backArrow: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerIcon: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIcon: {
    fontSize: 22,
  },
  listContainer: {
    padding: 20,
    flexGrow: 1,
  },
  pacienteCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
  },
  pacienteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarGradient: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  pacienteInfo: {
    flex: 1,
  },
  pacienteNome: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 8,
  },
  infoTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIcon: {
    fontSize: 18,
  },
  divider: {
    height: 1,
    marginBottom: 16,
  },
  pacienteBody: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  examButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  examButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  examButtonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  examButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyIcon: {
    fontSize: 56,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  emptyButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 28,
  },
  emptyButtonIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
