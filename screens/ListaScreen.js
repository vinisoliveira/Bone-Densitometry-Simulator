import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ListaScreen = ({ pacientes = [], navigation }) => {
  const listaSegura = Array.isArray(pacientes) ? pacientes : [];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📋 Exames Cadastrados</Text>

      {listaSegura.length === 0 ? (
        <Text style={styles.empty}>Nenhum exame cadastrado ainda.</Text>
      ) : (
        <FlatList
          data={listaSegura}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('Exame', item)}
            >
              <View style={styles.cardHeader}>
                <Ionicons name="person-circle" size={24} color="#00e6e6" />
                <Text style={styles.nome}>{item.nome}</Text>
              </View>
              <Text style={styles.info}>
                ID: {item.id} • {item.idade} anos • {item.sexo}
              </Text>
              <Text style={styles.exame}>Exame: {item.exame}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Ionicons name="home" size={20} color="#00e6e6" style={styles.icon} />
        <Text style={styles.buttonText}>Voltar para Início</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a1f44',
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: '#e6f2ff',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  empty: {
    color: '#aaa',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
  card: {
    backgroundColor: '#1e2a38',
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  nome: {
    color: '#e6f2ff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  info: {
    color: '#ccc',
    fontSize: 14,
  },
  exame: {
    color: '#00e6e6',
    fontSize: 14,
    marginTop: 4,
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
  buttonText: {
    color: '#e6f2ff',
    fontSize: 16,
    marginLeft: 10,
  },
  icon: {
    marginRight: 5,
  },
});

export default ListaScreen;
