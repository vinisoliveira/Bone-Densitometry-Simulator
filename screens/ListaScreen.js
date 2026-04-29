import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { carregarPacientes } from '../utils/storage';
import { colors, spacing, typography } from '../src/styles/theme';
import { useTheme } from '../src/contexts/ThemeContext';

export default function ListaScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const [pacientes, setPacientes] = useState([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    const fetchData = async () => {
      console.log('🔄 ListaScreen: Carregando lista de exames...');
      const lista = await carregarPacientes();
      console.log('📋 ListaScreen: Total de exames:', lista.length);
      setPacientes(lista);
      
      // Animações de entrada
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
    };
    
    // Carrega dados quando a tela recebe foco
    const unsubscribe = navigation.addListener('focus', fetchData);
    
    // Também carrega na montagem inicial
    fetchData();
    
    return unsubscribe;
  }, [navigation]);



  const renderItem = ({ item, index }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('ExameDetalhe', { 
          id: item.id,
          nome: item.nome, 
          idade: item.idade,
          sexo: item.sexo,
          etnia: item.etnia,
          exame: item.exame,
          vertebraSelecionada: item.vertebraSelecionada,
          dataCriacao: item.dataCriacao,
          imagemCustomizada: item.imagemCustomizada,
          imagemHash: item.imagemHash,
        })}
        activeOpacity={0.7}
      >
        <View style={styles.cardIcon}>
          <FontAwesome5 name="user-circle" size={32} color="#4A90E2" />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.nome}>{item.nome}</Text>
          <View style={styles.exameContainer}>
            <FontAwesome5 name="file-medical-alt" size={12} color={theme.textMuted} />
            <Text style={styles.exame}>{item.exame}</Text>
          </View>
        </View>
        <FontAwesome5 name="chevron-right" size={16} color={theme.textMuted} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: theme.surface }]}
          onPress={() => navigation.navigate('Home')}
        >
          <FontAwesome5 name="arrow-left" size={20} color="#4A90E2" />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Lista de Exames</Text>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: theme.surface }]}
          onPress={() => navigation.navigate('Cadastro')}
        >
          <FontAwesome5 name="plus" size={20} color="#4A90E2" />
        </TouchableOpacity>
      </Animated.View>

      {pacientes.length === 0 ? (
        <Animated.View 
          style={[
            styles.emptyContainer,
            { opacity: fadeAnim }
          ]}
        >
          <FontAwesome5 name="folder-open" size={64} color="#4A90E2" />
          <Text style={[styles.emptyText, { color: theme.text }]}>Nenhum exame cadastrado</Text>
          <Text style={[styles.emptySubtext, { color: theme.textMuted }]}>
            Adicione um novo exame para começar
          </Text>
          <TouchableOpacity 
            style={styles.emptyButton}
            onPress={() => navigation.navigate('Cadastro')}
            activeOpacity={0.8}
          >
            <FontAwesome5 name="plus" size={16} color="#FFFFFF" />
            <Text style={styles.emptyButtonText}>Adicionar Exame</Text>
          </TouchableOpacity>
        </Animated.View>
      ) : (
        <FlatList
          data={pacientes}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.xl * 1.5,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text,
    textAlign: 'center',
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(74, 144, 226, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  cardContent: {
    flex: 1,
  },
  nome: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  exameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  exame: {
    fontSize: 13,
    color: theme.textMuted,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    fontSize: 18,
    color: theme.text,
    marginTop: spacing.lg,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.textMuted,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 25,
    gap: spacing.sm,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
