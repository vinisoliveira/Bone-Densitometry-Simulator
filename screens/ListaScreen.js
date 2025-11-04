import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Animated, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { carregarPacientes, deletarPaciente, deletarTodosPacientes } from '../utils/storage';
import { colors, spacing, typography } from '../src/styles/theme';

// Componente animado para cada item
const AnimatedItem = ({ item, index, onPress, onDelete }) => {
  const itemFadeAnim = useRef(new Animated.Value(0)).current;
  const itemSlideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(index * 100),
      Animated.parallel([
        Animated.timing(itemFadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(itemSlideAnim, {
          toValue: 0,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: itemFadeAnim,
        transform: [{ translateY: itemSlideAnim }],
      }}
    >
      <View style={styles.cardWrapper}>
        <TouchableOpacity
          style={styles.card}
          onPress={onPress}
          activeOpacity={0.7}
        >
          <View style={styles.cardIcon}>
            <FontAwesome5 name="user-circle" size={32} color="#4A90E2" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.nome}>{item.nome}</Text>
            <View style={styles.exameContainer}>
              <FontAwesome5 name="file-medical-alt" size={12} color="#999" />
              <Text style={styles.exame}>{item.exame}</Text>
            </View>
          </View>
          <FontAwesome5 name="chevron-right" size={16} color="#666" />
        </TouchableOpacity>
        
        {/* Botão de Deletar */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={onDelete}
          activeOpacity={0.7}
        >
          <FontAwesome5 name="trash-alt" size={18} color="#FF4444" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default function ListaScreen({ navigation }) {
  const [pacientes, setPacientes] = useState([]);
  const [showDeleteAnimation, setShowDeleteAnimation] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const deleteSuccessAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchData = async () => {
      const lista = await carregarPacientes();
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
    const unsubscribe = navigation.addListener('focus', fetchData);
    return unsubscribe;
  }, [navigation]);

  const handleDelete = (id, nome) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente excluir o exame de ${nome}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const novaLista = await deletarPaciente(id);
              setPacientes(novaLista);
              
              // Animação de sucesso
              setShowDeleteAnimation(true);
              Animated.sequence([
                Animated.spring(deleteSuccessAnim, {
                  toValue: 1,
                  friction: 8,
                  useNativeDriver: true,
                }),
              ]).start();

              setTimeout(() => {
                deleteSuccessAnim.setValue(0);
                setShowDeleteAnimation(false);
              }, 1500);
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o exame');
            }
          }
        }
      ]
    );
  };

  const handleDeleteAll = () => {
    Alert.alert(
      'Confirmar Exclusão em Massa',
      'Deseja realmente excluir TODOS os exames? Esta ação não pode ser desfeita.',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Excluir Todos',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletarTodosPacientes();
              setPacientes([]);
              
              // Animação de sucesso
              setShowDeleteAnimation(true);
              Animated.sequence([
                Animated.spring(deleteSuccessAnim, {
                  toValue: 1,
                  friction: 8,
                  useNativeDriver: true,
                }),
              ]).start();

              setTimeout(() => {
                deleteSuccessAnim.setValue(0);
                setShowDeleteAnimation(false);
              }, 1500);
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir os exames');
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item, index }) => {
    return (
      <AnimatedItem
        item={item}
        index={index}
        onPress={() => navigation.navigate('Resultado', { 
          paciente: item.nome, 
          exame: item.exame,
          idade: item.idade,
          sexo: item.sexo,
          etnia: item.etnia,
        })}
        onDelete={() => handleDelete(item.id, item.nome)}
      />
    );
  };

  return (
    <View style={styles.container}>
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
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <FontAwesome5 name="arrow-left" size={20} color="#4A90E2" />
        </TouchableOpacity>
        <Text style={styles.title}>Lista de Exames</Text>
        <TouchableOpacity 
          style={styles.addButton}
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
          <Text style={styles.emptyText}>Nenhum exame cadastrado</Text>
          <Text style={styles.emptySubtext}>
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
        <>
          <FlatList
            data={pacientes}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
          
          {/* Botão para deletar todos */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.deleteAllButton}
              onPress={handleDeleteAll}
              activeOpacity={0.8}
            >
              <FontAwesome5 name="trash" size={16} color="#FFFFFF" />
              <Text style={styles.deleteAllText}>Excluir Todos ({pacientes.length})</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Animação de Sucesso ao Deletar */}
      {showDeleteAnimation && (
        <View style={styles.deleteOverlay}>
          <Animated.View
            style={[
              styles.deleteCircle,
              {
                transform: [{ scale: deleteSuccessAnim }],
                opacity: deleteSuccessAnim,
              },
            ]}
          >
            <FontAwesome5 name="check" size={40} color="#FFFFFF" />
          </Animated.View>
          <Animated.Text
            style={[
              styles.deleteText,
              {
                opacity: deleteSuccessAnim,
              },
            ]}
          >
            Excluído com Sucesso!
          </Animated.Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1d29',
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
    textAlign: 'center',
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
  },
  cardWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: 8,
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a3142',
    borderRadius: 12,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  deleteButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 68, 68, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 68, 68, 0.3)',
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
    color: '#FFFFFF',
    marginBottom: 4,
  },
  exameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  exame: {
    fontSize: 13,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    fontSize: 18,
    color: '#FFFFFF',
    marginTop: spacing.lg,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
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
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1a1d29',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#3a3f52',
  },
  deleteAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF4444',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 10,
  },
  deleteAllText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  deleteOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(26, 29, 41, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  deleteCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  deleteText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 20,
  },
});
